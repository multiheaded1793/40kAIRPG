---
name: dh-ruleset-social
description: Social encounter mechanics — NPC dispositions, Influence tracking, investigation pacing, persuasion/deception flows, and the Three-Clue Rule.
---
# Ruleset: Social Encounters

This skill provides mechanical scaffolding for social interaction, investigation, and political intrigue. It turns "I talk to the NPC" into a structured exchange with stakes, consequences, and narrative momentum.

> **Design principle**: Social mechanics should feel like *leverage*, not *mind control*. A good Rapport roll doesn't override NPC personality — it shifts what the NPC is willing to do.

---

## 1. NPC Disposition Scale

Every named NPC has a disposition toward the party. Track this as a qualitative band, not a number. Disposition can shift within a scene based on player actions.

| Disposition | What It Means | Social Test Modifier |
|---|---|---|
| **Hostile** | Actively working against you. Will lie, obstruct, or attack. | Hard (−20) |
| **Suspicious** | Guarded. Will answer direct questions but volunteer nothing. | Difficult (−10) |
| **Neutral** | No strong opinion. Will cooperate if there's a reason to. | Challenging (+0) |
| **Friendly** | Positively inclined. Will share information and do small favours. | Easy (+20) |
| **Devoted** | Loyal. Will take personal risks on your behalf. | Routine (+20) or auto-success |

### Disposition Shift Triggers
Disposition shifts when the player does something that *matters to the NPC* — not just when they roll well.

| Action | Shift |
|---|---|
| Helping with the NPC's personal problem | +1 to +2 steps |
| Appealing to the NPC's values or faction loyalty | +1 step |
| Offering a credible bribe, favour, or trade | +1 step |
| Threatening, insulting, or failing to show respect | −1 to −2 steps |
| Betraying the NPC or their faction | −2 steps, possibly permanent |
| Reputation precedes you (high/low Influence with their faction) | ±1 step |

### Agent Rule
When the player approaches an NPC, silently assess their disposition *before* any roll is made. Let the disposition colour the NPC's body language, word choice, and willingness to engage. The roll modifies — the disposition *is* the foundation.

---

## 2. Social Test Flow

Use this flow whenever a player attempts to persuade, deceive, intimidate, or otherwise influence an NPC.

### 2.1 Determine Intent
What does the player want? Categorise it:
- **Information**: The NPC knows something the player wants to learn.
- **Action**: The player wants the NPC to *do* something (open a door, look the other way, join their cause).
- **Concession**: The player wants the NPC to *stop* doing something or give something up.

### 2.2 Choose Skill
| Approach | Skill | Opposed By |
|---|---|---|
| Charm, flattery, friendliness | Rapport (Charm) | Discipline (Composure) |
| Lying, misdirection | Rapport (Deception) | Intuition (Human) |
| Bargaining, trading favours | Rapport (Haggle) | Discipline (Composure) or Logic (Evaluation) |
| Friendly questioning, gossip | Rapport (Inquiry) | Discipline (Composure) |
| Threats, force of personality | Presence (Intimidation) | Discipline (Composure) |
| Formal questioning, pressure | Presence (Interrogation) | Discipline (Composure) or Fortitude (Pain) |
| Inspiring, rallying | Presence (Leadership) | — (usually uncontested) |

### 2.3 Apply Modifiers
- **Disposition** sets the base difficulty (see table above).
- **Leverage**: If the player has specific information, proof, or a credible threat, grant **Advantage**.
- **Preparation**: If the player researched the NPC beforehand (asked around, read dossiers), grant +10 to +20.
- **Unreasonable Request**: If the player asks for something that contradicts the NPC's core values or self-interest, impose **Disadvantage** regardless of skill.

### 2.4 Resolve
- Roll the Opposed Test (or simple test for Leadership).
- **Success**: The NPC moves toward compliance. High SL = eager cooperation. Low SL = reluctant, with conditions.
- **Failure**: The NPC refuses. Apply Failing Forward (see §5).
- **Critical**: The NPC is genuinely won over — they may volunteer extra information or exceed the request.
- **Fumble**: The player says the wrong thing. Disposition drops one step, and the NPC may become actively obstructive.

### 2.5 Escalation
If the first attempt fails, the player can try again — but only if they **change their approach**. Same skill, same argument = same result. A new angle, new leverage, or a different character attempting = a new test at one step harder difficulty.

---

## 3. Faction Influence

Track the party's standing with each relevant faction on the **−5 to +5 scale** (see `dh-ruleset-core` §3.4).

