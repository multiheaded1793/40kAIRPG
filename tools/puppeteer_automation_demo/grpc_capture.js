const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        console.log('Fetching browser WS endpoint...');
        const versionInfo = await fetchJson('http://localhost:9222/json/version');
        const browserWSEndpoint = versionInfo.webSocketDebuggerUrl;

        console.log('Connecting to browser...');
        const browser = await puppeteer.connect({
            browserWSEndpoint,
            defaultViewport: null
        });

        console.log('Locating Manager page...');
        const targets = await browser.targets();
        let managerPage = null;

        for (const t of targets) {
            if (t.type() === 'page' || t.type() === 'webview') {
                try {
                    const p = await t.page();
                    if (p && await p.title() === 'Manager') {
                        managerPage = p;
                    }
                } catch (e) { /* ignore */ }
            }
        }

        if (!managerPage) {
            console.error('Manager page not found!');
            await browser.disconnect();
            return;
        }

        console.log('Found Manager page.');
        await managerPage.bringToFront().catch(() => { });

        // ──────────────────────────────────────────────
        // 1. Set up CDP Network interception
        // ──────────────────────────────────────────────
        const cdp = await managerPage.target().createCDPSession();

        // Enable Network domain with request body capture
        await cdp.send('Network.enable', {
            maxTotalBufferSize: 10 * 1024 * 1024,  // 10MB buffer
            maxResourceBufferSize: 5 * 1024 * 1024, // 5MB per resource
        });

        // Enable Fetch domain to intercept request bodies
        await cdp.send('Fetch.enable', {
            patterns: [
                { urlPattern: '*LanguageServerService*', requestStage: 'Request' },
            ],
        });

        const capturedRequests = {};  // requestId -> { url, method, headers, postData, ... }
        const capturedResponses = {}; // requestId -> { status, headers, body, ... }
        const grpcEndpoints = [
            'SendUserCascadeMessage',
            'GetCascadeTrajectory',
            'StreamCascadeReactiveUpdates',
            'UpdateConversationAnnotations',
        ];

        // Intercept requests via Fetch domain (gives us the POST body)
        cdp.on('Fetch.requestPaused', async (params) => {
            const { requestId, request, resourceType } = params;
            const url = request.url;
            const endpoint = grpcEndpoints.find(ep => url.includes(ep)) || 'unknown';

            console.log(`  [INTERCEPTED] ${request.method} ${endpoint}`);

            capturedRequests[requestId] = {
                ts: Date.now(),
                url,
                endpoint,
                method: request.method,
                headers: request.headers,
                postData: request.postData || null,
                hasPostData: request.hasPostData || false,
            };

            // If there's a post body that wasn't included inline, fetch it
            if (request.hasPostData && !request.postData) {
                try {
                    const bodyResult = await cdp.send('Fetch.getRequestBody', { requestId });
                    capturedRequests[requestId].postData = bodyResult.body;
                    capturedRequests[requestId].postDataBase64 = bodyResult.base64Encoded;
                } catch (e) {
                    capturedRequests[requestId].postDataError = e.message;
                }
            }

            // Continue the request without modification
            await cdp.send('Fetch.continueRequest', { requestId });
        });

        // Capture response headers via Network domain
        cdp.on('Network.responseReceived', (params) => {
            const { requestId, response } = params;
            const url = response.url;
            const endpoint = grpcEndpoints.find(ep => url.includes(ep));
            if (!endpoint) return;

            console.log(`  [RESPONSE HEADERS] ${endpoint} ${response.status}`);

            capturedResponses[requestId] = {
                ts: Date.now(),
                url,
                endpoint,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                mimeType: response.mimeType,
            };
        });

        // Capture response body when loading finishes
        cdp.on('Network.loadingFinished', async (params) => {
            const { requestId } = params;
            if (!capturedResponses[requestId]) return;

            const endpoint = capturedResponses[requestId].endpoint;
            console.log(`  [RESPONSE BODY] ${endpoint} loading finished`);

            try {
                const bodyResult = await cdp.send('Network.getResponseBody', { requestId });
                capturedResponses[requestId].body = bodyResult.body;
                capturedResponses[requestId].base64Encoded = bodyResult.base64Encoded;
                capturedResponses[requestId].bodyLength = bodyResult.body.length;
            } catch (e) {
                capturedResponses[requestId].bodyError = e.message;
            }
        });

        // Capture failed requests
        cdp.on('Network.loadingFailed', (params) => {
            const { requestId, errorText } = params;
            if (capturedResponses[requestId]) {
                capturedResponses[requestId].error = errorText;
            }
        });

        console.log('CDP Network + Fetch interception ready.');

        // ──────────────────────────────────────────────
        // 2. Navigate to conversation and send prompt
        // ──────────────────────────────────────────────
        const workspace = 'Antigravity_backup';
        const conversation = 'Agent Test 1';
        const prompt = 'Continue with a random fact about US history';

        console.log(`Expanding workspace '${workspace}'...`);

        const workspaceBox = await managerPage.evaluate((wsName) => {
            const spans = Array.from(document.querySelectorAll('span.truncate'));
            const targetSpan = spans.find(s => !s.hasAttribute('data-testid') && s.textContent.trim() === wsName);
            if (!targetSpan) return null;
            const container = targetSpan.closest('.group');
            if (!container) return null;
            const chevronRight = container.querySelector('.lucide-chevron-right');
            if (chevronRight) {
                const rect = chevronRight.getBoundingClientRect();
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            }
            return 'expanded';
        }, workspace);

        if (workspaceBox && workspaceBox !== 'expanded') {
            await managerPage.mouse.click(workspaceBox.x, workspaceBox.y);
        }

        await delay(1500);

        console.log(`Clicking conversation '${conversation}'...`);

        const convoBox = await managerPage.evaluate((convoName) => {
            const convoSpans = Array.from(document.querySelectorAll('span[data-testid^="convo-pill-"]'));
            const targetConvo = convoSpans.find(s => s.textContent.trim().includes(convoName));
            if (!targetConvo) return null;
            const btn = targetConvo.closest('button');
            const targetNode = btn || targetConvo;
            const rect = targetNode.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }, conversation);

        if (!convoBox) {
            console.error(`Conversation '${conversation}' not found!`);
            await browser.disconnect();
            return;
        }

        await managerPage.mouse.click(convoBox.x, convoBox.y);
        await delay(2000);

        console.log('Injecting prompt via paste...');

        const editorSelector = 'div[role="textbox"][data-lexical-editor="true"]';
        await managerPage.waitForSelector(editorSelector, { timeout: 5000 });
        await managerPage.click(editorSelector);

        await managerPage.keyboard.down('Control');
        await managerPage.keyboard.press('A');
        await managerPage.keyboard.up('Control');
        await managerPage.keyboard.press('Backspace');

        await managerPage.evaluate((text, selector) => {
            const editor = document.querySelector(selector);
            if (editor) {
                const dataTransfer = new DataTransfer();
                dataTransfer.setData('text/plain', text);
                const pasteEvent = new ClipboardEvent('paste', {
                    clipboardData: dataTransfer,
                    bubbles: true,
                    cancelable: true
                });
                editor.dispatchEvent(pasteEvent);
            }
        }, prompt, editorSelector);

        await delay(500);

        console.log('Pressing Enter to send...');
        await managerPage.keyboard.press('Enter');

        // ──────────────────────────────────────────────
        // 3. Wait for response completion (~30s)
        // ──────────────────────────────────────────────
        console.log('Waiting 45 seconds for full response lifecycle...');

        const startTime = Date.now();
        const listenDuration = 45000;

        const progressInterval = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const reqCount = Object.keys(capturedRequests).length;
            const resCount = Object.keys(capturedResponses).length;
            process.stdout.write(`\r  ${elapsed}s elapsed | ${reqCount} requests | ${resCount} responses captured`);
        }, 2000);

        await delay(listenDuration);
        clearInterval(progressInterval);
        console.log('\nCollection complete.');

        // ──────────────────────────────────────────────
        // 4. Save captured data
        // ──────────────────────────────────────────────
        const output = {
            metadata: {
                workspace,
                conversation,
                prompt,
                startTime: new Date(startTime).toISOString(),
                duration: '45s',
                totalRequests: Object.keys(capturedRequests).length,
                totalResponses: Object.keys(capturedResponses).length,
            },
            requests: capturedRequests,
            responses: capturedResponses,
        };

        const outPath = 'grpc_capture.json';
        fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
        console.log(`Full capture saved to ${outPath}`);

        // Print summary
        console.log('\n=== CAPTURE SUMMARY ===');

        const allEndpoints = new Set([
            ...Object.values(capturedRequests).map(r => r.endpoint),
            ...Object.values(capturedResponses).map(r => r.endpoint),
        ]);

        for (const ep of allEndpoints) {
            console.log(`\n--- ${ep} ---`);

            const reqs = Object.entries(capturedRequests).filter(([, r]) => r.endpoint === ep);
            console.log(`  Requests: ${reqs.length}`);
            for (const [id, req] of reqs) {
                console.log(`    [${new Date(req.ts).toISOString().slice(11, 23)}] ${req.method}`);
                console.log(`    Headers: ${JSON.stringify(Object.fromEntries(
                    Object.entries(req.headers).filter(([k]) =>
                        ['content-type', 'x-grpc-web', 'x-user-agent', 'grpc-timeout', 'authorization'].includes(k.toLowerCase())
                    )
                ))}`);
                if (req.postData) {
                    const preview = req.postDataBase64
                        ? `[base64, ${req.postData.length} chars]`
                        : req.postData.slice(0, 500);
                    console.log(`    Body: ${preview}`);
                }
            }

            const resps = Object.entries(capturedResponses).filter(([, r]) => r.endpoint === ep);
            console.log(`  Responses: ${resps.length}`);
            for (const [id, resp] of resps) {
                console.log(`    [${new Date(resp.ts).toISOString().slice(11, 23)}] ${resp.status} ${resp.mimeType || ''}`);
                if (resp.body) {
                    const preview = resp.base64Encoded
                        ? `[base64, ${resp.body.length} chars]`
                        : resp.body.slice(0, 500);
                    console.log(`    Body: ${preview}`);
                } else if (resp.bodyError) {
                    console.log(`    Body error: ${resp.bodyError}`);
                }
            }
        }

        console.log('\nDisconnecting...');
        await cdp.detach();
        await browser.disconnect();
        console.log('Done.');

    } catch (error) {
        console.error('Script failed:', error);
    }
})();
