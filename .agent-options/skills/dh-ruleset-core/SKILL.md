---
name: dh-ruleset-core
description: Foundational AI DM ruleset — zoom levels, d100 test resolution, state tracking, failure scaffolding, and lightweight exploration/progression mechanics.
---
# Ruleset: Core Mechanics

This skill provides the mechanical skeleton for all AI DM rulings. It defines *when* to invoke mechanics, *how* to resolve them, and *how* to track results — without prescribing narrative tone or setting detail.

> **Design principle: "Skeleton, not straitjacket."** These rules exist to prevent drift and ensure consistency. The DM agent should improvise freely within this scaffolding but never contradict it.

---

## 1. Zoom Levels — Skim, Play, Crunch

Every moment in the game operates at one of three zoom levels. **Default to Play.** Only shift when the narrative demands it.

| Zoom | When to Use | What It Looks Like |
|---|---|---|
| **Skim** | Routine, low-stakes, transitional. No meaningful risk or choice. | Pure narration, no rolls. "You pick the lock, no problem." Travel montages, shopping, resting. |
| **Play** | Moderate stakes, interesting choices, or player-initiated actions with uncertain outcomes. | One or two rolls with clear consequences. The default mode for most gameplay. |
| **Crunch** | High stakes, dramatic set-pieces, boss encounters, or any scene where tactical positioning matters. | Structured rounds, wound tracking, zone maps. The exception, not the rule. |

### Zoom Shift Triggers
- **Skim → Play**: A player attempts something with a meaningful chance of failure, or declares an action with consequences.
- **Play → Crunch**: Combat begins, a chase starts, or the situation becomes multi-party and simultaneous.
- **Crunch → Play**: The decisive blow lands, the enemy breaks, or the immediate danger passes.
- **Play → Skim**: The scene is wrapping up, the outcome is a foregone conclusion, or nobody is at risk.

### Agent Rule
When shifting zoom levels, briefly narrate the transition. Don't just mechanically switch — let the player feel the tempo change:
- *"The corridor is clear. You move quickly through the underhive passages…"* (Crunch → Skim)
- *"The ganger's eyes narrow. He reaches for his blade—"* (Play → Crunch)

---

## 2. Test Resolution — The Lean Anchor Pattern

Whenever a player action requires a roll, follow this pattern:

### 2.1 Trigger
Ask: *Does this action have a meaningful chance of failure AND meaningful consequences for failure?*
- **No** → Narrate success (Skim). No roll needed.
- **Yes** → Proceed to Process.

### 2.2 Process
1. **Identify the Skill**: Choose the most relevant skill + specialisation (see Skill Reference below).
2. **Set Difficulty**: Apply one modifier from the Difficulty Scale.
3. **Call for the Roll**: Use `roll d100` via the roll tool.
4. **Compute Success Levels (SL)**: SL = tens digit of target number − tens digit of rolled number.
   - Auto success on **01–05** regardless of target (minimum +1 SL).
   - Auto failure on **96–00** regardless of target (minimum −1 SL).
5. **Check for Criticals/Fumbles**: If the roll is doubles (11, 22, 33…):
   - Positive SL → **Critical** (exceptional success, bonus narrative effect).
   - Negative SL → **Fumble** (mishap, roll on fumble table or narrate complication).
6. **Apply Advantage/Disadvantage** (if applicable): Roll twice, take better (Advantage) or worse (Disadvantage) result.

### 2.3 Difficulty Scale

| Difficulty | Modifier | When to Use |
|---|---|---|
| Trivial | +60 | Almost impossible to fail; roll only for texture |
| Very Easy | +40 | Simple task for a trained character |
| Easy | +20 | Straightforward but not automatic |
| Routine | +20 | Standard task with some uncertainty |
| Challenging | +0 | **Default.** A fair test of ability |
| Difficult | −10 | Requires focus and skill |
| Hard | −20 | Serious challenge even for experts |
| Very Hard | −30 | Near the limit of human ability |
| Hellish | −60 | Requires extraordinary luck or talent |

> **Agent guidance**: Default to **Challenging (+0)** unless circumstances clearly warrant easier or harder. Err toward fewer modifiers rather than stacking them.

### 2.4 State Change
After resolving the roll, update the game state:
- Record any wounds, condition changes, resource expenditure, or narrative consequences in the session notes.
- Track qualitative state bands (see §3 below), not exact numbers when possible.

### 2.5 Narrative Hook
After the mechanical resolution, narrate the outcome with sensory detail. The roll determines *what happens*; the narration determines *how it feels*.
- On high SL: describe competence, precision, flair.
- On bare success (+0 SL): describe strain, close calls, ugly wins.
- On failure: describe *what goes wrong*, not just "you fail."
- On Criticals: something memorable — a signature move, a lucky break, a moment of brilliance.
- On Fumbles: something memorable but survivable — gear jams, footing slips, an ally flinches.

---

## 3. State Tracking — Qualitative Bands

Track character state using human-readable bands, not precise numbers. The DM should always know *roughly* where a character stands without needing a spreadsheet.

### 3.1 Health
| Band | Mechanical Equivalent | Description |
|---|---|---|
| **Fresh** | 0 wounds | No injuries |
| **Bloodied** | >50% of Max Wounds | Cuts, bruises, fatigue showing |
| **Battered** | At Max Wounds | Move OR Action only; Fortitude (Pain) or Unconscious |
| **Critical** | Has untreated Critical Wounds | Serious injury, specific body part affected |
| **Dying** | Untreated Criticals > Toughness Bonus | Dead at end of round without aid |

