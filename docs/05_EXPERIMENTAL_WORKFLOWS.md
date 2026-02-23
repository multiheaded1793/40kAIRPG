# 5. Experimental Workflows & Testing

The combination of the CYOA Engine and the Antigravity Agent framework opens the door for orthodox and unorthodox testing methodologies to optimize the creative flow. 

## 1. Flexible Agent Configurations (`.agent-options`)

Currently, Workspace Rules must be placed directly inside `.agents/rules/` for the IDE to auto-detect them. As campaigns diversify and different DM Personas are required (e.g., a grimdark Inquisitor vs a chaotic cult leader), managing these rules manually is cumbersome.

### The Findings & Idea
We can implement a flexible configuration loader tied to the `.env` file. 

*   **Structure:** Create an `.agent-options/rules/` and `.agent-options/skills/` directory containing the total repository of available modules (e.g., `grimdark-dm.md`, `combat-heavy-dm.md`, `auto-dm-turn.md`).
*   **`.env` Mapping:** In the `.env` file, specify:
    `AGENT_RULES=["auto-dm-turn.md", "grimdark-dm.md"]`
    `AGENT_SKILLS=["procedural-generation"]`
*   **The Loader Script:** Upon starting the server (`node play.js`), a pre-flight function checks these environment variables, clears the active `.agents/` folder, and dynamically symlinks or copies the specified files from `.agent-options/` into `.agents/`. 
*   **Result:** The IDE Agent is rebooted or triggered with a perfectly tailored set of rules and skills for that specific session or campaign without polluting the global workspace.

## 2. Autonomous Mode: The AI Simulator

How do we test whether `grimdark-dm.md` produces a better narrative experience than `combat-heavy-dm.md` without requiring a human player to spend hours manually typing out actions? We let the AI play itself.

### The Findings & Idea
We can engineer an "Autonomous Mode" designed specifically as a testing and validation framework.

*   **The Setup:** We define a specific `.agents/skills/autonomous-simulation/SKILL.md`.
*   **The Execution:** When invoked, the Agent takes over both roles. 
    1. It reads the premise and DM documentation.
    2. It acts as the DM, setting the opening scene.
    3. It switches personas to act as the Player, submitting an action based on standard CYOA survival logic.
    4. It switches back to DM to resolve the roll and narrate consequences.
    5. This loop repeats for a pre-defined (e.g., 5-turn) introductory adventure.
*   **The Output:** Upon reaching the turn limit, the Agent synthesizes the `logs/` into a comparative report detailing pacing, adherence to rules, creativity, and structural integrity. 
*   **The Benefit:** By automating the gameplay loop, we can rapidly A/B test different `.env` configurations, JSON prompt weights, and DM instruction sets, saving the human host hours of playtesting while empirically refining the "optimal, flexible, creative flow."
