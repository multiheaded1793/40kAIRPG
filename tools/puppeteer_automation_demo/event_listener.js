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
        // 1. Install broad event listeners on the page
        // ──────────────────────────────────────────────
        console.log('Installing event listeners...');

        await managerPage.evaluate(() => {
            window.__eventLog = [];

            // DOM events to listen for on document (capture phase to catch everything)
            const domEvents = [
                'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
                'keydown', 'keyup', 'keypress',
                'input', 'change', 'submit',
                'focus', 'blur', 'focusin', 'focusout',
                'paste', 'copy', 'cut',
                'scroll', 'resize',
                'drag', 'dragstart', 'dragend', 'dragover', 'drop',
                'touchstart', 'touchend', 'touchmove',
                'pointerdown', 'pointerup', 'pointermove',
                'compositionstart', 'compositionend',
                'animationstart', 'animationend',
                'transitionstart', 'transitionend',
                'contextmenu', 'wheel',
                'beforeinput', 'selectionchange',
            ];

            // Throttle high-frequency events
            const highFrequency = new Set(['mousemove', 'pointermove', 'scroll', 'touchmove', 'wheel']);
            const lastHighFreq = {};

            domEvents.forEach(evtName => {
                document.addEventListener(evtName, (e) => {
                    const now = Date.now();

                    // Throttle high-frequency events to max 1 per 500ms
                    if (highFrequency.has(evtName)) {
                        if (lastHighFreq[evtName] && now - lastHighFreq[evtName] < 500) return;
                        lastHighFreq[evtName] = now;
                    }

                    const target = e.target;
                    let targetDesc = target.tagName || 'unknown';
                    if (target.id) targetDesc += '#' + target.id;
                    if (target.className && typeof target.className === 'string')
                        targetDesc += '.' + target.className.split(' ').slice(0, 3).join('.');

                    const entry = {
                        ts: now,
                        type: evtName,
                        target: targetDesc,
                        bubbles: e.bubbles,
                        isTrusted: e.isTrusted,
                    };

                    // Capture extra data for specific event types
                    if (e instanceof KeyboardEvent) {
                        entry.key = e.key;
                        entry.code = e.code;
                    }
                    if (e instanceof InputEvent) {
                        entry.inputType = e.inputType;
                        entry.data = e.data;
                    }

                    window.__eventLog.push(entry);
                }, true); // capture phase
            });

            // Intercept custom events via a MutationObserver for DOM changes
            window.__mutationLog = [];
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
                        let targetDesc = m.target.tagName || 'unknown';
                        if (m.target.id) targetDesc += '#' + m.target.id;
                        if (m.target.className && typeof m.target.className === 'string')
                            targetDesc += '.' + m.target.className.split(' ').slice(0, 3).join('.');

                        window.__mutationLog.push({
                            ts: Date.now(),
                            type: 'mutation:childList',
                            target: targetDesc,
                            added: m.addedNodes.length,
                            removed: m.removedNodes.length,
                        });
                    }
                    if (m.type === 'attributes') {
                        let targetDesc = m.target.tagName || 'unknown';
                        if (m.target.id) targetDesc += '#' + m.target.id;

                        window.__mutationLog.push({
                            ts: Date.now(),
                            type: 'mutation:attribute',
                            target: targetDesc,
                            attribute: m.attributeName,
                        });
                    }
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-state', 'aria-expanded', 'aria-hidden', 'disabled', 'style'],
            });

            // Intercept postMessage / MessageChannel
            const origPostMessage = window.postMessage.bind(window);
            window.postMessage = function (msg, ...args) {
                window.__eventLog.push({
                    ts: Date.now(),
                    type: 'postMessage:outgoing',
                    data: typeof msg === 'object' ? JSON.stringify(msg).slice(0, 300) : String(msg).slice(0, 300),
                });
                return origPostMessage(msg, ...args);
            };

            window.addEventListener('message', (e) => {
                window.__eventLog.push({
                    ts: Date.now(),
                    type: 'postMessage:incoming',
                    origin: e.origin,
                    data: typeof e.data === 'object' ? JSON.stringify(e.data).slice(0, 300) : String(e.data).slice(0, 300),
                });
            });

            // Intercept fetch & XHR
            const origFetch = window.fetch;
            window.fetch = async function (...args) {
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
                const method = args[1]?.method || 'GET';
                window.__eventLog.push({
                    ts: Date.now(),
                    type: 'fetch:request',
                    url: url.slice(0, 200),
                    method,
                });
                try {
                    const resp = await origFetch.apply(this, args);
                    window.__eventLog.push({
                        ts: Date.now(),
                        type: 'fetch:response',
                        url: url.slice(0, 200),
                        status: resp.status,
                    });
                    return resp;
                } catch (err) {
                    window.__eventLog.push({
                        ts: Date.now(),
                        type: 'fetch:error',
                        url: url.slice(0, 200),
                        error: err.message,
                    });
                    throw err;
                }
            };

            const origXhrOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this.__logUrl = url;
                this.__logMethod = method;
                window.__eventLog.push({
                    ts: Date.now(),
                    type: 'xhr:open',
                    url: String(url).slice(0, 200),
                    method,
                });
                return origXhrOpen.call(this, method, url, ...rest);
            };

            // Intercept WebSocket
            const OrigWS = window.WebSocket;
            window.WebSocket = function (url, ...args) {
                window.__eventLog.push({
                    ts: Date.now(),
                    type: 'websocket:create',
                    url: String(url).slice(0, 200),
                });
                const ws = new OrigWS(url, ...args);
                ws.addEventListener('message', (evt) => {
                    window.__eventLog.push({
                        ts: Date.now(),
                        type: 'websocket:message',
                        url: String(url).slice(0, 100),
                        data: String(evt.data).slice(0, 300),
                    });
                });
                ws.addEventListener('close', () => {
                    window.__eventLog.push({
                        ts: Date.now(),
                        type: 'websocket:close',
                        url: String(url).slice(0, 100),
                    });
                });
                return ws;
            };
            window.WebSocket.prototype = OrigWS.prototype;

            console.log('[event_listener] All hooks installed.');
        });

        // Also listen to CDP-level events
        const cdpSession = await managerPage.target().createCDPSession();
        const cdpEvents = [];

        // Listen to console messages from the page
        managerPage.on('console', (msg) => {
            cdpEvents.push({
                ts: Date.now(),
                type: 'console',
                level: msg.type(),
                text: msg.text().slice(0, 300),
            });
        });

        console.log('All event listeners installed.');

        // ──────────────────────────────────────────────
        // 2. Navigate to the conversation and send prompt
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

        // Clear existing content
        await managerPage.keyboard.down('Control');
        await managerPage.keyboard.press('A');
        await managerPage.keyboard.up('Control');
        await managerPage.keyboard.press('Backspace');

        // Paste
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
        // 3. Listen for 30 seconds
        // ──────────────────────────────────────────────
        console.log('Listening for events for 30 seconds...');

        const startTime = Date.now();
        const listenDuration = 30000;

        // Progress indicator
        const progressInterval = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            process.stdout.write(`\r  ${elapsed}s / 30s elapsed...`);
        }, 1000);

        await delay(listenDuration);
        clearInterval(progressInterval);
        console.log('\n30 seconds elapsed. Collecting event logs...');

        // ──────────────────────────────────────────────
        // 4. Collect and save logs
        // ──────────────────────────────────────────────
        const domEventLog = await managerPage.evaluate(() => window.__eventLog);
        const mutationLog = await managerPage.evaluate(() => window.__mutationLog);

        const fullLog = {
            metadata: {
                workspace,
                conversation,
                prompt,
                startTime: new Date(startTime).toISOString(),
                duration: '30s',
                domEvents: domEventLog.length,
                mutations: mutationLog.length,
                cdpEvents: cdpEvents.length,
            },
            domEvents: domEventLog,
            mutations: mutationLog,
            cdpEvents: cdpEvents,
        };

        const logPath = 'event_log.json';
        fs.writeFileSync(logPath, JSON.stringify(fullLog, null, 2));
        console.log(`Full event log saved to ${logPath}`);

        // Print summary
        console.log('\n--- EVENT SUMMARY ---');
        console.log(`Total DOM events: ${domEventLog.length}`);
        console.log(`Total mutations:  ${mutationLog.length}`);
        console.log(`Total CDP events: ${cdpEvents.length}`);

        // Group DOM events by type
        const domByType = {};
        domEventLog.forEach(e => {
            domByType[e.type] = (domByType[e.type] || 0) + 1;
        });
        console.log('\nDOM events by type:');
        Object.entries(domByType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        // Group mutations by type
        const mutByType = {};
        mutationLog.forEach(e => {
            mutByType[e.type] = (mutByType[e.type] || 0) + 1;
        });
        console.log('\nMutations by type:');
        Object.entries(mutByType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        // Group CDP events by type
        const cdpByType = {};
        cdpEvents.forEach(e => {
            cdpByType[e.type] = (cdpByType[e.type] || 0) + 1;
        });
        console.log('\nCDP events by type:');
        Object.entries(cdpByType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        // Show postMessage events specifically (likely IPC)
        const postMessages = domEventLog.filter(e => e.type.startsWith('postMessage'));
        if (postMessages.length > 0) {
            console.log(`\npostMessage events (${postMessages.length} total):`);
            postMessages.slice(0, 20).forEach(e => {
                console.log(`  [${e.type}] ${(e.data || '').slice(0, 120)}`);
            });
            if (postMessages.length > 20) console.log(`  ... and ${postMessages.length - 20} more`);
        }

        // Show fetch events
        const fetchEvents = domEventLog.filter(e => e.type.startsWith('fetch'));
        if (fetchEvents.length > 0) {
            console.log(`\nfetch events (${fetchEvents.length} total):`);
            fetchEvents.forEach(e => {
                console.log(`  [${e.type}] ${e.method || ''} ${e.url || ''} ${e.status || ''}`);
            });
        }

        // Show websocket events
        const wsEvents = domEventLog.filter(e => e.type.startsWith('websocket'));
        if (wsEvents.length > 0) {
            console.log(`\nwebsocket events (${wsEvents.length} total):`);
            wsEvents.slice(0, 20).forEach(e => {
                console.log(`  [${e.type}] ${e.url || ''} ${(e.data || '').slice(0, 100)}`);
            });
            if (wsEvents.length > 20) console.log(`  ... and ${wsEvents.length - 20} more`);
        }

        console.log('\nDisconnecting...');
        await browser.disconnect();
        console.log('Done.');

    } catch (error) {
        console.error('Script failed:', error);
    }
})();
