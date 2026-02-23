import fs from 'fs';

async function sendToServer(message) {
    try {
        await fetch('http://localhost:3030/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ speaker: "System", message: message })
        });
    } catch (e) {
        // Silently fail if server isn't running
    }
}

function rollDice(diceStr, target = null) {
    // e.g., 3d6+2 or 1d20-1
    const pattern = /^(\d+)d(\d+)(?:([+\-])(\d+))?$/;
    const match = diceStr.trim().toLowerCase().match(pattern);

    if (!match) {
        console.error(`Error: Invalid dice format '${diceStr}'. Use format NdM[+|-X], e.g., 3d6+2.`);
        process.exit(1);
    }

    const numDice = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifierSign = match[3];
    const modifierVal = match[4] ? parseInt(match[4], 10) : 0;

    if (numDice <= 0 || sides <= 0) {
        console.error("Error: Number of dice and sides must be > 0.");
        process.exit(1);
    }

    const rolls = [];
    for (let i = 0; i < numDice; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const baseTotal = rolls.reduce((a, b) => a + b, 0);

    let total = baseTotal;
    if (modifierSign === '+') {
        total += modifierVal;
    } else if (modifierSign === '-') {
        total -= modifierVal;
    }

    const modifierStr = modifierSign ? ` ${modifierSign} ${modifierVal}` : "";
    const rollsStr = rolls.join(", ");

    let resultText = `Rolling ${diceStr}:\nRolls: [${rollsStr}]`;
    if (modifierStr) {
        resultText += `\nBase Total: ${baseTotal}${modifierStr}`;
    }
    resultText += `\nTotal: ${total}`;

    if (target !== null) {
        if (total <= target) {
            const degrees = Math.floor((target - total) / 10);
            resultText += `\nSuccess! Degrees of Success: ${degrees}`;
        } else {
            const degrees = Math.floor((total - target) / 10);
            resultText += `\nFailure! Degrees of Failure: ${degrees}`;
        }
    }

    console.log(resultText);
    return resultText;
}

function rollTable(filename, header) {
    let data;
    try {
        const fileContent = fs.readFileSync(filename, 'utf8');
        data = JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error loading ${filename}: ${e.message}`);
        process.exit(1);
    }

    if (!(header in data)) {
        console.error(`Error: Header '${header}' not found in ${filename}.`);
        console.error("Available headers:", Object.keys(data).join(", "));
        process.exit(1);
    }

    const table = data[header];
    if (!Array.isArray(table)) {
        console.error(`Error: Expected list for header '${header}', got ${typeof table}.`);
        process.exit(1);
    }

    const weights = [];
    const results = [];

    for (const item of table) {
        if (typeof item === 'object' && item !== null && 'result' in item && 'weight' in item) {
            weights.push(item.weight);
            results.push(item.result);
        } else {
            console.error(`Error: Invalid entry format in table: ${JSON.stringify(item)}. Expected {"result": "...", "weight": X}`);
            process.exit(1);
        }
    }

    if (weights.length === 0) {
        console.error("Error: Table is empty or no valid weights found.");
        process.exit(1);
    }

    // Calculate total weight and pick random
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomVal = Math.random() * totalWeight;

    let chosen = results[results.length - 1]; // fallback
    for (let i = 0; i < weights.length; i++) {
        randomVal -= weights[i];
        if (randomVal <= 0) {
            chosen = results[i];
            break;
        }
    }

    const resultText = `Table: ${header}\nResult: ${chosen}`;
    console.log(resultText);
    return resultText;
}

async function main() {
    const args = process.argv.slice(2);
    let hidden = false;

    const commandArgs = [];
    for (const arg of args) {
        if (arg === '-H' || arg === '--hidden') {
            hidden = true;
        } else {
            commandArgs.push(arg);
        }
    }

    if (commandArgs.length === 0) {
        console.log("Usage: node randomizer.js [-H|--hidden] <command> [options]");
        console.log("Commands:");
        console.log("  dice <expr> [-t|--target <num>]    Roll dice (e.g., 3d6+2)");
        console.log("  table <file> <header>              Roll on a weighted table");
        process.exit(0);
    }

    const command = commandArgs[0];
    let resultText = "";

    if (command === "dice") {
        if (commandArgs.length < 2) {
            console.error("Usage: node randomizer.js dice <expr> [-t|--target <num>]");
            process.exit(1);
        }
        const expr = commandArgs[1];
        let target = null;

        if (commandArgs.length >= 4 && (commandArgs[2] === '-t' || commandArgs[2] === '--target')) {
            target = parseInt(commandArgs[3], 10);
        }

        resultText = rollDice(expr, target);

    } else if (command === "table") {
        if (commandArgs.length < 3) {
            console.error("Usage: node randomizer.js table <file> <header>");
            process.exit(1);
        }
        const file = commandArgs[1];
        const header = commandArgs[2];

        resultText = rollTable(file, header);

    } else {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    if (!hidden && resultText) {
        await sendToServer(resultText);
    }
}

main();
