# 2. Multiplayer Architecture & Web REPL

The core gameplay interface runs via a Cloudflare Worker Web UI connected to a local Node.js relay, facilitating DM-Player discussions.

## Setup & Configuration
1. **Local Relay:** Run `npm install` in the root directory to install dependencies (`express`, `ws`, `puppeteer-core`, `dotenv`, `cors`).
2. **Environment Variables:** Create a `.env` file in the root directory (use `.env.example` as a template). Configure:
   - `MULTIPLAYER_MODE=true` (or `false` for offline solo play)
   - `CHATROOM_URL=ws://<your-cloudflare-worker-url>/ws`
   - `MULTIPLAYER_PASSWORD=<your_secure_password>`
   - `CDP_PORT=9222` (If using auto-injection into Antigravity IDE)
   - `DM_MODE=polling` (Select from `polling`, `manual`, or `auto`)
   - `AGENT_RULES=["auto-dm-turn.md"]` (To load specific rules dynamically)
   - `AGENT_SKILLS=` (To selectively load Agent skills dynamically)

## Operating the Game
1. **Start the Relay:** Run `node play.js <campaign_folder>`. (e.g., `node play.js campaign_01`). The server will act as a WebSocket bridge and serve Dataslate files.
2. **Access the Terminal:** Players browse to your Cloudflare Worker URL, enter a Display Name and the Password, and establish the link.
3. **Player Operations:**
   - Type in-character actions cleanly.
   - Out-of-character (OOC) actions should be enclosed in `[brackets]`.
   - Players click `[ STANDBY ]` to toggle their "Ready" state. When all players are ready, the turn formally passes to the DM.
4. **DM Operations:**
   - The DM (Agent) writes its message to `notes/dm_message.txt`, then uses `node dm.js campaign_01 -w -p`. to push new narrative text down through the relay to all connected players.
   - **Tactical Maps (Mermaid):** Send the raw diagram: `node dm.js campaign_01 "\`\`\`mermaid\ngraph TD...\`\`\`"`
   - Dice rolls from `roll.bat` and `roll.sh` are pushed up to the Cloudflare UI automatically unless `-H` is appended.

## Server State Management
To save resources when not playing, you can easily turn the Cloudflare Worker on and off using the NPM scripts provided in the root directory:
* **Start Server:** `npm run start-chatroom` (Deploys the worker)
* **Stop Server:** `npm run stop-chatroom` (Deletes the worker to pause it)

## Password Handling
The password logic is currently handled by verifying query parameters against the local `.env` configuration. Changing the password only requires updating `MULTIPLAYER_PASSWORD` in your `.env` file and restarting the local `play.js` relay.

## The Three DM Modes
Configure `DM_MODE` in `.env` to control how the Agent receives the turn:
1. **`polling` (Legacy):** The DM writes its message to `notes/dm_message.txt`, then uses `node dm.js campaign_01 -w -p`. The script blocks and hangs open until all players hit Ready on the web client, at which point it resolves, and the LLM natively proceeds.
2. **`manual`:** The DM script fires and completes instantly. Player messages are accumulated silently in `logs/player_message_pad.txt`. The human Host triggers the AI manually (e.g. via an Antigravity Agent Workflow) when ready.
3. **`auto`:** The fully automated AI loop. Requires Chrome/Antigravity running with `--remote-debugging-port=9222`. When all players ready up, the `play.js` relay uses Puppeteer to remote-control the IDE, focusing the chat box, typing `continue @[.agents/rules/auto-dm-turn.md]`, and natively firing the Enter key to securely inject the turn context without breaking the UI.

## Logging
Everything is transparently documented in day-stamped files within the `logs/<campaign_folder>/` directory.
