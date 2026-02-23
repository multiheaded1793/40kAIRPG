import fs from 'fs';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import cors from 'cors';
import { injectToIDE } from './ide-injector.js';

dotenv.config();

const PORT = 3030;
const MULTIPLAYER_MODE = process.env.MULTIPLAYER_MODE === 'true';
const CHATROOM_URL = process.env.CHATROOM_URL || 'ws://localhost:8787/ws';
const MULTIPLAYER_PASSWORD = process.env.MULTIPLAYER_PASSWORD || '';
const DM_MODE = process.env.DM_MODE || 'polling'; // polling | manual | auto
const CDP_PORT = process.env.CDP_PORT || 9222;

let AGENT_RULES = [];
let AGENT_SKILLS = [];
try {
    if (process.env.AGENT_RULES) AGENT_RULES = JSON.parse(process.env.AGENT_RULES);
    if (process.env.AGENT_SKILLS) AGENT_SKILLS = JSON.parse(process.env.AGENT_SKILLS);
} catch (e) {
    console.warn("Could not parse AGENT_RULES or AGENT_SKILLS from .env");
}

function syncAgentConfig() {
    console.log("Syncing Agent Configuration from .env...");
    const destDir = path.join(process.cwd(), '.agents');
    const sourceDir = path.join(process.cwd(), '.agent-options');

    // Make sure .agents exists
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    function syncFolder(folderName, fileList) {
        const targetDir = path.join(destDir, folderName);
        const optionsDir = path.join(sourceDir, folderName);

        // Clear existing target directory
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        if (!fileList || fileList.length === 0) return;

        fs.mkdirSync(targetDir, { recursive: true });

        fileList.forEach(file => {
            const sourcePath = path.join(optionsDir, file);
            const targetPath = path.join(targetDir, file);

            if (fs.existsSync(sourcePath)) {
                const stat = fs.statSync(sourcePath);
                if (stat.isDirectory()) {
                    fs.cpSync(sourcePath, targetPath, { recursive: true });
                    console.log(`  -> Synced ${folderName}: ${file} (Directory)`);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                    console.log(`  -> Synced ${folderName}: ${file} (File)`);
                }
            } else {
                console.warn(`  -> WARNING: Could not find ${sourcePath}`);
            }
        });
    }

    syncFolder('rules', AGENT_RULES);
    syncFolder('skills', AGENT_SKILLS);
}


const app = express();
app.use(express.json());
app.use(cors());

let activeCampaign = null;
let chatHistory = [];
// For polling wait
let waitingResolvers = [];
// Tracking players who responded this turn
let turnMessages = [];

let cfWs = null;

// Ensure log dir
function getLogFile() {
    if (!activeCampaign) throw new Error("Active campaign not set");
    const logDir = path.join('logs', activeCampaign);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    // Get YYYY-MM-DD
    const date = new Date();
    const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return path.join(logDir, `${ds}_game_log.txt`);
}

function saveGameState(newStateFields) {
    const stateFile = path.join('notes', 'current_game.json');
    let state = {};
    if (fs.existsSync(stateFile)) {
        try {
            state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        } catch (e) {
            console.error("Error reading current_game.json");
        }
    }
    state = { ...state, ...newStateFields };

    // Ensure notes dir exists
    if (!fs.existsSync('notes')) fs.mkdirSync('notes');

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 4), 'utf8');
}

