---
name: dh-ruleset-psyker
description: Psychic power mechanics — manifest flow, Warp Charge tracking, Perils of the Warp, Purgation, and Deny the Witch. Load only when a PC or major NPC is a psyker.
---
# Ruleset: Psychic Powers

This skill provides mechanical scaffolding for resolving psychic powers in play. It abstracts the Imperium Maledictum psyker system into clear DM-facing guidelines while preserving the core tension: *power comes at a price*.

> **Design principle**: Psychic powers should feel *dangerous and dramatic*, not routine. Every manifest should carry a frisson of risk — the player should always be weighing power against peril.

---

## 1. Manifest Flow

When a psyker PC or NPC uses a psychic power, follow these steps:

### Step 1: Choose Power
The psyker declares which power they are using and names their target. They must be aware of the target and know its location (usually line of sight).

### Step 2: Psychic Mastery Test
Roll a **Psychic Mastery Test** at the Difficulty listed for the power.
- Apply any relevant Specialisation (Biomancy, Divination, Pyromancy, Telekinesis, Telepathy).
- Manifesting a power is an **Action** unless the power states otherwise.

### Step 3: Gain Warp Charge
- **On success**: Gain Warp Charge equal to the power's **Warp Rating**.
- **On failure**: Gain 1 Warp Charge per negative SL, up to the power's Warp Rating.
- **On Critical**: Reduce Warp Charge gained by **Willpower Bonus** (minimum 1).
- **On Fumble**: **Double** the Warp Charge gained.

### Step 4: Apply Effects
- **Success**: The power works as described. Narrate the effect with appropriate psychic flavour — glowing eyes, temperature drops, whispered voices.
- **Failure**: The power fizzles. Warp Charge is still gained. Narrate the strain — nosebleed, tremor, a flash of unwanted vision.

### Agent Rule
Always narrate the *physical cost* of manifesting, even on success. Psykers should never cast without consequence being visible. Bystanders should react with fear, suspicion, or awe.

---

## 2. Warp Charge Tracking

Track Warp Charge using qualitative bands. The threshold is the psyker's **Willpower Bonus** (typically 3–5 for PCs).

| Band | Warp Charge vs Threshold | What the DM Describes |
|---|---|---|
| **Safe** | At or below threshold | Subtle signs — breath fogs, shadows flicker, a candle gutters. Controllable. |
| **Crackling** | At threshold exactly | The psyker visibly crackles with power. Lights dim. Companions feel uneasy. All further powers are **Overt** (obviously psychic to witnesses). |
| **Dangerous** | 1–3 above threshold | Reality strains. Must test to contain (see §2.1). Phenomena may occur. The psyker's eyes glow, objects rattle, the air tastes of ozone. |
| **Catastrophic** | 4+ above threshold | The Warp is tearing through. Perils of the Warp imminent. Walls bleed, gravity shifts, whispers from nowhere. |

### 2.1 Containment Test
At the **end of the psyker's turn**, if Warp Charge exceeds threshold:
- Make a **Challenging (+0) Psychic Mastery Test**.
- **Success**: The power is held in check — but it's visibly straining the psyker. They count as Overt.
- **Failure**: **Perils of the Warp** trigger (see §4). Warp Charge resets to 0. All Sustained powers end.

---

## 3. Purgation — Venting Warp Energy

A psyker can spend an **Action** to purge accumulated Warp Charge through a controlled release.

### Purgation Flow
1. Make a **Challenging (+0) Discipline (Psychic) Test**. Outside combat, this is **Routine (+20)**.
2. **Success**: Remove Warp Charge up to **Willpower Bonus + SL**. Cannot reduce below 0 or below the total Warp Rating of any Sustained powers.
3. **Failure**: No Warp Charge removed.
4. **Regardless of result**: If successful, roll for **Psychic Phenomena** (see §3.1).

### 3.1 Psychic Phenomena
When Purgation succeeds, the vented energy causes ambient disturbances. Use these as **narrative flavour** — they make the world feel alive and keep the psyker's allies on edge.

Pick or roll from this simplified list:

| d10 | Phenomenon | Narrative Effect |
|---|---|---|
| 1–3 | **Hoarfrost** | Frost creeps across surfaces. Breath fogs. Unnatural chill. |
| 4 | **Banshee Howl** | Screeching fills the air, drowning conversation. |
| 5 | **Bloody Tears** | Nearby icons and statues weep blood. |
| 6 | **Dark Foreboding** | A whispering breeze, nameless dread settles on everyone. |
| 7 | **Veil of Darkness** | Light sources dim substantially. Shadows deepen. |
| 8 | **Memory Worm** | Everyone briefly forgets minor things — names, the time. |
| 9 | **Warp Echoes** | Echoing voices from past and future. Disorienting. |
| 10 | **Grave Chill** | Surfaces become cold to the touch. The temperature plummets. |

### Agent Rule
Don't skip Psychic Phenomena — they're one of the best tools for establishing the *wrongness* of psychic power. Even allied psykers should make their companions uneasy. Accumulate lingering effects in locations where Purgation happens repeatedly.

