const puppeteer = require('puppeteer-core');
const http = require('http');

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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function typeIntoLexicalEditor(page, text) {
    const editorSelector = 'div[role="textbox"][data-lexical-editor="true"]';
    await page.waitForSelector(editorSelector, { timeout: 5000 });

    // Focus the editor
    await page.click(editorSelector);

    // Select all and delete previous content if any (optional, but good for clean state)
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Create a paste event to inject the text instantly
    await page.evaluate((text, selector) => {
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
    }, text, editorSelector);
}

(async () => {
    const command = process.argv[2];

    if (!['search', 'start', 'chat'].includes(command)) {
        console.error("Usage:");
        console.error("  node index.js search <query>");
        console.error("  node index.js start <prompt>");
        console.error("  node index.js chat <workspace> <conversation> <prompt>");
        process.exit(1);
    }

    try {
        console.log("Fetching browser WS endpoint...");
        const versionInfo = await fetchJson('http://localhost:9222/json/version');
        const browserWSEndpoint = versionInfo.webSocketDebuggerUrl;

        console.log("Connecting to browser...");
        const browser = await puppeteer.connect({
            browserWSEndpoint,
            defaultViewport: null
        });

        console.log("Locating Manager page...");
        const targets = await browser.targets();
        let managerPage = null;

        for (const t of targets) {
            if (t.type() === 'page' || t.type() === 'webview') {
                try {
                    const p = await t.page();
                    if (p && await p.title() === 'Manager') {
                        managerPage = p;
                    }
                } catch (e) { /* ignore locked/dead pages */ }
            }
        }

        if (!managerPage) {
            console.error("Manager page not found!");
            await browser.disconnect();
            return;
        }

        // Bring to front if possible
        await managerPage.bringToFront().catch(() => { });

        if (command === 'search') {
            const query = process.argv[3];
            if (!query) throw new Error("Missing query");

            console.log("Clicking 'Inbox' from the sidebar...");
            const inboxBtn = await managerPage.evaluateHandle(() => {
                return Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'Inbox');
            });

            if (inboxBtn) {
                await inboxBtn.click();
                await managerPage.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
                const searchInput = await managerPage.$('input[placeholder*="Search"]');
                if (searchInput) {
                    await searchInput.focus();
                    await searchInput.click({ clickCount: 3 });
                    await managerPage.keyboard.press('Backspace');
                    await managerPage.keyboard.type(query, { delay: 50 });
                    console.log(`Successfully searched for '${query}'.`);
                }
            }
        }
        else if (command === 'start') {
            const prompt = process.argv[3];
            if (!prompt) throw new Error("Missing prompt");

            console.log("Clicking 'Start conversation'...");
            const startBtn = await managerPage.evaluateHandle(() => {
                return Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'Start conversation');
            });

            if (startBtn) {
                await startBtn.click();
                console.log("Typing prompt into editor...");
                await typeIntoLexicalEditor(managerPage, prompt);
                console.log("Successfully typed the prompt for a new conversation.");
            } else {
                console.error("Could not find 'Start conversation' button.");
            }
        }
        else if (command === 'chat') {
            const workspace = process.argv[3];
            const conversation = process.argv[4];
            const prompt = process.argv[5];

            if (!workspace || !conversation || !prompt) {
                throw new Error("Missing arguments. Required: <workspace> <conversation> <prompt>");
            }

            console.log(`Selecting workspace '${workspace}'...`);

            // Wait for DOM to be stable
            await delay(500);

            // 1. Find and click Workspace
            const workspaceBox = await managerPage.evaluate((wsName) => {
                const spans = Array.from(document.querySelectorAll('span.truncate'));
                const targetSpan = spans.find(s => !s.hasAttribute('data-testid') && s.textContent.trim() === wsName);
                if (!targetSpan) return null;

                const container = targetSpan.closest('.group');
                if (!container) return null;

                const chevronRight = container.querySelector('.lucide-chevron-right');
                if (chevronRight) {
                    // Click exactly on the chevron to ensure it expands the tree
                    const rect = chevronRight.getBoundingClientRect();
                    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                }
                return 'expanded'; // Already expanded (has chevron-down or no chevron)
            }, workspace);

            if (workspaceBox === null) {
                console.error(`Workspace '${workspace}' not found.`);
            } else if (workspaceBox !== 'expanded') {
                console.log(`Clicking to expand workspace '${workspace}' at ${workspaceBox.x}, ${workspaceBox.y}`);
                await managerPage.mouse.click(workspaceBox.x, workspaceBox.y);
            } else {
                console.log(`Workspace '${workspace}' already expanded.`);
            }

            await delay(1500); // Give it time to expand and render conversations

            console.log(`Selecting conversation '${conversation}'...`);

            // 2. Find and click Conversation
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
                console.error(`Could not find conversation '${conversation}'. Make sure it exists under '${workspace}'.`);
            } else {
                console.log(`Clicking conversation '${conversation}' at ${convoBox.x}, ${convoBox.y}`);
                await managerPage.mouse.click(convoBox.x, convoBox.y);
                console.log("Conversation selected. Typing prompt...");
                await delay(2000); // Wait for conversation to load
                await typeIntoLexicalEditor(managerPage, prompt);
                console.log("Successfully typed the prompt in the conversation.");
            }
        }

        console.log("Disconnecting...");
        await browser.disconnect();
        console.log("Done.");

    } catch (error) {
        console.error("Script failed:", error);
    }
})();