function loadHistory() {
    if (!activeCampaign) return;
    const logFile = getLogFile();

    if (!fs.existsSync(logFile)) {
        if (cfWs && cfWs.readyState === WebSocket.OPEN) {
            cfWs.send(JSON.stringify({ type: "clear" }));
        }
        return;
    }

    try {
        const textArea = fs.readFileSync(logFile, 'utf8');
        const lines = textArea.split('\n');

        chatHistory = [];

        // Typical format: [HH:MM:SS] Speaker: Message
        const regex = /^\[(\d{2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/;

        for (const line of lines) {
            const match = line.match(regex);
            if (match) {
                const [, timestamp, speaker, message] = match;
                chatHistory.push({ timestamp, speaker, message });
            } else if (chatHistory.length > 0) {
                chatHistory[chatHistory.length - 1].message += '\n' + line;
            }
        }

        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].message = chatHistory[chatHistory.length - 1].message.replace(/\n+$/, '');
        }

        if (cfWs && cfWs.readyState === WebSocket.OPEN) {
            cfWs.send(JSON.stringify({ type: "history", data: chatHistory }));
        }

    } catch (e) {
        console.error("Failed to load chat history:", e);
    }
}

function appendToLog(speaker, message) {
    if (!activeCampaign) return; // Prevent crashes before INIT
    const logFile = getLogFile();
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (message.trim().startsWith('[') && message.trim().endsWith(']')) {
        speaker = `${speaker} (OOC)`;
    }

    const line = `[${ts}] ${speaker}: ${message}`;
    fs.appendFileSync(logFile, line + "\n", 'utf8');

    // Update the game state with the latest log file touched
    saveGameState({ latest_log: logFile.replace(/\\/g, '/') });

    chatHistory.push({ timestamp: ts, speaker, message });

    if (speaker.startsWith("Player")) {
        turnMessages.push(`[${speaker}]: ${message}`);

        // Write to message pad for auto-DM prompt injection context
        fs.appendFileSync(path.join('logs', 'player_message_pad.txt'), `[${speaker}]: ${message}\n`, 'utf8');

        // Single-player mode (no WebSockets) legacy fallback
        if (!MULTIPLAYER_MODE && DM_MODE !== 'auto') {
            triggerTurnEnd();
        }
    }
}

function triggerTurnEnd() {
    // 1. Resolve pending HTTP /wait requests (Polling mode)
    while (waitingResolvers.length > 0) {
        const resolve = waitingResolvers.shift();
        resolve({ status: "responded", messages: [...turnMessages] });
    }

    // 2. Auto-injection mode
    if (DM_MODE === 'auto') {
        if (turnMessages.length > 0) {
            injectToIDE("continue @auto-dm-turn.md", CDP_PORT).catch(err => {
                console.error("Auto-inject failed:", err.message);
                if (cfWs && cfWs.readyState === WebSocket.OPEN) {
                    cfWs.send(JSON.stringify({
                        type: "chat",
                        speaker: "System",
                        message: "The Cogitator has encountered a critical failure: " + err.message
                    }));
                }
            });
        }
    }

    // Reset turn
    turnMessages = [];
}

function initWebSocket(wsEndpoint) {
    console.log(`Connecting to hub at ${wsEndpoint}...`);
    const wsUrl = `${wsEndpoint}?name=HostRelay&role=relay&password=${encodeURIComponent(MULTIPLAYER_PASSWORD)}`;
    cfWs = new WebSocket(wsUrl);

    cfWs.on('open', () => {
        console.log("WebSocket connected to hub.");
    });

    cfWs.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            // Sync player chat messages locally
            if (msg.type === "chat" && !msg.data.speaker.startsWith("DM") && msg.data.speaker !== "System") {
                if (msg.data.message === '/l') {
                    loadHistory();
                } else if (msg.data.message === '/c') {
                    if (cfWs && cfWs.readyState === WebSocket.OPEN) {
                        cfWs.send(JSON.stringify({ type: "clear" }));
                    }
                } else {
                    appendToLog(msg.data.speaker, msg.data.message);
                }
            }
            // Trigger turn complete when all players ready
            else if (msg.type === "all_ready") {
                console.log("All players ready. Triggering DM turn.");
                triggerTurnEnd();
            }
        } catch (e) { console.error("WS Parse error", e); }
    });

    cfWs.on('close', () => {
        console.log("WebSocket closed. Reconnecting in 5s...");
        setTimeout(() => initWebSocket(wsEndpoint), 5000);
    });

    cfWs.on('error', (err) => {
        // Suppress noisy error logs on failure
    });
}

