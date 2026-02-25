# Automating the Antigravity Agent Manager

This directory contains scripts for programmatically controlling the Antigravity Agent Manager using `puppeteer-core` and the Chrome DevTools Protocol (CDP).

The Antigravity IDE is launched with `--remote-debugging-port=9222`. The Agent Manager runs as a Chromium renderer process under the same port, allowing full programmatic access.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure the Antigravity IDE is running with the Agent Manager window open (or minimized).

---

## Scripts

### `index.js` — UI Automation
Automate the Manager sidebar and chat input via Puppeteer clicks and paste events.

```bash
node index.js search "<query>"                                    # Search the Inbox
node index.js start "<prompt>"                                    # Start a new conversation
node index.js chat "<workspace>" "<conversation>" "<prompt>"      # Chat in an existing conversation
```

### `direct_api.js` — Direct gRPC API Client
Bypass the UI entirely. Sends prompts and retrieves responses via the internal gRPC-web API.

```bash
node direct_api.js --list                        # List visible conversations with their cascade IDs
node direct_api.js <cascadeId> "<prompt>"         # Send a prompt and poll for the response
```

**Example:**
```bash
$ node direct_api.js --list
  36fd63d5-2e45-47f4-adda-5fd5bf860e31  Agent Test 1

$ node direct_api.js 36fd63d5-2e45-47f4-adda-5fd5bf860e31 "What year was the Declaration of Independence signed?"
  SendUserCascadeMessage: 200 {}
  UpdateConversationAnnotations: 200 {}
  Polling for agent response...
  3s | 32 steps | last: PLANNER_RESPONSE [GENERATING]

  === AGENT RESPONSE ===
  [PLANNER_RESPONSE] (DONE)
  1776. It was adopted by the Continental Congress on July 4, 1776...
```

### `event_listener.js` — Event Capture
Instruments the Manager page with hooks on DOM events, MutationObserver, fetch, XHR, WebSocket, and postMessage. Sends a prompt, listens for 30 seconds, and saves a full event log.

```bash
node event_listener.js        # Outputs event_log.json
```

### `grpc_capture.js` — gRPC Traffic Capture
Uses CDP `Network` + `Fetch` domains to capture full request/response headers and bodies for all `LanguageServerService` endpoints.

```bash
node grpc_capture.js          # Outputs grpc_capture.json
```

### Opening Workspaces via CLI
Antigravity's IPC is locked down (no `vscode:openWindow` handler), so you **cannot** open workspaces from the Manager webview. However, passing a folder path to `Antigravity.exe` opens it as a workspace in the running instance, and it immediately appears in the Manager sidebar:

```bash
& "C:\Users\user1\AppData\Local\Programs\Antigravity\Antigravity.exe" "C:\path\to\your\folder"
```

> **Note:** This opens a new editor window for the folder. To close the extra window while keeping the workspace registered in the Manager, use Puppeteer's `page.close()` on any non-Manager target (see setup routine below).

**Multi-workspace setup routine** — open several folders, close the extra editor windows, and kick off agents in each:
```powershell
$exe = "C:\Users\user1\AppData\Local\Programs\Antigravity\Antigravity.exe"
$folders = @(
    "C:\Users\user1\Desktop\project_alpha",
    "C:\Users\user1\Desktop\project_beta",
    "C:\Users\user1\Desktop\project_gamma"
)

# 1. Open all folders as workspaces
foreach ($folder in $folders) {
    & $exe $folder
    Start-Sleep -Seconds 2
}

# 2. Close the extra editor windows (keeps workspaces in Manager)
node -e "
const puppeteer = require('puppeteer-core');
const http = require('http');
(async () => {
    const v = await new Promise((r,j) => http.get('http://localhost:9222/json/version', s => {
        let d=''; s.on('data',c=>d+=c); s.on('end',()=>r(JSON.parse(d)));
    }).on('error',j));
    const b = await puppeteer.connect({ browserWSEndpoint: v.webSocketDebuggerUrl });
    for (const t of await b.targets()) {
        if (t.type() === 'page') {
            try {
                const p = await t.page();
                const title = await p.title();
                if (title !== 'Manager') { await p.close(); console.log('Closed:', title); }
            } catch (e) {}
        }
    }
    await b.disconnect();
})();
"

# 3. List the new conversations
node direct_api.js --list

# 4. Send an initial prompt to each (using cascade IDs from --list output)
node direct_api.js <cascadeId1> "Set up the project scaffolding."
node direct_api.js <cascadeId2> "Review the existing codebase."
```

