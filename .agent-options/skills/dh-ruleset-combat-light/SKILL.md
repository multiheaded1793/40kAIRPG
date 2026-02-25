---
name: dh-ruleset-combat-light
description: Narrative-oriented combat — party-turn vs enemy-turn structure, collective initiative, qualitative positioning, Superiority/Resolve pacing. Designed for async play.
---
# Ruleset: Combat (Light)

Quick, narrative-first combat for encounters that should feel dangerous but not slow. The party acts as a unit, the DM resolves enemy responses, and the fight moves at the speed of the story.

> **Design principle**: Combat should be *dramatic punctuation*, not a board game. Light combat resolves in 2–4 exchanges. If a fight would take longer, either raise the stakes (Crunch zoom) or end it with Resolve.

---

## 1. Initiating Combat

When violence breaks out, follow these steps before the first blow lands:

### 1.1 Set the Scene
Describe the environment in one or two vivid sentences. Name the enemies visible to the party. Note any obvious cover, hazards, or features. Keep it punchy:

> *Three gangers block the alley ahead — two with autoguns behind an overturned cargo sled, one with a chainsword advancing. Behind you, the corroded bulkhead you just came through. Toxic runoff pools to the left.*

### 1.2 Check Superiority
Did the party prepare for this fight? Award Superiority (0–3):

| Preparation | Superiority Gained |
|---|---|
| **Know Thy Foe** — gathered intel on enemies (composition, weapons, weaknesses) | +1 |
| **Know Thy Battlefield** — scouted the area (exits, cover, hazards, sight lines) | +1 |
| **Know Thy Players** — coordinated a plan (roles assigned, flanks set, ambush positions) | +1 |

Superiority adds **+SL** to all party combat tests for the encounter. It can also increase during combat (see §4).

### 1.3 Collective Initiative
One roll determines who acts first:

1. Roll `d10` + **party's best Agility Bonus** (the most alert character).
2. The DM rolls (or sets) `d10` + **enemy leader's Agility Bonus**.
3. **Higher total** acts first.
4. **Tie**: Simultaneous — both sides' actions resolve at the same time. Narrate the chaos.

**Surprise**: If one side is completely unaware, the other gets a **free phase** before initiative is rolled. An ambush is devastating.

---

## 2. The Combat Round

Each round has two phases. Who goes first depends on initiative (§1.3).

### 2.1 Party Phase

The DM collects player intentions from their messages. Players can declare actions in any order — there's no individual turn sequence.

Each PC gets:
- **One Move** — change position, get to cover, close distance, disengage from melee.
- **One Action** — attack, use a skill, manifest a power, interact with the environment, aid an ally.

**Flexible interpretation**: If a player describes doing two small things (*"I duck behind the crate and fire my laspistol"*), that's Move + Action — allow it. If they describe something unreasonable (*"I sprint across the room, reload, throw a grenade, and kick down the door"*), pick the two most impactful actions and narrate the rest as impossible in the chaos.

Once all PC actions are collected (or the DM decides enough time has passed), resolve them:
- Roll attacks and tests.
- Apply damage and conditions.
- Narrate the results as a single, fluid combat beat.

### 2.2 Enemy Phase

The DM resolves all enemy actions in one narrative beat:

- **Group similar enemies**: *"The three gangers open fire from behind the barricade"* = one description, separate rolls only if targeting different PCs.
- Determine NPC behaviour based on their **Resolve** (see §4).
- Roll attacks against PCs. Apply damage.
- Narrate the violence — make enemies feel alive, not mechanical.

### 2.3 Round End
After both phases:
- Check the **Wound Ladder** (§3) for each combatant.
- Check **Resolve** (§4) — has the fight's outcome become clear?
- Offer narrative opportunities: *"The ganger leader is reeling — do you press the attack or demand his surrender?"*

---

## 3. Attack Resolution & Wounds

### 3.1 Melee Attacks
**Opposed Test**: Attacker's Melee vs Defender's Melee (or Reflexes (Dodge) if Dodging).
- **Attacker wins**: Damage = Weapon Damage + SL difference − target's Armour at hit location.
- **Defender wins**: Attack deflected. If the defender's SL is high enough, they may counterattack narratively.

### 3.2 Ranged Attacks
**Simple Test**: Attacker's Ranged at appropriate difficulty.
- **Success**: Damage = Weapon Damage + SL − target's Armour at hit location.
- **Target in Cover**: Apply cover Armour bonus (+2 Light / +4 Medium / +6 Heavy).
- **Dodge Reaction**: If the target hasn't used their Reaction this round, they may roll Reflexes (Dodge) as an Opposed Test to avoid the shot entirely.

### 3.3 Hit Location
Determined by the **units digit** of the attack roll:
| Digit | Location |
|---|---|
| 1 | Head |
| 2 | Left Arm |
| 3 | Right Arm |
| 4 | Left Leg |
| 5 | Right Leg |
| 6–0 | Body |

