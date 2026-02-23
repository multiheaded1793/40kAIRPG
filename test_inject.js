import puppeteer from 'puppeteer-core';

(async () => {
    const CDP_PORT = 9222;
    try {
        const res = await fetch(`http://localhost:${CDP_PORT}/json/version`);
        const data = await res.json();
        const browser = await puppeteer.connect({
            browserWSEndpoint: data.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        let targetPage = pages.find(p => !p.url().includes('devtools://')) || pages[0];

        console.log("Connected to page:", await targetPage.title());

        const result = await targetPage.evaluate(() => {
            // Find the element
            const el = document.querySelector('[id="antigravity.agentSidePanelInputBox"] [contenteditable="true"], [data-lexical-editor="true"]');

            if (!el) return { success: false, reason: "Element not found via querySelector" };

            // Try to set text using the Lexical root element directly, manipulating its React props or standard text insertion.
            // Using execCommand is standard but sometimes frameworks intercept it poorly. 
            // Let's test a very basic textContent overwrite first to see if Lexical syncs it without layout shift.
            try {
                // Focus it
                el.focus();

                // Clear using raw DOM to avoid React event storm
                el.textContent = "";

                // Insert text using a single DataTransfer event which React often handles better than massive execCommands
                const dataTransfer = new DataTransfer();
                dataTransfer.setData('text/plain', 'TEST INJECTION MESSAGE FROM DIAGNOSTIC SCRIPT\nMULTILINE');
                const pasteEvent = new ClipboardEvent('paste', {
                    clipboardData: dataTransfer,
                    bubbles: true,
                    cancelable: true
                });

                el.dispatchEvent(pasteEvent);

                return { success: true, method: "pasteEvent" };
            } catch (e) {
                return { success: false, reason: e.toString() };
            }
        });

        console.log("Injection Result:", result);

        browser.disconnect();
    } catch (e) {
        console.error("Test failed:", e);
    }
})();
