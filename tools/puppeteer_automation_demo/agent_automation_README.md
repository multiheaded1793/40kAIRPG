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
& "C:\Users\momhu\AppData\Local\Programs\Antigravity\Antigravity.exe" "C:\path\to\your\folder"
```

> **Note:** This opens a new editor window for the folder. To close the extra window while keeping the workspace registered in the Manager, use Puppeteer's `page.close()` on any non-Manager target (see setup routine below).

**Multi-workspace setup routine** — open several folders, close the extra editor windows, and kick off agents in each:
```powershell
$exe = "C:\Users\momhu\AppData\Local\Programs\Antigravity\Antigravity.exe"
$folders = @(
    "C:\Users\momhu\Desktop\project_alpha",
    "C:\Users\momhu\Desktop\project_beta",
    "C:\Users\momhu\Desktop\project_gamma"
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

---

## Response Stream Anatomy

Each call to `GetCascadeTrajectory` returns a `trajectory.steps[]` array. A single conversation turn produces the following step sequence:

### Step Types

| Step Type | Contents |
|---|---|
| `USER_INPUT` | Prompt text, model config, auto-execution policies, requested model |
| `CONVERSATION_HISTORY` | Marker (empty object) — indicates history was loaded |
| `KNOWLEDGE_ARTIFACTS` | Marker — indicates KI lookup was performed |
| `EPHEMERAL_MESSAGE` | System injections (task reminders, active file context, etc.) |
| `PLANNER_RESPONSE` | **The agent's output** — thinking + response text + stop reason |
| `CHECKPOINT` | Auto-generated conversation title + intent summary + token usage |
| `ERROR_MESSAGE` | Model errors (503 capacity exhausted, retryable errors, etc.) |

All step type names are prefixed with `CORTEX_STEP_TYPE_`. Statuses are prefixed with `CORTEX_STEP_STATUS_` (`DONE`, `GENERATING`).

### `plannerResponse` Object

The core agent output. **Thinking and response are fully separated:**

```json
{
  "modifiedResponse": "The clean visible text the agent wrote...",
  "thinking": "**Initiating Task**\n\nI'm now analyzing the codebase...",
  "thinkingSignature": "EqUKCqIKAb4+9vv2u...",
  "thinkingDuration": "2.059281700s",
  "messageId": "bot-c8c9647a-fb14-467a-bf54-f76d47bda88d",
  "stopReason": "STOP_REASON_STOP_PATTERN"
}
```

| Field | Use |
|---|---|
| `modifiedResponse` | The agent's clean text output (what the user sees) |
| `thinking` | Full chain-of-thought (the collapsed "thinking" block in the UI) |
| `thinkingDuration` | How long the model spent in the thinking phase |
| `stopReason` | `STOP_PATTERN` = natural end, `CLIENT_STREAM_ERROR` = interrupted |
| `messageId` | Unique ID for this message |

### `checkpoint` Object

Generated after each turn. Contains the auto-generated conversation summary:

```json
{
  "intentOnly": true,
  "userIntent": "Agent Test 1\nThe user's main goal is to test the agent workflow..."
}
```

This is the same text that appears as the conversation title and summary in the Manager sidebar.

### Step Metadata

Every step carries rich metadata:

```json
{
  "generatorModel": "MODEL_PLACEHOLDER_M37",
  "requestedModel": { "model": "MODEL_PLACEHOLDER_M37" },
  "executionId": "edad38d6-2f24-439a-8a63-fa3cec778f7a",
  "createdAt": "2026-02-25T17:47:56.842Z",
  "viewableAt": "2026-02-25T17:48:01.994Z",
  "finishedGeneratingAt": "2026-02-25T17:48:04.466Z"
}
```

Token usage is available on checkpoint steps via `modelUsage`:
```json
{
  "inputTokens": "5079",
  "outputTokens": "33",
  "thinkingOutputTokens": "264",
  "responseOutputTokens": "2",
  "cacheReadTokens": "16259"
}
```

### `errorMessage` Object

When the model hits an error (e.g. capacity exhaustion), you get:

```json
{
  "userErrorMessage": "Our servers are experiencing high traffic...",
  "shortError": "UNAVAILABLE (code 503): No capacity available for model gemini-3.1-pro-high",
  "errorCode": 503
}
```

The backend retries automatically — a subsequent `PLANNER_RESPONSE` step follows if the retry succeeds.

---

## Multi-Agent Router Architecture

A design for orchestrating multiple concurrent agents through a **single Manager window** using a UI mutex pattern. This approach stays fully within the provided UI (no synthetic API calls), making it compliant with the TOS.

### Overview

```
┌──────────────────────────────────────────────────┐
│                  AgentRouter                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │  ...    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │              │              │               │
│       ▼              ▼              ▼               │
│  ┌──────────────────────────────────────────┐      │
│  │         UI Mutex Queue (FIFO)            │      │
│  │  "acquire lock → click → paste → send   │      │
│  │   → release lock"                        │      │
│  └──────────────┬───────────────────────────┘      │
│                 │                                    │
│                 ▼                                    │
│  ┌──────────────────────────────────────────┐      │
│  │   CDP Passive Listener (async)           │      │
│  │   Network.responseReceived on            │      │
│  │   GetCascadeTrajectory responses         │      │
│  │   → match by cascadeId                   │      │
│  │   → resolve when PLANNER_RESPONSE DONE   │      │
│  └──────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

### How It Works

1. **Request Lock:** When Agent A needs to send a prompt, it calls `router.send(cascadeId, prompt)`, which enters a FIFO queue.

2. **Acquire & Send (1-2s):** When the lock is free:
   - Click the correct workspace pill in the sidebar.
   - Click the correct conversation pill.
   - Paste the prompt into the Lexical editor via `ClipboardEvent('paste')`.
   - Click the send button (native mouse click).

3. **Release Lock Immediately:** As soon as the send click fires, the lock is released. The next agent in the queue can now use the UI. The backend is already processing Agent A's request.

4. **Passive Listen (async):** A CDP `Network.responseReceived` listener runs continuously in the background, watching all `GetCascadeTrajectory` responses. When a response contains a completed `PLANNER_RESPONSE` step for Agent A's `cascadeId`, it resolves Agent A's promise with the full response data.

5. **Collect & Delegate:** Agent A receives:
   - `modifiedResponse` — the clean text to parse and act on
   - `thinking` — the chain-of-thought for analysis
   - `stopReason` + `errorMessage` — for error handling and retries
   - Token usage — for cost tracking across the hierarchy

### Why This Works

- **Bottleneck is tiny:** The UI lock is held only for ~1-2s (click + paste + send). Response generation (10-60s) happens entirely in the background.
- **Fully compliant:** No OAuth tokens extracted, no synthetic API requests. Every interaction goes through the native UI.
- **Scalable:** A dozen agents can pipeline prompts through one Manager window. While 5 responses are generating server-side, the UI is free.
- **Hierarchical:** Master agents can dispatch sub-prompts, wait for results, and synthesize — all through the same queue.

### Passive Response Listener Pattern

```javascript
// Set up a persistent CDP listener for trajectory responses
const cdp = await managerPage.createCDPSession();
await cdp.send('Network.enable');

const pendingAgents = new Map(); // cascadeId → { resolve, reject }

cdp.on('Network.responseReceived', async (params) => {
    if (!params.response.url.includes('GetCascadeTrajectory')) return;
    try {
        const { body } = await cdp.send('Network.getResponseBody', { requestId: params.requestId });
        const data = JSON.parse(body);
        const steps = data.trajectory?.steps || [];
        const lastStep = steps[steps.length - 1];

        if (lastStep?.type === 'CORTEX_STEP_TYPE_PLANNER_RESPONSE'
            && lastStep?.status === 'CORTEX_STEP_STATUS_DONE') {
            const cascadeId = data.trajectory.cascadeId;
            if (pendingAgents.has(cascadeId)) {
                pendingAgents.get(cascadeId).resolve({
                    text: lastStep.plannerResponse.modifiedResponse,
                    thinking: lastStep.plannerResponse.thinking,
                    stopReason: lastStep.plannerResponse.stopReason
                });
                pendingAgents.delete(cascadeId);
            }
        }
    } catch (e) { /* response not ready yet, ignore */ }
});
```

