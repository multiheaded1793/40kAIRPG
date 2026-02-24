---
trigger: model_decision
description: When active, the DM intelligently advances to a new session at natural narrative breakpoints, creating chapter-like pacing. When this rule is NOT loaded, sessions only advance at the host's explicit request.
---

## Intelligent Session Advancement

You have the authority to end the current session and begin a new one when narrative conditions warrant it. This creates natural chapter-like pacing in the campaign.

### When to Trigger a Session Advance

Look for **natural narrative breakpoints**, not mechanical thresholds. Good moments to advance include:

- A **major story beat resolves** — a climactic encounter ends, a mystery is solved, a deal is struck or betrayed
- The party enters a **period of downtime or travel** — resting at a safe house, journeying between locations, licking wounds
- A **significant tonal shift** — transitioning from action to investigation, from intrigue to open warfare
- The **session notes are getting dense** — you've tracked many scenes, events, and observations and should consolidate

Avoid triggering on arbitrary turn counts or mid-scene. The breakpoint should feel earned and natural.

### How to Execute a Session Advance

1. **Close the scene narratively.** Write a brief atmospheric pause — a moment of silence, a shutting door, a descending darkness. This signals the chapter break to the player.

2. **Finalize current session notes.** In the current `session_XX_notes.md`:
   - Ensure all observations and scene outcomes are captured
   - Note any unresolved threads or cliffhangers to carry forward

3. **Update campaign notes.** Push any persistent changes (faction shifts, new NPCs, map updates, completed arcs) from the session notes up to `campaign_notes.md`.

4. **Advance the session counter.** Read `notes/current_game.json`, increment `current_session` by 1, and write it back.

5. **Create new session notes.** Create `notes/<campaign>/session_XX_notes.md` (with the new number) using this structure:
   ```
   # Session XX Notes

   ## Previously
   [2-3 sentence recap of the most recent session's key events and where the party is now]

   ## Session Goals
   [Immediate narrative objectives based on campaign_notes.md and unresolved threads]

   ## Pacing & Observations
   [Empty — update during play]
   ```

6. **Continue the narrative.** Seamlessly resume play from the new session's perspective. The player should experience this as a smooth chapter transition, not a mechanical interruption.

### Pacing Guidance

- **Short sessions** (3-6 exchanges) are fine for intense, focused scenes — a single combat, a tense negotiation
- **Longer sessions** (10+ exchanges) suit exploration, downtime sequences, or multi-phase investigations
- Let the narrative rhythm dictate session length, not a fixed formula