---

## 4. Perils of the Warp

When a psyker fails their Containment Test (§2.1), or when a Pushed Fumble occurs, the Warp floods through them. This is always dramatic, always dangerous, and always narrated in full.

### Simplified Perils Tiers
Roll a **d10** and add +1 for each Warp Charge over the threshold at the time of the Peril.

| Result | Tier | Corruption | What Happens |
|---|---|---|---|
| 1–4 | **Rattled** | 1 | Frightened (Minor). The psyker glimpses something in the Warp. Shaken but functional. |
| 5–7 | **Backlash** | 1–2 | The psyker suffers 1d10 Wounds and is Stunned. Powered equipment may discharge. Companions within Short Range take minor effects (knocked back, Stunned). |
| 8–9 | **Daemonic Intrusion** | 2–3 | Something reaches through. A Lesser Daemon materialises within Short Range, or the psyker is engulfed in Warplight dealing 1d10+6 Damage to all nearby. The psyker's appearance permanently changes in some minor way. |
| 10–11 | **Cataclysmic** | 3–5 | Massive energy release. 3d10 Damage to the psyker and everyone in Short Range. The psyker's gear is destroyed. Possible temporary time slip or mass hallucination. |
| 12+ | **Daemonhost / Eye of Terror** | 5–10 | The psyker must pass a **Very Hard (−30) Discipline Test** or be possessed. On failure, they become an NPC threat. On success, they survive but are incapacitated and gain massive Corruption. Something truly terrible may emerge. |

### Agent Rule
Perils should be **rare but unforgettable**. When they happen, pause the current action and give the Peril its own narrative moment. Describe the reality distortion, the horror of the companions, the cost to the psyker's body and soul. This is the price of power in the 41st Millennium.

After Perils resolve: Warp Charge resets to 0. All Sustained powers end. The psyker gains Corruption as listed.

---

## 5. Pushing — Reaching Deeper

A psyker may choose to **Push** before making their Manifest Test. This represents deliberately drawing more deeply from the Warp.

| Benefit | Cost |
|---|---|
| Manifest Test is made with **Advantage** | Gain an additional **1d10 Warp Charge** on top of normal Warp Charge |
| — | If the Manifest Test is a **Fumble**, immediately trigger **Perils of the Warp** |

### When to Push
- The power *must* succeed — a life depends on it, the mission hinges on this moment.
- The psyker is already near their threshold and decides to go all-in.
- Dramatically appropriate: the psyker is desperate, enraged, or making a sacrifice.

### Agent Rule
When an NPC psyker Pushes, narrate the visible strain and fear from nearby characters. When a PC psyker Pushes, make the risk crystal clear before the roll: *"You can feel the Warp surging behind your eyes. If you reach deeper, the power will come — but so might something else. Are you sure?"*

---

## 6. Deny the Witch

When a psyker manifests a power, any other psyker within **Short Range** can attempt to disrupt it.

### Flow
1. The opposing psyker makes a **Challenging (+0) Psychic Mastery Test**.
2. Each **+SL** reduces the manifesting psyker's result by **−1 SL**.
3. This may cause the power to fail even if the manifest roll itself succeeded.
4. **First denial per round** is free. Each additional attempt in the same round incurs a cumulative **−1 SL penalty**.

### Agent Rule
NPC psykers should use Deny the Witch when dramatically appropriate — to protect a ritual, shield an ally, or demonstrate their power. Don't use it routinely; it's most impactful when it disrupts a player's plan at a critical moment.

---

## 7. Sustained Powers

Some powers have a duration of **Sustained**, meaning the psyker can extend them each round.

### Rules
- Extending a Sustained power is a **Free Action**. No test required.
- The psyker must be **conscious** to sustain.
- **Minimum Warp Charge**: The psyker's Warp Charge cannot drop below the total Warp Rating of all currently Sustained powers, even through Purgation.
- If **Perils** trigger, all Sustained powers end immediately.

### Agent Rule
Track Sustained powers in the session notes. When a psyker is sustaining multiple effects, narrate the mounting strain — trembling hands, bleeding nose, flickering aura. The more they hold, the more fragile their control becomes.

---

## 8. Overt vs Subtle Powers

Most psychic powers are **subtle** — a temperature drop, a flicker of light, deepening shadows. Difficult to prove as witchcraft without supernatural senses.

Powers marked as **Overt** (denoted with *) are unmistakable. Lightning arcs, fire erupts, objects hurl through the air. Anyone who witnesses an Overt power knows *exactly* who caused it.

### Consequences of Overt Powers
- In Imperial society, displaying overt psychic power will attract **fear and suspicion** at minimum.
- Non-psyker companions may become uneasy (Discipline Test to avoid Frightened if particularly dramatic).
- Authorities, Ecclesiarchy, or Inquisitorial agents may investigate.
- In combat, Overt powers reveal the psyker's position.

### Agent Rule
Track whether the psyker has used Overt powers in the current session. If they have, note the witnesses and the likely social consequences. Don't always punish immediately — let the dread build. The rumours spread. The Witch Hunters take note. The bill comes due later.
