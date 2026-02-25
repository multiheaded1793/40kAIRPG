# Campaign 01: Procedural Generation Notes

## 1. Goal-Aware Contextual Generation
When utilizing random tables, do not treat the results as isolated events. Every rolled outcome must be woven into the current narrative context. 

*   **The Rule of Relevance:** If you roll a "Scavvy Ambush" from `underhive_encounters.json`, ask: *Why are they ambushing now?* Perhaps they were hired by the Profane target to slow the Inquisition down, or perhaps they've looted the corpse of the cell's previous (deceased) member and are using their gear.
*   **Player Hooking:** Tie random results directly to Shulie. For example, if a "Toxic Gas Leak" is generated, make it a gas Shulie recognizes from their urchin days, giving their `Underhive Scum` trait a chance to shine (+10 test to bypass).

## 2. Using Existing JSON Tables
The `json\campaign_01\` directory currently holds tools to drive the narrative:
*   `underhive_encounters.json` & `lower_hive_encounters.json`: For transit hazards, gang confrontations, and environmental dangers. Use these when navigating between major nodes.
*   `loot.json`: For scavenging results. Remember, Inquisitorial agents might not care about petty loot, but Shulie definitely does.
*   `warp_phenomena.json`: **Crucial for Shulie.** Whenever Shulie pushes a "Granny's Luck" (Willpower) roll and fails, or rolls a 90+, trigger a minor outcome from this table to reflect their Latent Wyrd status leaking into reality.

*CLI Reminder:* 
`node tools/randomizer.js table json/campaign_01/<filename>.json "<Table Header>"`

## 3. Suggested Future Tables (Proc Gen Wishlist)
As the campaign expands, consider creating the following JSONs to streamline DMing:
*   `npc_names_necromunda.json`: Underhive slang names, gang monikers, and High Gothic offworlder names.
*   `profane_clues.json`: A table of minor clues pointing toward the Heretical target (e.g., eight-pointed stars carved in bone, strange mechanical hums, mutated vermin).
*   `inquisitorial_demands.json`: The Interrogator's patience is thin. A table of threats, ultimatums, or grim advice to drop into dialogue when the pace slows down.
*   `wyrd_manifestations_minor.json`: Flavor-only psychic bleeds that occur around Shulie (e.g., shadows stretching incorrectly, a sudden drop in temperature, the smell of ozone) to build latent tension without causing full mechanical Warp backlash.

## 4. On-the-Fly Generation Strategy
*   Whenever the player rolls a **Critical Success (Degrees of Success 3+)**, let them narrate a positive twist to the scene, or introduce a beneficial random element.
*   Whenever the player rolls a **Critical Failure (Degrees of Failure 3+)**, immediately generate a complication using one of the encounter tables or the warp table, regardless of the current location.