### When to Adjust Influence
- **End of mission**: Based on the outcome and whom the party sided with. Typically +1 for allies, −1 for those betrayed or ignored.
- **Significant acts**: Saving a faction leader (+2), publicly insulting a faction (−2), destroying a cult stronghold (+1 with Ecclesiarchy, −1 with that cult's allies).
- **Accumulation**: Small favours accumulate. Three minor services to a faction = +1 shift.

### Influence as Leverage
When the party's Influence with a faction is high, they gain mechanical benefits in social encounters with that faction's members:
- **+1 to +2**: NPC starts at Friendly disposition instead of Neutral.
- **+3 to +5**: NPC starts at Devoted; may grant access to restricted resources, information, or locations.
- **−1 to −2**: NPC starts at Suspicious; may refuse to speak without pressure.
- **−3 to −5**: NPC starts at Hostile; may actively inform against the party or set traps.

### Agent Rule
At the start of each mission, identify **2–3 factions** with competing interests in the mission's outcome. Note their current Influence scores in session notes. Ensure that *fully satisfying one faction comes at a cost to at least one other*.

---

## 4. Investigation Pacing

Structure investigation-focused sessions around four phases. The DM should internally track which phase the party is in and pace accordingly.

### Phase Structure
| Phase | Zoom Level | What Happens |
|---|---|---|
| **1. Call to Action** | Skim/Play | Patron briefing. The party receives their orders, initial intel, and the patron's suspicions. Establish stakes. |
| **2. Gather Clues** | Play | Visit the initial scene(s). Apply the Three-Clue Rule (§5). No combat required — this phase is about observation and conversation. |
| **3. Investigate Suspects** | Play | The largest phase. Follow leads, interrogate suspects, cross-reference clues. Suspects lie, redirect, and muddy the waters. Multiple branching paths. |
| **4. Judgement** | Play/Crunch | The climax. Confront the culprit, make an arrest, survive a trap. Often messy. Often violent. |

### Pacing Guidance
- If the party is stuck in Phase 2 for more than ~3 exchanges, introduce a new clue via a different discovery path.
- If Phase 3 feels like it's dragging, have the situation **escalate** — the criminal strikes again, an ally is threatened, a deadline approaches.
- Phase 4 should feel *earned*. The party's preparation in earlier phases should pay off mechanically (Superiority) and narratively.

---

## 5. The Three-Clue Rule

Every vital piece of evidence needed to advance the investigation must have **at least three distinct ways** to be discovered.

### Rule
- **Clues are found, not rolled for.** If the player goes to the crime scene, they find the spent casings. No Awareness Test gates *discovery*.
- **Tests interpret, not discover.** A Logic (Investigation) test tells you the casings lack manufactorum serial numbers. Failing this test means you have a mysterious clue — not no clue.
- **Three paths minimum**: Design each vital clue with at least three discovery methods. At least one should be nearly foolproof (e.g., a frightened witness approaches the party).

### Example
**Vital Clue**: The murdered Adept was killed by a Recidivist.
1. *(Crime scene)* Spent casings with no serial numbers — recognisable via Logic (Investigation).
2. *(Servo-skull)* The Adept's trashed servo-skull contains fractured images of the attacker — recoverable via Tech (Engineering).
3. *(Witness)* A scared hab-block resident saw someone who looked like a ganger fleeing the scene — approaches the party if they spend time canvassing.

### Agent Rule
When planning a mystery, write down the 2–3 vital clues and their discovery paths in the session notes *before* play begins. If the party misses all three paths for a clue, **move the clue to them** — have it surface through an NPC contact, a patron tip-off, or an escalation of the situation.

---

## 6. Failing Forward in Social Encounters

Failed social rolls should never dead-end the story. They change the *terms* of engagement.

| Situation | On Failure… |
|---|---|
| Persuading an NPC to talk | They refuse, but their *reason for refusing* is itself a clue |
| Deceiving a guard | The guard doesn't buy it, but hesitates — you have 6 seconds to act before they raise the alarm |
| Intimidating a suspect | They clam up but visibly flinch at a specific topic — you know what to press on next time |
| Haggling for information | The informant wants something in return — a side quest, a favour, or cold hard Solars |
| Rallying frightened civilians | They won't fight, but they'll barricade doors and hide, giving you time |

### Agent Rule
After a failed social test, ask: *"What does this failure reveal, complicate, or cost?"* Then narrate that consequence. The player should always leave a failed social interaction with *something* — new information, a new obstacle, or a new angle — even if it's not what they wanted.
