import fs from 'fs';

async function sendMessage(message) {
    try {
        const response = await fetch('http://localhost:3030/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ speaker: "DM", message: message })
        });

        if (response.ok) {
            console.log("DM message successfully transmitted to Cogitator Terminal.");
            return true;
        } else {
            console.log(`Failed with status: ${response.status}`);
        }
    } catch (e) {
        console.log(`Failed to connect to Terminal: ${e.message}`);
        console.log("Ensure 'node play.js <campaign>' is running.");
    }
    return false;
}

async function waitForPlayer() {
    console.log("Waiting for player response...");
    try {
        // Controller to abort fetch if needed, though we rely on the server timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3605000); // slightly > 1 hour

        const response = await fetch('http://localhost:3030/wait', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.status === "responded") {
                let messages = data.messages || [];
                if (messages.length === 0 && data.message) {
                    messages = [data.message];
                }
                const combined = messages.join('\n');
                console.log(`\nPlayer(s) responded:\n${combined}`);
                return combined;
            } else if (data.status === "ignored_due_to_mode") {
                console.log("\nWait ignored: DM_MODE in .env is not set to 'polling'.");
                return null;
            } else {
                console.log("\nTimeout waiting for player.");
            }
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            console.log("\nTimeout waiting for player.");
        } else {
            console.log(`\nError waiting for player: ${e.message}`);
        }
    }
    return null;
}

async function run() {
    const args = process.argv.slice(2);

    // Parse arguments
    let campaign = null;
    let messages = [];
    let wait = false;
    let usePad = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-w' || args[i] === '--wait') {
            wait = true;
        } else if (args[i] === '-p' || args[i] === '--pad') {
            usePad = true;
        } else if (!campaign) {
            campaign = args[i];
        } else {
            messages.push(args[i]);
        }
    }

    if (!campaign && !wait && messages.length === 0 && !usePad) {
        console.log("Usage: node dm.js <campaign> [message...] [-w|--wait] [-p|--pad]");
        process.exit(0);
    }

    if (usePad) {
        const padPath = 'notes/dm_message.txt';
        if (fs.existsSync(padPath)) {
            const padContent = fs.readFileSync(padPath, 'utf8').trim();
            if (padContent) {
                messages.push(padContent);
            } else {
                console.log("Pad file is empty. Nothing to send.");
            }
        } else {
            console.log(`Pad file not found at ${padPath}`);
        }
    }

    if (messages.length > 0) {
        const msg = messages.join(" ");
        const success = await sendMessage(msg);
        if (success) {
            if (usePad) {
                fs.writeFileSync('notes/dm_message.txt', '', 'utf8');
                console.log("Cleared notes/dm_message.txt");
            }
            if (wait) {
                await waitForPlayer();
            }
        }
    } else {
        if (wait) {
            await waitForPlayer();
        } else {
            console.log("Usage: node dm.js <campaign> [message...] [-w|--wait] [-p|--pad]");
        }
    }
}

run();