// Routes
app.post('/send', (req, res) => {
    const { speaker = 'Unknown', message = '' } = req.body;

    if (message === '/l') {
        loadHistory();
        return res.json({ success: true });
    } else if (message === '/c') {
        if (cfWs && cfWs.readyState === WebSocket.OPEN) {
            cfWs.send(JSON.stringify({ type: "clear" }));
        }
        return res.json({ success: true });
    }

    appendToLog(speaker, message);

    if (speaker.startsWith("DM") || speaker === "System") {
        // Clear message pad when DM finishes turn
        fs.writeFileSync(path.join('logs', 'player_message_pad.txt'), '', 'utf8');
    }

    // Forward DM message to Chatroom
    if (cfWs && cfWs.readyState === WebSocket.OPEN) {
        cfWs.send(JSON.stringify({ type: "chat", speaker, message }));
    }

    res.json({ success: true });
});

app.get('/wait', (req, res) => {
    // If we're not using polling mode, immediately return so DM script doesn't hang forever
    // e.g. Manual mode just fire-and-forget
    if (DM_MODE !== 'polling') {
        return res.json({ status: "ignored_due_to_mode" });
    }

    // Hold request open until `triggerTurnEnd` resolves it
    const reqTimeout = setTimeout(() => {
        const idx = waitingResolvers.findIndex(r => r.res === res);
        if (idx !== -1) waitingResolvers.splice(idx, 1);
        res.json({ status: "timeout" });
    }, 3600 * 1000); // 1 hour timeout

    const resolver = (result) => {
        clearTimeout(reqTimeout);
        res.json(result);
    };
    resolver.res = res;
    waitingResolvers.push(resolver);
});

// --- Legacy Dataslate & Mermaid Asset Endpoints ---
app.get('/mermaid.min.js', (req, res) => {
    const filePath = path.join(process.cwd(), 'mermaid.min.js');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Not found');
    }
});

app.get('/dataslate/list', (req, res) => {
    if (!activeCampaign) return res.status(500).json({ error: "No active campaign" });

    const campaignDir = path.join(process.cwd(), 'notes', activeCampaign, 'mermaid');
    const files = [];

    if (fs.existsSync(campaignDir)) {
        const dirFiles = fs.readdirSync(campaignDir);
        for (const f of dirFiles) {
            if (f === 'pad.md' || f.endsWith('_dataslate.md')) {
                files.push(f);
            }
        }
    }
    res.json(files);
});

app.get('/dataslate/item', (req, res) => {
    if (!activeCampaign) return res.status(500).send("No active campaign");

    const filename = req.query.file;
    if (!filename || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).send("Invalid filename");
    }

    const filePath = path.join(process.cwd(), 'notes', activeCampaign, 'mermaid', filename);
    if ((filename === 'pad.md' || filename.endsWith('_dataslate.md')) && fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(content);
    } else {
        res.status(404).send("Not found");
    }
});

app.get('/history', (req, res) => {
    res.json(chatHistory);
});


const args = process.argv.slice(2);
activeCampaign = args[0] || process.env.ACTIVE_CAMPAIGN;

if (!activeCampaign) {
    console.error("Usage: node play.js <campaign_folder>");
    process.exit(1);
}

// Start Server
syncAgentConfig();

app.listen(PORT, () => {
    console.log("=========================================================");
    console.log(` Inquisitorial Cogitator Relay active on port ${PORT}`);
    console.log(` Campaign Context: ${activeCampaign}`);
    console.log(` Multiplayer Mode: ${MULTIPLAYER_MODE ? 'ON' : 'OFF'}`);
    console.log(` DM Mode:          ${DM_MODE}`);

    const actualWsUrl = MULTIPLAYER_MODE ? CHATROOM_URL : 'ws://127.0.0.1:8787/ws';
    const httpUrl = actualWsUrl.replace('wss://', 'https://').replace('ws://', 'http://').replace('/ws', '');

    if (MULTIPLAYER_MODE) {
        console.log(` Client URL:       ${httpUrl}/?password=${encodeURIComponent(MULTIPLAYER_PASSWORD)}`);
    } else {
        console.log(` Singleplayer chatroom running on ${httpUrl}/`);
    }

    console.log("=========================================================");

    // Save initial state for the session
    saveGameState({ campaign: activeCampaign });

    initWebSocket(actualWsUrl);

    // Give websocket a tick to establish connection
    setTimeout(() => { loadHistory(); }, 500);
});