### 3.4 Wound Ladder
Track wounds using qualitative bands (from `dh-ruleset-core` §3.1):

| Band | What It Means | Mechanical Effect |
|---|---|---|
| **Fresh** | No injuries | None |
| **Bloodied** | Taken significant hits (>50% Max Wounds) | Narrate pain and fatigue. No mechanical penalty. |
| **Battered** | At Max Wounds | **Move OR Action only** (not both). Must pass **Fortitude (Pain) Test** each round or fall Unconscious. |
| **Critical** | Taken a Critical Wound (exceeded Max Wounds) | Specific injury to a body part. Consult Critical effects. Ongoing penalties. |
| **Dying** | Untreated Critical Wounds exceed Toughness Bonus | **Dead at end of round** unless stabilised with Medicae. |

### 3.5 Criticals & Fumbles
If an attack roll is **doubles** (11, 22, 33…):
- **Positive SL** → **Critical Hit**: Automatic Critical Wound even if target isn't at Max Wounds. Something spectacular happens.
- **Negative SL** → **Fumble**: The attack goes wrong — weapon jams, footing slips, an ally is endangered. The DM narrates the mishap.

### 3.6 Sudden Death (Mooks)
Lesser enemies — gangers, cultists, basic troopers — **die on a single Critical Wound**. No accumulating injuries. This keeps trash encounters fast.

---

## 4. Superiority & Resolve — Ending Fights

Not every fight needs to end in total annihilation. Superiority and Resolve exist to end combats at dramatically appropriate moments.

### 4.1 Resolve (NPC Stat)
Every enemy group has a **Resolve** value (typically 1–4):

| Resolve | Who |
|---|---|
| 1 | Cowardly, press-ganged, undisciplined (frightened cultists, conscripts) |
| 2 | Professional but self-interested (mercenaries, gangers, hired muscle) |
| 3 | Motivated, loyal, or fanatical (trained soldiers, devoted cultists, bodyguards) |
| 4 | Fearless, elite, or cornered (Astartes, zealots, creatures with nothing to lose) |

### 4.2 Resolve Breaks
When the party's **Superiority ≥ enemy Resolve**, enemies become **Desperate**. The DM chooses how they react:

| Desperate Behaviour | When to Use |
|---|---|
| **Flee** | Self-interested enemies with an escape route. They scatter. |
| **Surrender** | Professional enemies who know they're beaten. They drop weapons. |
| **Go Berserk** | Fanatical or cornered enemies. Reckless attacks at Disadvantage, but dangerous. |
| **Bargain** | Intelligent enemies. They offer information, hostages, or deals. |
| **Break Formation** | Disciplined groups lose cohesion. Leader loses control. |

### 4.3 Gaining Superiority During Combat
Superiority can increase mid-fight through dramatic actions:

| Action | Superiority Gained |
|---|---|
| Defeating the enemy leader or a particularly fearsome foe | +1 |
| Executing a clever tactical manoeuvre (flanking, cutting off escape, using environment) | +1 |
| Dramatic display of power (overt psychic ability, heavy weapon deployment) | +1 |
| Demoralising the enemy through intimidation or psychological warfare | +1 |

**Cap**: Superiority cannot exceed 3 during an encounter.

### 4.4 Losing Superiority
| Event | Superiority Lost |
|---|---|
| A PC falls to Critical or Dying | −1 |
| The party retreats from a zone or position | −1 |
| An enemy receives reinforcements | −1 |
| The party's plan visibly fails | −1 |

### Agent Rule
Use Resolve to **skip the boring parts of combat**. If two mook gangers are left and the party has Superiority 3, don't make the players grind through two more rounds. Narrate the rout: *"The last two gangers see their leader crumple. One throws down his autogun and bolts for the service hatch. The other follows, cursing."*

---

## 5. Positioning (Narrative)

No zone maps or grids in Light mode. Track positions with natural language using four relative distances:

| Distance | What It Means | Who Can Act |
|---|---|---|
| **Engaged** | In melee range, locked in close combat | Melee attacks. Must **Disengage** (Move) to break away safely. Ranged attacks at Disadvantage. |
| **Nearby** | Same room / area. Within pistol and thrown range. | Can close to Engaged with a Move. Pistols, thrown weapons, most powers effective. |
| **Far** | Across the room, down the corridor, on the other side of the clearing. | Requires a full round of movement (Move + Run Action) to close. Only long guns and heavy weapons effective. |
| **Distant** | Out of the immediate fight entirely. | Extreme range. Snipers only. Mostly narrative. |

### Tracking Positions
The DM keeps a brief note in session notes. Example:

> *Round 2: Kael ENGAGED with Cult Leader at the altar. Vex NEARBY behind a pew (Light Cover). Three cultists FAR at the entrance. Sorcerer DISTANT on the gallery above.*

