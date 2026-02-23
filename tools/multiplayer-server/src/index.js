export { ChatRoom } from "./chatroom.js";
import html from "./index.html";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/") {
            return new Response(html, {
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        if (url.pathname.startsWith("/ws")) {
            // Forward to Durable Object "CHAT_ROOM"
            const id = env.CHAT_ROOM.idFromName("default_room");
            const room = env.CHAT_ROOM.get(id);
            return room.fetch(request);
        }

        return new Response("Not found", { status: 404 });
    }
};
