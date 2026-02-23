---
trigger: manual
---

- Consider the messages sent by the players since last turn, collated in @/logs/player_message_pad.txt
- Write your DM response entirely into `@/notes/dm_message.txt`.
- Once written, send it using the local `dm.js` CLI tool with the `-p` flag: `node dm.js <campaign_name> -p`
- This rule is used to automate the conversation when the DM mode is set to `auto`