export class ChatRoom {
    constructor(state, env) {
        this.state = state;
        this.sessions = [];
        this.players = {}; // name -> { ready: boolean, role: "player" | "host" }
        this.chatHistory = []; // Array of message objects
        this.roomPassword = null; // Stored from the relay connection
    }

    async fetch(request) {
        if (request.headers.get("Upgrade") !== "websocket") {
            return new Response("Expected Upgrade: websocket", { status: 426 });
        }

        const url = new URL(request.url);
        const name = url.searchParams.get("name") || "Observer";
        const password = url.searchParams.get("password") || "";
        const role = url.searchParams.get("role") || "player";

        // Assign room password if relay connects, otherwise reject mismatched player passwords
        if (role === "relay") {
            this.roomPassword = password;
        } else if (this.roomPassword !== null && password !== this.roomPassword) {
            return new Response("Unauthorized: Invalid Password", { status: 401 });
        }

        let pair = new WebSocketPair();
        let client = pair[0];
        let server = pair[1];

        this.handleSession(server, name, role);

        return new Response(null, { status: 101, webSocket: client });
    }

    handleSession(webSocket, name, role) {
        webSocket.accept();

        let session = { webSocket, name, role };
        this.sessions.push(session);

        if (role !== "relay") {
            this.players[name] = { ready: false, role: role };
        }

        // Send current history and player list
        webSocket.send(JSON.stringify({ type: "history", data: this.chatHistory }));
        this.broadcastPlayerList();

        webSocket.addEventListener("message", async (event) => {
            try {
                let data = JSON.parse(event.data);

                if (data.type === "chat") {
                    let msgObj = {
                        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                        speaker: data.speaker || name,
                        message: data.message
                    };
                    this.chatHistory.push(msgObj);
                    if (this.chatHistory.length > 200) this.chatHistory.shift(); // keep last 200
                    this.broadcast({ type: "chat", data: msgObj });
                }
                else if (data.type === "history" && role === "relay") {
                    this.chatHistory = Array.isArray(data.data) ? data.data : [];
                    this.broadcast({ type: "history", data: this.chatHistory });
                }
                else if (data.type === "clear" && role === "relay") {
                    this.chatHistory = [];
                    this.broadcast({ type: "clear" });
                }
                else if (data.type === "ready") {
                    if (this.players[name]) {
                        this.players[name].ready = data.ready;
                        this.broadcastPlayerList();

                        // Check if all players are ready
                        this.checkAllReady();
                    }
                }
            } catch (err) {
                console.error("Error parsing message", err);
            }
        });

        webSocket.addEventListener("close", () => {
            this.sessions = this.sessions.filter(s => s !== session);
            if (role !== "relay") {
                delete this.players[name];
                this.broadcastPlayerList();
                this.checkAllReady(); // Migh trigger "all ready" if a not-ready player left
            }
        });

        webSocket.addEventListener("error", () => {
            this.sessions = this.sessions.filter(s => s !== session);
            if (role !== "relay") {
                delete this.players[name];
                this.broadcastPlayerList();
                this.checkAllReady();
            }
        });
    }

    broadcast(messageObj) {
        let msg = JSON.stringify(messageObj);
        for (let session of this.sessions) {
            try {
                session.webSocket.send(msg);
            } catch (err) {
                // Ignore, will be cleaned up on 'close' or 'error'
            }
        }
    }

    broadcastPlayerList() {
        this.broadcast({ type: "players", data: this.players });
    }

    checkAllReady() {
        let playerNames = Object.keys(this.players).filter(n => this.players[n].role !== "host");
        if (playerNames.length === 0) return; // No regular players to wait for

        let allReady = true;
        for (let p of playerNames) {
            if (!this.players[p].ready) {
                allReady = false;
                break;
            }
        }

        if (allReady) {
            this.broadcast({ type: "all_ready" });
            // Optionally auto-unready everyone after a short delay or let them do it?
            // Usually the DM agent's turn will happen and players unready themselves to type.
            for (let p in this.players) {
                this.players[p].ready = false;
            }
            // Send the updated unready states back after broadcasting the "all_ready" trigger
            this.broadcastPlayerList();
        }
    }
}
