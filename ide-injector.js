import puppeteer from 'puppeteer-core';

let browser = null;

export async function injectToIDE(text, cdpPort) {
    if (!browser) {
        try {
            // Fetch the wsEndpoint dynamically from CDP
            const res = await fetch(`http://localhost:${cdpPort}/json/version`);
            const data = await res.json();
            browser = await puppeteer.connect({
                browserWSEndpoint: data.webSocketDebuggerUrl,
                defaultViewport: null
            });
            console.log("Connected to IDE via CDP.");
        } catch (e) {
            throw new Error(`Failed to connect to CDP port ${cdpPort}. Ensure Chrome/IDE is running with --remote-debugging-port=${cdpPort}`);
        }
    }

    try {
        const pages = await browser.pages();
        let injectionSuccessful = false;

        // Loop through all pages instead of blindly guessing the first one
        for (let targetPage of pages) {
            // Skip devtools pages immediately
            if (targetPage.url().includes('devtools://')) continue;

            try {
                // We evaluate on the page to see if it even has the target element before bringing it to front
                const hasElement = await targetPage.evaluate(() => {
                    function findInput(root) {
                        const el = root.querySelector('[id="antigravity.agentSidePanelInputBox"] [contenteditable="true"], [data-lexical-editor="true"]');
                        if (el && el.offsetParent !== null) return el;
                        const allNodes = root.querySelectorAll('*');
                        for (let node of allNodes) {
                            if (node.shadowRoot) {
                                const found = findInput(node.shadowRoot);
                                if (found) return found;
                            }
                        }
                        return null;
                    }
                    return findInput(document) !== null;
                });

                if (!hasElement) continue; // Move to the next page if this one doesn't have the chat box

                // We found the right page! Bring it to front to accept inputs
                await targetPage.bringToFront();
                console.log("Found IDE page with chat input. Injecting...");

                const injectSuccess = await targetPage.evaluate((msgText) => {
                    function findInput(root) {
                        const el = root.querySelector('[id="antigravity.agentSidePanelInputBox"] [contenteditable="true"], [data-lexical-editor="true"]');
                        if (el && el.offsetParent !== null) return el;
                        const allNodes = root.querySelectorAll('*');
                        for (let node of allNodes) {
                            if (node.shadowRoot) {
                                const found = findInput(node.shadowRoot);
                                if (found) return found;
                            }
                        }
                        const iframes = root.querySelectorAll('iframe');
                        for (let iframe of iframes) {
                            try {
                                const doc = iframe.contentDocument || iframe.contentWindow.document;
                                if (doc) {
                                    const found = findInput(doc);
                                    if (found) return found;
                                }
                            } catch (e) { }
                        }
                        return null;
                    }

                    const targetEl = findInput(document);
                    if (!targetEl) return false;

                    // Focus it
                    targetEl.focus();

                    // Clear using raw DOM to avoid React event storm
                    targetEl.textContent = "";

                    // Insert text using a single DataTransfer event
                    const dataTransfer = new DataTransfer();
                    dataTransfer.setData('text/plain', msgText);
                    const pasteEvent = new ClipboardEvent('paste', {
                        clipboardData: dataTransfer,
                        bubbles: true,
                        cancelable: true
                    });

                    targetEl.dispatchEvent(pasteEvent);
                    return true;

                }, text);

                if (injectSuccess) {
                    // Allow UI to parse the paste and pop open the agent context menu
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Hit tab to embed the file
                    await targetPage.keyboard.press('Tab');
                    await new Promise(resolve => setTimeout(resolve, 150));

                    // Hit enter to send
                    await targetPage.keyboard.press('Enter');
                    console.log("Auto-inject sequence complete.");
                    injectionSuccessful = true;
                    break; // Stop looping once we succeed
                }
            } catch (e) {
                // Ignore errors on specific pages (like closed targets) and keep looping
                console.log(`Failed to evaluate page ${targetPage.url()}, skipping.`);
            }
        }

        if (!injectionSuccessful) {
            throw new Error("Could not find suitable chat input field in ANY IDE DOM or frames.");
        }
    } catch (e) {
        if (browser) browser.disconnect();
        browser = null; // force reconnect next time
        throw e;
    }
}
