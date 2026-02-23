# Warhammer 40k CYOA AI Engine

This is an AI engine for choose-your-own-adventure style roleplaying, with multiplayer support, focused on the Warhammer 40k setting. It harnesses the Google Antigravity IDE and an integrated LLM agent with a Google AI subscription to serve as the Dungeon Master (DM).

The system supports the **[Dark Heresy and Black Crusade](GAMES.md)** thematic settings, and features a Node.js relay communicating with a Cloudflare Web REPL for a unified DM UI, parsing rolls, tracking complex states, and handling procedural generation.

## Documentation Index

The documentation has been split into dedicated modules to assist both human hosts and AI Agents in understanding the technical architecture and narrative flow.

*   **[01. DM Instructions & Persona](docs/01_DM_INSTRUCTIONS.md)**: AI Persona guidelines, directory structure, context management, and best practices for LLM DMing.
*   **[02. Multiplayer Architecture](docs/02_MULTIPLAYER_ARCHITECTURE.md)**: Node.js Relay Setup, Web REPL operations, and the three distinct DM modes (polling, manual, auto).
*   **[03. Mechanics & Challenge Rolls](docs/03_MECHANICS_AND_ROLLS.md)**: Usage of the `roll.bat`/`roll.sh` tool, challenge levels, difficulty scales, and modifiers for Graded vs Simple tests.
*   **[04. Agent Integration & Rules](docs/04_AGENT_INTEGRATION.md)**: How to leverage the Antigravity IDE constraints `.agents/rules` and skills for targeted procedural generation, plotting, and DM tasks.
*   **[05. Experimental Workflows](docs/05_EXPERIMENTAL_WORKFLOWS.md)**: Ideas and architectures for novel automated operations, such as dynamic environment rule loading and Autonomous Mode testings.

## Prerequisites
Before hosting or playing, you'll need the following environment set up:
1. **[Antigravity IDE](https://antigravity.google/download)**: Used to run the agentic capabilities.
2. **[Antigravity Auto Accept](https://open-vsx.org/vscode/item?itemName=pesosz.antigravity-auto-accept)**: A browser extension that helps the DM agent autonomously perform necessary IDE actions without waiting for human approval every turn.
3. **[Google AI Pro Subscription](https://one.google.com/about/google-ai-plans/)**: Highly recommended to ensure sufficient API quota for extensive agent operations (though short previews are possible without it).
4. **[Cloudflare Account](https://workers.cloudflare.com/)**: Required *only* if you want to deploy the online multiplayer `start-chatroom` relay (the free tier is entirely sufficient).

## Installation
1. Clone this repository to your local machine.
2. Run the master installation script in the root directory:
```bash
npm install
```
*(This commands triggers a post-install hook to automatically build and install the Cloudflare Wrangler dependencies located in `tools/multiplayer-server`!)*
3. Duplicate `.env.example` to a new file named `.env`, and populate the variables.

## Local Solo Play (Auto DM)
1. Start the Antigravity IDE with Chrome remote debugging enabled (`--remote-debugging-port=9222`).
2. Set `DM_MODE=auto` in your `.env`.
3. Boot the local chatroom via `npm run solo-chatroom`.
4. In a separate terminal, start the relay engine: `node play.js campaign_01`.
5. Open a new agent in the Agent panel and invoke the @start-session.md rule to initiate the AI DM session.
6. Open the frontend UI (`localhost:8787`), enter a command, and click "Standby".

## Multiplayer Hosting
1. Run `npm run start-chatroom` to deploy the multiplayer server to Cloudflare. First-time users will be prompted to log into Cloudflare via the browser.
2. Once complete, Wrangler will print your edge URL (e.g. `https://multiplayer-server.youraccount.workers.dev`).
3. Set `CHATROOM_URL` in `.env` to the corresponding web socket (e.g. `wss://multiplayer-server.youraccount.workers.dev/ws`). Make sure to set a password in `.env`!
4. Start the relay: `node play.js campaign_01`.
5. Open the HTTPS URL and share it with other players.
6. Open a new agent in the Agent panel and invoke the @start-session.md rule to initiate the AI DM session.
7. All players can freely submit messages in the chat, then click "Standby" to set their status to ready. The status of all players can be seen in the panel to the right. Once all players are ready, the AI DM is triggered in the host's Agent panel.
8. Once the session concludes, you can shut down the Cloudflare worker with `npm run stop-chatroom`.

## License
This project is licensed under the **GNU General Public License v3.0**. See the `LICENSE` file for more details. The product contains AI-generated text and code.