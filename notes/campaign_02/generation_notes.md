# Campaign 02: Procedural Generation Notes

## 1. Goal-Aware Contextual Generation
When utilizing random tables, every rolled outcome must be woven into the gothic narrative of Chiron's vengeance and his uneasy alliance with the Traitor Legionnaire.

*   **The Rule of Relevance:** If you roll an "Arbites Patrol", it is never random—they are specifically hunting the mutant remnants of the uprising. If you roll a "Mutant Ambush", they are desperate scavengers who either see Chiron as a usurper of the witch's mantle, or a potential savior they are testing.
*   **Player Hooking:** Tie random results directly to the Sorcerous Amulet or the Traitor Legionnaire's silent judgments. A "Toxic Gas Leak" might trigger a hallucinatory vision from the amulet, or provide an opportunity for Chiron to demonstrate his mutant resilience to his new masters.

## 2. Using Existing JSON Tables
The `json\campaign_02\` directory holds tools to drive the narrative:
*   `hive_hazards.json`: For sudden clashes with law enforcement, rival gangers, or the hostile environment. 
*   `dark_boons.json`: **Crucial for Chiron.** Whenever Chiron acts aggressively against the Imperial order, pushes his endurance past its limits, or leans on the power of the amulet, trigger outcomes from this table to reflect the capricious favor of the Chaos Gods.

*CLI Reminder:* 
`node tools/randomizer.js table json/campaign_02/<filename>.json "<Table Header>"`

## 3. Suggested Future Tables (Proc Gen Wishlist)
As the campaign expands, consider creating the following JSONs to streamline DMing:
*   `amulet_whispers.json`: Cryptic visions, warnings, or deceptive promises emanating from the sorcerous amulet. Use this to inject lore about the beloved's true agenda.
*   `legionnaire_demands.json`: Arbitrary, cruel, or impossibly difficult tasks commanded by Chiron's patron.
*   `underclass_uprisings.json`: Opportunities for Chiron to radicalize more mutants and laborers into his warband.

## 4. On-the-Fly Generation Strategy
*   Whenever Chiron rolls a **Critical Success (Degrees of Success 3+)**, let the player narrate a moment of brutal, terrifying glory. It should emphasize the tragic irony: the Imperium built this monster for sport, and now he is loose.
*   Whenever Chiron rolls a **Critical Failure (Degrees of Failure 3+)**, immediately generate a complication: the amulet surges with painful Warp feedback, an underling betrays him out of fear, or the Traitor Legionnaire forcefully asserts his dominance over the mutant.