### 3.2 Corruption
| Band | Threshold | Effect |
|---|---|---|
| **Pure** | 0 | No taint |
| **Touched** | 1–3 | Nightmares, unease, minor spiritual marks |
| **Tainted** | 4–6 | Outward signs possible, resist with Fortitude/Discipline |
| **Corrupted** | > WilB + TghB | Risk of Mutation or Malignancy on next exposure |

### 3.3 Fate
Track Fate points as a simple counter (starts at 3). Note when Spent (recovers next session) vs Burned (permanent loss). Fate options:
- **Spend**: Reroll, +1 SL, choose Initiative, ignore Critical Wound effects for 1 turn, remove a Condition.
- **Burn**: Survive death ("Die Another Day"), choose roll result ("For the Emperor"), gain Superiority ("Turn the Tide"), refuse a mutation ("Steel Your Soul").

### 3.4 Influence
Track faction standing on the **−5 to +5 scale** in session notes. Record shifts as they happen:
- **−5 to −3**: Hostile. This faction actively works against you.
- **−2 to −1**: Suspicious. Doors close, favours dry up.
- **0**: Neutral. No strong opinion.
- **+1 to +2**: Friendly. Willing to help within reason.
- **+3 to +5**: Devoted. Will take risks on your behalf.

---

## 4. Failure Scaffolding — Failing Forward

**Never let a failed roll stop the story.** A failure changes the *terms* of progress, not whether progress happens.

### Patterns for Failing Forward
| Situation | On Failure… |
|---|---|
| Searching for a clue | You find it, but it's incomplete, misleading, or costs time |
| Picking a lock | The lock opens, but you make noise / break a tool / trigger a secondary alarm |
| Persuading an NPC | They refuse but reveal *why*, giving you a new angle |
| Navigating terrain | You arrive, but late, exhausted, or at the wrong entrance |
| Healing an ally | You stabilise them, but they gain a Condition (Fatigued, Scarred) |

### Agent Rule
When a player fails a roll, the DM should narrate *a complication that changes the situation*, not a dead end. The exception: if failure is dramatically appropriate and the player has Fate to burn, let the consequences land before offering the Fate escape.

---

## 5. Lightweight Exploration

When the party is travelling, exploring, or facing environmental challenges, use these simplified rules at **Play** zoom. Only shift to **Crunch** if the environment becomes actively hostile and tactical positioning matters.

### Exposure
For every 4 hours in an inhospitable environment, call for a **Challenging (+0) Fortitude (Endurance)** Test. Track failures:
- **1st failure**: Disadvantage on some Tests (cold → Agility/Ranged; heat → Intelligence/Willpower)
- **2nd failure**: Disadvantage on all Tests
- **3rd+ failure**: 1d10 Damage, ignoring Armour

### Pursuit
Use the Pursuit system for chases: assign a **Distance** (0–10), each round both sides roll Athletics/Piloting, compare SL to adjust Distance. At 0 = caught, at 10 = escaped.

### Hazards
Environmental hazards deal flat damage when entered or at turn start:
- **Minor** (thorns, small fire): 5 Damage
- **Major** (toxic spores, promethium fire): 10 Damage
- **Deadly** (molten metal, plasma leak): 15 Damage

---

## 6. Lightweight Progression

### XP Awards
- **Per session**: 30–50 XP based on progress, engagement, and creativity.
- **Bonus**: +10 XP for exceptionally clever play, great roleplay, or achieving a major milestone.

### Advancement Costs
Each Advance in a Skill costs increasing XP: 1st = 100, 2nd = 200, 3rd = 300, 4th = 400. Specialisation Advances cost the same. Talents have individual costs listed in their descriptions.

### Corruption Consequences
When Corruption exceeds WilB + TghB, the character must test at the next dramatically appropriate moment:
- **Challenging (+0) Fortitude or Discipline Test**
- **Success**: Hold off for now; test again next time Corruption is gained
- **Failure**: Remove Corruption equal to WilB, then roll for Mutation (even d10) or Malignancy (odd d10)
- **Limits**: More Mutations than TghB or more Malignancies than WilB = lost to Chaos (character becomes an NPC)

---

## Skill Reference (Quick List)

For test resolution, choose from these skills. Each is linked to a Characteristic:

| Skill | Char | Common Uses |
|---|---|---|
| Athletics | STR | Climbing, running, swimming, might contests |
| Awareness | PER | Sight, hearing, smell, psyniscience |
| Dexterity | AG | Lock picking, sleight of hand, defusing |
| Discipline | WIL | Fear, composure, resisting psychic influence |
| Fortitude | TGH | Endurance, pain, poison resistance |
| Intuition | PER | Reading people, sensing ambush, surroundings |
| Linguistics | INT | Cyphers, High Gothic, forbidden languages |
| Logic | INT | Investigation, evaluation, deduction |
| Lore | INT | Academics, theology, forbidden knowledge |
| Medicae | INT | First aid, surgery, xenos biology |
| Melee | WS | Brawling, one-handed, two-handed weapons |
| Navigation | INT | Surface, tracking, void |
| Piloting | AG | Civilian vehicles, military, aeronautica |
| Presence | WIL | Interrogation, intimidation, leadership |
| Psychic Mastery | WIL | Manifesting powers (requires Psyker Talent) |
| Ranged | BS | Pistols, long guns, ordnance, thrown |
| Rapport | FEL | Charm, deception, haggle, inquiry |
| Reflexes | AG | Dodge, acrobatics, balance |
| Stealth | AG | Hide, move silently, conceal |
| Tech | INT | Engineering, security, augmetics |
