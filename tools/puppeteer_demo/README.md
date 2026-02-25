# Automating the Antigravity Agent Manager

This directory contains a demonstration script (`index.js`) for programmatically controlling the Antigravity Agent Manager window using `puppeteer-core`.

By default, the Antigravity IDE is launched with the `--remote-debugging-port=9222` flag. Because the Agent Manager is run as an Electron/Chromium renderer process spawned by the main IDE, it shares the exact same debug port. We can discover and connect to it over the Chrome DevTools Protocol (CDP).

## Setup

1. Make sure you have the dependencies installed:
   ```bash
   npm install
   ```
2. Make sure the Antigravity IDE is currently running. The Agent Manager window must be open or minimized (if it is closed completely, its Chromium target is destroyed).

## Usage

The `index.js` script supports three commands:

### 1. Search the Inbox
Navigates to the Inbox tab and searches for a specific conversation query.
```bash
node index.js search "<query>"
```

### 2. Start a New Conversation
Clicks "Start conversation" in the sidebar and injects the provided text into the new agent chat input.
```bash
node index.js start "<prompt>"
```

### 3. Chat in an Existing Conversation
Selects a specific workspace, expands it, selects a specific conversation, and injects the provided text.
```bash
node index.js chat "<workspace_name>" "<conversation_name>" "<prompt>"
```
*Example:*
```bash
node index.js chat "Antigravity_backup" "Agent Test 1" "Excellent!"
```

## Technical Notes for Agent Automation

If you are an agent looking to expand this script or write your own automation, keep the following technical details in mind:

### Discovering the Target
The Agent Manager window shares the exact same URL (`workbench-jetski-agent.html`) as the hidden "Launchpad" window. To reliably find the Agent Manager, you must check the target's **title**:
```javascript
const p = await target.page();
if (p && await p.title() === 'Manager') {
    // This is the correct page
}
```

### Simulating UI Clicks (Workspaces)
The sidebar UI is driven by React. Attempting to click DOM elements via `element.click()` inside `page.evaluate()` **will not trigger** the necessary UI state updates (like expanding a workspace tree). 

You must trigger **native mouse clicks** using Puppeteer. For example, to expand a workspace, you must find the exact bounding box of the `lucide-chevron-right` SVG and native-click it:
```javascript
await page.mouse.click(rect.x, rect.y);
```

### Injecting Text into Lexical Editor
The chat input is a complex `contenteditable` Lexical div. While you can use `page.keyboard.type()`, it is slow. The most reliable and instant way to inject long prompts is to synthesize a `paste` event inside the page:
```javascript
const dataTransfer = new DataTransfer();
dataTransfer.setData('text/plain', "Your prompt text here");
const pasteEvent = new ClipboardEvent('paste', {
    clipboardData: dataTransfer,
    bubbles: true,
    cancelable: true
});
editorDiv.dispatchEvent(pasteEvent);
```
