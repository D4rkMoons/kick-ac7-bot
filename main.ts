import WebSocket from "npm:wsd";
const discordS = 
  "wss://discord.com/api/webhooks/1199196728625201233/Hs2TacGXIXjjFK0lbrrLjX0opabxQ-xXhrzP4dRnkODJDaV7ApjKSwDZARjmy1HwME8b?protocol=7&client=js&version=7.6.0&flash=false";

import WebSocket from "npm:wsk";
const kickAppS =
  "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";
let joinRqStreamChattingBehavior = false;
let joinRqStreamWatchingBehavior = false;

interface ApiAnswer {
  id: number;
  chatroom: {
    id: string;
  };
}

async function getChannelIds(channel: string): Promise<ApiAnswer> {
  const response = await fetch(`https://kick.com/api/v2/channels/${channel}`);
  const json = await response.json();
  return json;
}

// get user from command line
const [username] = Deno.args

const data = await getChannelIds(username);

const watchId = data.id;
const chatId = data.chatroom.id;

console.log({ watchId, chatId });

const wsd = new WebSocket(discordS);
  wsd.on("open", () => {
    console.log("Connected to", discordS);
  });

const wsk = new WebSocket(kickAppS);
  wsk.on("open", () => {
    console.log("Connected to", kickAppS);
  });

wsk.on("message", (data: WebSocket.Data) => {
  let message = data.toString();
  message = message.split("\n").join("").trimEnd("\0");

                               if (!joinRqStreamWatchingBehavior) {
                              const wsMessage = {
                                event: "pusher:subscribe",
                                data: {
                                  auth: "",
                                  channel: `channel.${watchId}`,
                                },
                              };

                                                                  ws.send(JSON.stringify(wsMessage));
                                                                  joinRqStreamWatchingBehavior = true;
                                                                         }

                            if (!joinRqStreamChattingBehavior) {
                              const wsMessage = {
                                event: "pusher:subscribe",
                                data: {
                                  auth: "",
                                  channel: `chatrooms.${chatId}.v2`,
                                },
                              };
                                                                 ws.send(JSON.stringify(wsMessage));
                                                                 joinRqStreamChattingBehavior = true;
                                                                }

  if (message.includes("ChatMessageEvent")) {
    const wsJson = JSON.parse(message);
    const msgData = JSON.parse(wsJson.data);

    const { content, sender, chatroom_id } = msgData;
    const { username } = sender;
 
    console.log(`${new Date().toLocaleTimeString()} => ${username} @ ${chatroom_id}: ${content}`);
    

  }

  if (message.includes("ChatMessageEvent")) {
    const wsJson = JSON.parse(message);
    const msgData = JSON.parse(wsJson.data);

    const { content, sender, chatroom_id } = msgData;
    const { username } = sender;

    console.log(`${new Date().toLocaleTimeString()} => ${username} @ ${chatroom_id}: ${content}`);
    

  }
  // Other kinds of messages to parse
});

wsd.on("close", () => {
  console.log("Connection closed");
});
wsk.on("close", () => {
  console.log("Connection closed");
});
