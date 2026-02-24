# Campaign Test: Procedural Generation Notes

## 1. Goal-Aware Contextual Generation
When utilizing random tables, every rolled outcome must be woven into the noir investigation of the Blazing Seraph cult. This is a hive-city investigation, not a dungeon crawl—encounters should feel like complications in a detective thriller, not random monster spawns.

*   **The Rule of Relevance:** If you roll a "Vigilite Shakedown" from `rokarth_encounters.json`, ask: *Why now?* Perhaps word of the party's investigation has reached Squad Leader Baranoth, or a nervous Cutter informant tipped off the Vigilites to slow the acolytes down.
*   **Player Hooking:** Tie random results directly to Wilkus Garn's Administratum knowledge. If a "Bureaucratic Obstruction" is rolled, make it a form or a protocol that Garn recognizes and can exploit (+10 to bypass). If a "Gang Confrontation" is rolled, Leo should immediately have intel on the participants.

## 2. Using Existing JSON Tables
The `json\campaign_test\` directory holds tools to drive the narrative:
*   `rokarth_encounters.json`: For transit hazards, social complications, and Vigilite interference. Use these when the party is navigating between major locations (Thaler Hostelry → Acid Refinery → Maglev Nexus, etc.).
*   `investigation_clues.json`: **Core Table.** When the party investigates a new location or interrogates an NPC, supplement scripted adventure clues with minor atmospheric results from this table. These are flavor clues that reinforce the cult's presence without giving away the plot.
*   `cult_manifestations.json`: When the party gets close to cult activity (the Cathedrum, the Claymore, a Cutter safehouse), roll on this table for unsettling environmental details that foreshadow the Tzeentchian corruption.

*CLI Reminder:*
`.\roll.bat table json\campaign_test\<filename>.json "<Table Header>"`

## 3. Superiority Tracking
This campaign emphasizes the *Imperium Maledictum* Superiority mechanic. The AI DM should:
*   Grant **+1 Superiority** to the party whenever they discover actionable intelligence about an enemy *before* engaging them (e.g., eavesdropping on Cutter guard chatter, observing weapons through a window, sensing the enemy's fear with Intuition).
*   Each point of Superiority grants **+1 SL** to one Test per character per combat turn.
*   Explicitly narrate moments where Superiority can be earned: *"Do you want to scope out the Chop Shop before going in?"*
*   Track enemy **Resolve** — gangers should flee or surrender when outmatched, not fight to the last man. Blister always runs when half her crew falls.

## 4. The Three-Clue Rule (Automated)
For every critical story beat, the campaign_notes.md defines scripted clues. The AI DM must ensure that:
*   Skill Tests determine the *depth* of understanding, never whether a clue is found at all.
*   If the party fails to discover a clue at one location, it must become available through an alternative path (Leo's contacts, Helza's Ministorum credentials, a random encounter that drops a hint).
*   If the party reaches a dead end, Leo should proactively suggest an alternative lead in-character.

## 5. Suggested Future Tables (Proc Gen Wishlist)
As the campaign expands beyond the starter adventure, consider creating:
*   `npc_names_rokarth.json`: Rokarthian labourer names, Vigilite callsigns, and Ministorum honorifics.
*   `hive_ambience.json`: Atmospheric one-liners for describing the noise, smell, and visual texture of Hive Rokarth during transit scenes.
*   `inquisitorial_seal_consequences.json`: Escalating consequences for each use of the Rosette (suspicion, ambush, full Cutter mobilization, Artosy learning of the Inquisition's presence).

## 6. On-the-Fly Generation Strategy
*   Whenever the player rolls a **Critical Success (SL 3+)**, let them narrate a triumphant moment of Imperial competence — a hunch paying off, a bluff that makes a Vigilite sweat, or a cipher decoded in seconds.
*   Whenever the player rolls a **Critical Failure (SL -3 or worse)**, immediately generate a complication: the Cutters are tipped off, a Vigilite confiscates evidence, or Reeta's Psyniscience flares involuntarily, drawing unwanted psychic attention.
