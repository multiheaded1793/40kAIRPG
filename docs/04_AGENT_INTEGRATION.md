# 4. Agent Integration & Rules

The Warhammer 40k CYOA Engine uniquely leverages the **Google Antigravity IDE** context, integrating directly with custom Agent Rules and Skills. Rather than making standard API calls to an LLM, the system essentially "remote-controls" an active IDE session allowing the built-in AI assistant to process the context and output responses natively.

## The `AGENT_RULES_SKILLS.md` Framework
The IDE naturally references rule files scoped globally or at the workspace level (in `.agents/rules/` and `.agents/skills/`). The CYOA architecture injects specific prompts directly into the Antigravity Chat panel relying on these defined constraints.

**Rules** apply broad behavioral guidelines (e.g., tone, default responses).
**Skills** provide actionable guidelines to follow specific workflows (e.g., how to generate a city, how to execute a combat turn).

### Existing Workflow: `auto-dm-turn.md`
The file `.agents/rules/auto-dm-turn.md` is central to the `auto` DM mode. It contains instructions like:
- "Consider the messages sent by the players since last turn, collated in `@/logs/player_message_pad.txt`"
- "Think and send a response as the DM; this will clear the pad"

When the relay script fires, it uses Puppeteer to trigger the IDE agent natively with: `continue @[.agents/rules/auto-dm-turn.md]`. The agent reads its workspace instruction and flawlessly acts as the Dungeon Master.

## Structuring the DM's Process with Rules and Skills

Going beyond mere response generation, you can modularize the DM's thought process into distinct Rules and Skills. This ensures consistent quality and pacing.

### 1. Planning and Plotting
Create a rule (e.g., `plot-advance.md`) that triggers at the end of a session or at key narrative milestones.
- **Function:** Tells the Agent to review `dm_notes.md`, analyze player actions in the session log, and update the "Opposition Goals" or "Impending Threats" section in the DM's secret workspace.
- **Workflow:** Instructs the Agent to think architecturally rather than reacting tactically.

### 2. Procedural Generation
Create a skill (e.g., `generate-location` in `.agents/skills/generate-location/SKILL.md`).
- **Function:** When the players explore a new sector, ask the Agent to use this skill. 
- **Workflow:** The skill instructs the Agent to roll on `json/campaign_01/underhive_encounters.json`, synthesize the results, create a new `hab_block_XX.md` file, update the `dm_notes.md` location lists, and generate an introductory descriptive blurb.

### 3. Tactical Management
Create a skill for generating Mermaid diagrams (`update-tactical-map`).
- **Function:** Instructs the Agent to translate conversational combat positions into formal Mermaid topology within `notes/campaign_01/mermaid/pad.md`.

By compartmentalizing the DM's cognitive load into these discrete files, the AI operates more reliably, flexibly, and creatively within the CYOA Sandbox without exceeding immediate context windows.