### Cover
If a character is behind cover, note it alongside their position. Cover only protects against ranged attacks:
- **Light** (+2 Armour): Low wall, crate, thin pillar
- **Medium** (+4 Armour): Overturned table, cargo sled, doorframe
- **Heavy** (+6 Armour): Reinforced barricade, vehicle hull, thick stone

---

## 6. Common Actions (Quick Reference)

Players don't need to pick from a formal action list. The DM interprets their described actions using this reference:

| Player Says… | DM Interprets As… |
|---|---|
| "I shoot the ganger" | **Ranged Attack** — Roll Ranged vs. difficulty |
| "I charge the leader" | **Charge** — Move to Engaged + Melee Attack with Advantage; Disadvantage on defence until next round |
| "I take cover behind the crate" | **Take Cover** — Move behind cover, gain cover bonus |
| "I try to intimidate them into surrendering" | **Presence (Intimidation)** — may shift Resolve/behaviour |
| "I dodge" | **Dodge** — Advantage on next defence; can dodge ranged this round |
| "I help Kael fight" | **Aid** — Grant Advantage on Kael's next combat test |
| "I run for the exit" | **Flee** — Move + Action to leave combat; party loses 1 Superiority |
| "I patch up Vex" | **Medicae** — First aid to stabilise or heal |
| "I use my psychic power" | **Manifest** — See `dh-ruleset-psyker` |
| "I look for something useful" | **Search / Interact** — Awareness test or use a Feature |

### Agent Rule
**Don't gatekeep actions.** If a player describes something creative that isn't on this list, let them try it. Set a reasonable skill and difficulty, roll, and narrate the result. The list exists for the DM's convenience, not as a constraint on player creativity.

---

## 7. Conditions (Quick Reference)

Conditions are applied by attacks, Perils, environmental hazards, or narrative events. Track them in session notes.

| Condition | Effect | Removed By |
|---|---|---|
| **Bleeding** | d10 Damage at start of each round, ignoring Armour | Medicae Test or healing |
| **Blinded** | Cannot make sight-based Tests; all attacks at Disadvantage | End of scene or Medicae |
| **Frightened** | Disadvantage on all Tests; must flee if possible | Discipline (Fear) Test; or source removed |
| **Poisoned** | Disadvantage on physical Tests; may worsen over time | Fortitude (Poison) Test; or Medicae |
| **Prone** | Melee attacks against you at Advantage; ranged at Disadvantage; stand up costs Move | Stand up (Move) |
| **Restrained** | Cannot Move; Disadvantage on Melee/Ranged/Dodge | Break free: Athletics opposed test |
| **Stunned** | Lose next Action | Automatic: clears at end of next turn |
| **Unconscious** | Out of action entirely | Medicae, or natural recovery after scene |

---

## 8. Fate in Combat

Players may spend or burn Fate at any time during combat:

| Fate Option | Effect | Cost |
|---|---|---|
| **Reroll** | Reroll any one test | Spend 1 Fate |
| **+1 SL** | Add +1 SL to a test result | Spend 1 Fate |
| **Act First** | Choose to act first in the next round regardless of initiative | Spend 1 Fate |
| **Shake It Off** | Remove one Condition | Spend 1 Fate |
| **Ignore Critical** | Ignore the effects of a Critical Wound for 1 round | Spend 1 Fate |
| **Die Another Day** | Survive certain death — unconscious with 1 wound remaining | **Burn** 1 Fate (permanent) |
| **Turn the Tide** | Party immediately gains +1 Superiority | **Burn** 1 Fate (permanent) |

### Agent Rule
When a PC is about to die, **always offer the Fate escape** before narrating death. Make it dramatic: *"The bolt round punches through your carapace. You feel your ribs crack. The world dims…* **You have 2 Fate remaining. Do you burn one to survive this?"**

---

## 9. Encounter Design Guidance

### Scaling
| Party Tier | Enemies |
|---|---|
| Starting | 1 mook per PC + 0–1 Elite or Leader |
| Experienced (500+ XP) | 1.5 mooks per PC + 1–2 Elites or Leaders |
| Veteran (2000+ XP) | 2 mooks per PC + 2–3 Elites or Leaders |

### Encounter Flavour
Don't just throw enemies at the party. Add **one complication** to make each fight memorable:
- **Environmental**: Spreading fire, collapsing floor, toxic gas.
- **Tactical**: Enemies have hostages, are waiting for reinforcements, or control the high ground.
- **Objective**: The party must reach a cogitator, protect a witness, or stop a ritual — not just kill everyone.
- **Moral**: Enemies are desperate civilians, deceived loyalists, or pitiable mutants. Violence has a cost.

### Pacing
- **Most fights should last 2–3 rounds.** If a fight is dragging past round 4 in Light mode, use Resolve to end it.
- **Mook cleanup is boring.** Once the leader falls and Superiority breaks Resolve, narrate the rout.
- **Not every encounter needs combat.** If Superiority ≥ Resolve before the first blow, the enemies may fold without a fight. Narrate the intimidation, the standoff, the surrender.
