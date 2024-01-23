import WebSocket from "npm:ws";
const kickApp =
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

const ws = new WebSocket(kickApp);

ws.on("open", () => {
  console.log("Connected to", kickApp);
});

ws.on("message", (data: WebSocket.Data) => {
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

  // // Happy path
  if (message.includes("ChatMessageEvent")) {
    const wsJson = JSON.parse(message);
    const msgData = JSON.parse(wsJson.data);

    const { content, sender, chatroom_id } = msgData;
    const { username } = sender;

    console.log(`${new Date().toLocaleTimeString()} => ${username} @ ${chatroom_id}: ${content}`);
  }

  // Other kinds of messages to parse
});

ws.on("close", () => {
  console.log("Connection closed");
});
