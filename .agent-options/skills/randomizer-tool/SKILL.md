---
name: randomizer-tool
description: Quick reference for the randomizer tool — dice rolling, table lookups, and target tests. Used by the DM agent for all mechanical rolls.
---
# Randomizer Tool — Quick Reference

The randomizer is the DM's primary mechanical tool. **Always invoke it via the terminal** to produce genuine random outcomes.

## Invocation

```
node tools/randomizer.js <command> [options]
```

## Commands

### Dice Roll
```
node tools/randomizer.js dice <expr> [-t|--target <num>]
```
- `<expr>`: Dice expression in `NdM[+|-X]` format (e.g., `1d100`, `3d6+2`, `2d10-1`)
- `-t <num>`: Optional target number for calculating Degrees of Success/Failure

**Examples:**
```
node tools/randomizer.js dice 1d100           # Simple d100 roll
node tools/randomizer.js dice 1d100 -t 45     # d100 test against target 45
node tools/randomizer.js dice 3d6+2           # 3d6 + 2 modifier
node tools/randomizer.js dice 1d10            # Initiative or damage roll
```

### Table Roll
```
node tools/randomizer.js table <file> "<header>"
```
- `<file>`: Path to a JSON table file (relative to project root)
- `<header>`: The table header to roll on (must match a key in the JSON)

**Examples:**
```
node tools/randomizer.js table json/campaign_01/underhive_encounters.json "Underhive Encounters"
node tools/randomizer.js table json/campaign_01/warp_phenomena.json "Minor Phenomena"
```

## Flags

| Flag | Effect |
|------|--------|
| `-H` or `--hidden` | Suppresses sending the roll result to the Web REPL. Use for secret DM rolls. |

**Example — Hidden roll:**
```
node tools/randomizer.js -H dice 1d100 -t 30
```

## Agent Rules
- **Always roll mechanically.** Never simulate or invent dice results. Run the command and use the output.
- **Use `-H` for NPC/secret rolls** that the player shouldn't see immediately.
- **Omit `-H` for player-facing rolls** so results appear in the Cogitator Terminal automatically.