---

## gRPC-Web API Reference

The Manager communicates with the backend via `LanguageServerService` on a local HTTPS port (rotates per session, e.g. `https://127.0.0.1:55305`). All endpoints use `application/json` except the streaming endpoint which uses `application/connect+json`.

### Authentication
- **CSRF token** — Required on all requests as the `x-codeium-csrf-token` header. Stored internally by the app's Connect RPC client. Can be extracted via CDP `Fetch.enable` interception of an app-initiated request.
- **API key** — An OAuth token (`ya29...`) sent in the `SendUserCascadeMessage` request body. Rotates periodically.

### Endpoints

#### `POST /SendUserCascadeMessage`
Send a user prompt to a conversation. Fire-and-forget (returns `{}`).
```json
{
  "cascadeId": "36fd63d5-...",
  "items": [{ "text": "Your prompt here" }],
  "metadata": { "ideName": "antigravity", "locale": "en", ... },
  "cascadeConfig": {
    "plannerConfig": {
      "conversational": { "plannerMode": "CONVERSATIONAL_PLANNER_MODE_DEFAULT", "agenticMode": true },
      "requestedModel": { "model": "MODEL_PLACEHOLDER_M26" }
    }
  }
}
```

#### `POST /GetCascadeTrajectory`
Fetch the full conversation trajectory (all steps). Use for polling response completion.
```json
{ "cascadeId": "36fd63d5-...", "verbosity": "CLIENT_TRAJECTORY_VERBOSITY_PROD_UI" }
```
Returns a `trajectory.steps[]` array. Each turn follows the pattern:
`USER_INPUT → EPHEMERAL_MESSAGE → PLANNER_RESPONSE`

The agent's text response lives in `step.plannerResponse.modifiedResponse`.

#### `POST /UpdateConversationAnnotations`
Update conversation metadata (e.g. last viewed time).
```json
{ "cascadeId": "36fd63d5-...", "annotations": { "lastUserViewTime": "2026-..." }, "mergeAnnotations": true }
```

#### `POST /StreamCascadeReactiveUpdates`
Real-time streaming updates via the [Connect protocol](https://connectrpc.com/). Uses `application/connect+json` with a 5-byte binary prefix (1 byte flags + 4 bytes length) before each JSON frame.
```
\x00\x00\x00\x00\x6a{"protocolVersion":1,"id":"36fd63d5-...","subscriberId":"local-agent-client-main"}
```

### Polling for Response Completion
1. Before sending, call `GetCascadeTrajectory` to get the baseline step count.
2. Send the message via `SendUserCascadeMessage`.
3. Poll `GetCascadeTrajectory` every 3 seconds.
4. When the step count exceeds the baseline and the last step is `PLANNER_RESPONSE` with `status: CORTEX_STEP_STATUS_DONE`, the response is complete.
5. Read the text from `steps[last].plannerResponse.modifiedResponse`.

---

## Technical Notes for Agent Automation

### Discovering the Manager Target
The Agent Manager shares the URL `workbench-jetski-agent.html` with the hidden "Launchpad" window. Identify it by **title**:
```javascript
const p = await target.page();
if (p && await p.title() === 'Manager') { /* correct page */ }
```

### Native Clicks Required for Sidebar
React's sidebar won't respond to `element.click()` inside `page.evaluate()`. You must use **native Puppeteer mouse clicks** on the element's bounding box:
```javascript
const rect = element.getBoundingClientRect();
await page.mouse.click(rect.x + rect.width/2, rect.y + rect.height/2);
```

### Injecting Text via Paste
The Lexical `contenteditable` editor accepts synthesized `ClipboardEvent('paste')` for instant text injection:
```javascript
const dt = new DataTransfer();
dt.setData('text/plain', 'Your prompt');
editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
```

### Extracting the CSRF Token
The CSRF token is embedded in the app's Connect RPC client closure (not in cookies/localStorage). Extract it via CDP `Fetch.enable`, which intercepts at the Chrome engine level:
```javascript
await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*LanguageServerService*', requestStage: 'Request' }] });
cdp.on('Fetch.requestPaused', async (params) => {
    const csrf = params.request.headers['x-codeium-csrf-token'];
    await cdp.send('Fetch.continueRequest', { requestId: params.requestId });
    // csrf is your token
});
// Then trigger a native click on a conversation pill to force an app-initiated request
```

