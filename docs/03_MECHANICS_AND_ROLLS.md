# 3. Mechanics, Challenge Rolls & Randomizer

## Randomizer
Shortcut scripts are provided in the root directory to quickly access the randomizer tool. For Windows PowerShell, use `roll.bat`.

**Usage:**

To roll dice (e.g., 3d6+2):
```powershell
.\roll.bat dice 3d6+2
```
To roll dice and calculate degrees of success/failure against a target:
```powershell
.\roll.bat dice 1d100 -t 50
```
To roll on a table (from a JSON file):
```powershell
.\roll.bat table json\sample_table.json "Loot Table - Tier 1"
```

- Roll complex dice combinations and auto-calculate degrees of success.
- Roll on weighted JSON tables.
- **Workflow integrations:** Roll results are automatically pushed to the Inquisitorial Cogitator Terminal (the Web REPL), unless the `-H` or `--hidden` flag is used. By default, both `roll.sh` and `roll.bat` will forward this.

## Challenge Rolls

### Simple vs. Graded Rolls
* **Simple Rolls:** These are for binary pass/fail situations where degrees don't matter (e.g., dodging an attack, spotting a hidden trap). Use a standard `1d100`, then compare to the target number to see if you passed or failed.
* **Graded Rolls:** These are for nuanced outcomes where *how well* you do matters (e.g., questioning an informant, performing field surgery, or haggling). Use `-t [target]` to calculate **Degrees of Success** (every 10 points *under* the target adds one degree) or **Degrees of Failure** (every 10 points *over* the target adds one degree). 

### Modifiers
Most challenge rolls have a baseline target equal to the relevant characteristic or skill. Modifiers should be applied aggressively based on the narrative circumstances:
* **Positive Modifiers (Making it Easier):** An unhurried pace, superior tools, high ground, or the assistance of companions.
* **Negative Modifiers (Making it Harder):** The chaos of a battlefield, extreme distractions, pain, injury, or fatigue.

### Difficulty Scale
When determining the target number for a test, the DM may apply a difficulty modifier:
* **Trivial:** +60
* **Elementary:** +50
* **Simple:** +40
* **Easy:** +30
* **Routine:** +20
* **Ordinary:** +10
* **Challenging:** +0
* **Difficult:** -10
* **Hard:** -20
* **Very Hard:** -30
* **Arduous:** -40
* **Punishing:** -50
* **Hellish:** -60

### Example Challenges
To ensure tests yield sensible outcomes, keep these baselines in mind:
* A **Competent Character** (Characteristic 30, Basic Skill +0) has a base target of **30**.
* A **Professional/Expert** (Characteristic 50, Expert Skill +20) has a base target of **70**.
* An **Incompetent/Untrained** character (Characteristic 20, halved for no training) has a base target of **10**.

**Difficulty Benchmarks (using a competent character's 30 base target):**
* **Trivial (+60):** Finding your way through your own hab-block. (Target 90)
  * *Modified Example:* Trying to navigate your hab-block while it's on fire and filled with smoke (-30) drops the target to **60**.
* **Elementary (+50):** Shooting a massive, stationary target at point-blank range. (Target 80)
* **Simple (+40):** Jumping over a narrow gap in a sturdy walkway. (Target 70)
* **Easy (+30):** Intimidating a terrified, unarmed scriber. (Target 60)
* **Routine (+20):** Climbing a secure ladder with two hands. (Target 50)
* **Ordinary (+10):** Recalling a well-known piece of Underhive gang lore. (Target 40)
* **Challenging (+0):** The baseline test. E.g., Patching a bleeding wound alone with a clean rag. (Target 30)
  * *Modified Example:* Attempting this under heavy stubber fire (-20), but assisted by a comrade with a proper Medicae kit (+20) keeps the target at **30**.
* **Difficult (-10):** Firing a weapon into a chaotic melee without hitting an ally. (Target 20)
* **Hard (-20):** Hacking an averagely secured Administratum cogitator. (Target 10)
  * *Modified Example:* The system is actively purging intruders (-20), but you stole the tech-priest's bypass codes (+40) raising the target to **30**.
* **Very Hard (-30):** Leaping between fast-moving mag-trains. (Target 0, impossible for base competence without modifiers)
* **Arduous (-40):** Interrogating a hardened cultist fanatic without torture tools. (Target -10)
  * *Note:* A professional interrogator (base 70) would have a target of **30** here.
* **Punishing (-50):** Performing complex surgery to remove a warp-parasite near the heart. (Target -20)
* **Hellish (-60):** Resisting the direct psychic domination of a powerful warp entity. (Target -30)
