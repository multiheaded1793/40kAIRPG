/**
 * direct_api.js — Call the Antigravity Agent Manager gRPC-web API directly.
 *
 * Usage:
 *   node direct_api.js --list
 *   node direct_api.js <cascadeId> "<prompt>"
 *
 * Connects via Puppeteer to the Manager page to:
 *   1. Discover the backend base URL (port rotates per session)
 *   2. Extract the CSRF token by intercepting a real network request
 * Then makes all API calls via fetch() from within the page context.
 */

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

async function getManagerPage() {
    const versionInfo = await fetchJson('http://localhost:9222/json/version');
    const browser = await puppeteer.connect({
        browserWSEndpoint: versionInfo.webSocketDebuggerUrl,
        defaultViewport: null
    });

    const targets = await browser.targets();
    for (const t of targets) {
        if (t.type() === 'page' || t.type() === 'webview') {
            try {
                const p = await t.page();
                if (p && await p.title() === 'Manager') return { browser, page: p };
            } catch (e) { /* ignore */ }
        }
    }
    throw new Error('Manager page not found!');
}

(async () => {
    const cascadeId = process.argv[2];
    const prompt = process.argv[3];

    if (!cascadeId || (!prompt && cascadeId !== '--list')) {
        console.error('Usage: node direct_api.js <cascadeId> "<prompt>"');
        console.error('       node direct_api.js --list');
        process.exit(1);
    }

    try {
        console.log('Connecting to Manager page...');
        const { browser, page: managerPage } = await getManagerPage();

        // ── List mode ──
        if (cascadeId === '--list') {
            console.log('Listing conversations...\n');
            const convos = await managerPage.evaluate(() => {
                const pills = Array.from(document.querySelectorAll('span[data-testid^="convo-pill-"]'));
                return pills.map(p => ({
                    id: p.getAttribute('data-testid').replace('convo-pill-', ''),
                    title: p.textContent.trim(),
                }));
            });
            convos.forEach(c => console.log(`  ${c.id}  ${c.title}`));
            if (convos.length === 0) console.log('  (no conversations visible in sidebar)');
            await browser.disconnect();
            return;
        }

        // ── Discover backend URL ──
        console.log('Discovering backend URL...');
        const baseUrl = await managerPage.evaluate(() => {
            const perfEntries = performance.getEntriesByType('resource');
            for (const entry of perfEntries) {
                if (entry.name.includes('LanguageServerService')) {
                    return new URL(entry.name).origin;
                }
            }
            return null;
        });

        if (!baseUrl) {
            console.error('Cannot discover backend URL. Make sure a conversation has been opened recently.');
            await browser.disconnect();
            return;
        }
        console.log(`Backend URL: ${baseUrl}`);

        // ── Extract CSRF token via CDP Fetch domain (operates below JS, immune to caching) ──
        console.log('Extracting CSRF token...');
        const cdp = await managerPage.target().createCDPSession();

        // Enable Fetch interception at the Chrome level for LanguageServerService requests
        await cdp.send('Fetch.enable', {
            patterns: [{ urlPattern: '*LanguageServerService*', requestStage: 'Request' }],
        });

        // Promise to resolve with the CSRF token
        let csrfResolve;
        const csrfPromise = new Promise(r => { csrfResolve = r; });

        cdp.on('Fetch.requestPaused', async (params) => {
            const csrf = params.request.headers['x-codeium-csrf-token'];
            // Continue the request regardless so the app isn't blocked
            try { await cdp.send('Fetch.continueRequest', { requestId: params.requestId }); } catch (e) { }
            if (csrf) csrfResolve(csrf);
        });

        // Trigger a real app-initiated request via native mouse click on a conversation pill
        const pillBox = await managerPage.evaluate(() => {
            const pill = document.querySelector('span[data-testid^="convo-pill-"]');
            if (!pill) return null;
            const btn = pill.closest('button');
            const target = btn || pill;
            const rect = target.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        });

        if (pillBox) {
            await managerPage.mouse.click(pillBox.x, pillBox.y);
        }

        // Wait up to 10s for the CSRF token
        let csrfToken = await Promise.race([
            csrfPromise,
            delay(10000).then(() => null),
        ]);

        // Disable Fetch interception
        try { await cdp.send('Fetch.disable'); } catch (e) { }

        if (!csrfToken) {
            console.error('Could not extract CSRF token. The app may not have made any requests yet.');
            await cdp.detach();
            await browser.disconnect();
            return;
        }
        console.log(`CSRF token: ${csrfToken.slice(0, 12)}...`);

        // ── Helper: make an API call from within the page context ──
        async function apiCall(endpoint, body) {
            return managerPage.evaluate(async (baseUrl, endpoint, body, csrfToken) => {
                const url = `${baseUrl}/exa.language_server_pb.LanguageServerService/${endpoint}`;
                try {
                    const resp = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-codeium-csrf-token': csrfToken,
                        },
                        body: JSON.stringify(body),
                    });
                    const text = await resp.text();
                    let data;
                    try { data = JSON.parse(text); } catch { data = text; }
                    return { status: resp.status, data };
                } catch (e) {
                    return { error: e.message };
                }
            }, baseUrl, endpoint, body, csrfToken);
        }

        // ── Step 1: Send the user message ──
        console.log(`\n[1/3] Sending prompt: "${prompt}"`);

        const sendResult = await apiCall('SendUserCascadeMessage', {
            cascadeId,
            items: [{ text: prompt }],
            metadata: {
                ideName: 'antigravity',
                locale: 'en',
                ideVersion: '1.18.3',
                extensionName: 'antigravity',
            },
            cascadeConfig: {
                plannerConfig: {
                    conversational: {
                        plannerMode: 'CONVERSATIONAL_PLANNER_MODE_DEFAULT',
                        agenticMode: true,
                    },
                    toolConfig: {
                        runCommand: {
                            autoCommandConfig: {
                                userAllowlist: [],
                                autoExecutionPolicy: 'CASCADE_COMMANDS_AUTO_EXECUTION_EAGER',
                            },
                        },
                        notifyUser: {
                            artifactReviewMode: 'ARTIFACT_REVIEW_MODE_AUTO',
                        },
                    },
                    requestedModel: { model: 'MODEL_PLACEHOLDER_M26' },
                },
            },
        });

        console.log(`  SendUserCascadeMessage: ${sendResult.status} ${JSON.stringify(sendResult.data)}`);

        if (sendResult.error || sendResult.status !== 200) {
            console.error('Failed to send message!');
            await cdp.detach();
            await browser.disconnect();
            return;
        }

        // ── Step 2: Update annotations ──
        console.log('[2/3] Updating conversation annotations...');

        const annotResult = await apiCall('UpdateConversationAnnotations', {
            cascadeId,
            annotations: { lastUserViewTime: new Date().toISOString() },
            mergeAnnotations: true,
        });

        console.log(`  UpdateConversationAnnotations: ${annotResult.status} ${JSON.stringify(annotResult.data)}`);

        // ── Step 3: Poll GetCascadeTrajectory ──
        console.log('[3/3] Polling for agent response...');

        const maxPollTime = 120000;
        const pollInterval = 3000;
        const startTime = Date.now();
        let finalResponse = null;
        let lastStepCount = 0;

        // Phase 1: Get baseline step count BEFORE our message is processed
        const baseline = await apiCall('GetCascadeTrajectory', {
            cascadeId,
            verbosity: 'CLIENT_TRAJECTORY_VERBOSITY_PROD_UI',
        });
        const baselineStepCount = baseline.data?.trajectory?.steps?.length || 0;
        console.log(`  Baseline: ${baselineStepCount} steps (waiting for new steps...)`);

        while (Date.now() - startTime < maxPollTime) {
            await delay(pollInterval);

            const result = await apiCall('GetCascadeTrajectory', {
                cascadeId,
                verbosity: 'CLIENT_TRAJECTORY_VERBOSITY_PROD_UI',
            });

            if (result.error || !result.data?.trajectory) {
                console.error('  Poll error:', result.error || JSON.stringify(result.data).slice(0, 200));
                continue;
            }

            const steps = result.data.trajectory.steps || [];

            if (steps.length !== lastStepCount) {
                lastStepCount = steps.length;
                const lastStep = steps[steps.length - 1];
                const lastType = (lastStep?.type || '').replace('CORTEX_STEP_TYPE_', '');
                const lastStatus = (lastStep?.status || '').replace('CORTEX_STEP_STATUS_', '');
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                console.log(`  ${elapsed}s | ${steps.length} steps | last: ${lastType} [${lastStatus}]`);
            }

            // Wait for new steps beyond baseline
            if (steps.length <= baselineStepCount) continue;

            // Check if the last new step is a completed PLANNER_RESPONSE
            // Pattern per turn: USER_INPUT → EPHEMERAL_MESSAGE → PLANNER_RESPONSE
            const lastStep = steps[steps.length - 1];
            const lastType = lastStep?.type || '';
            const lastStatus = lastStep?.status || '';

            if (lastType === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE' && lastStatus === 'CORTEX_STEP_STATUS_DONE') {
                // Collect all new steps since baseline
                finalResponse = steps.slice(baselineStepCount);
                break;
            }
        }

        if (!finalResponse) {
            console.error('Timed out waiting for response!');
        } else {
            console.log('\n=== AGENT RESPONSE ===');

            for (const step of finalResponse) {
                const type = step.type.replace('CORTEX_STEP_TYPE_', '');
                const status = step.status.replace('CORTEX_STEP_STATUS_', '');
                console.log(`\n[${type}] (${status})`);

                if (step.textResponse?.text) console.log(step.textResponse.text);
                if (step.content?.text) console.log(step.content.text);
                if (step.plannerResponse?.modifiedResponse) console.log(step.plannerResponse.modifiedResponse);
                if (step.ephemeralMessage?.text) console.log('  (ephemeral):', step.ephemeralMessage.text);
                if (step.userInput?.items) console.log('  User:', step.userInput.items.map(i => i.text).join(' '));
                if (step.toolCall) console.log('Tool:', JSON.stringify(step.toolCall).slice(0, 300));
            }

            fs.writeFileSync('api_response.json', JSON.stringify(finalResponse, null, 2));
            console.log('\nFull response saved to api_response.json');
        }

        console.log('\nDisconnecting...');
        await cdp.detach();
        await browser.disconnect();
        console.log('Done.');

    } catch (error) {
        console.error('Script failed:', error);
    }
})();
