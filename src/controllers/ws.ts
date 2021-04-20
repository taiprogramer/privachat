import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import {
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.93.0/ws/mod.ts";

export { ws };

const sockets: Map<string, WebSocket> = new Map();

const ws = async (ctx: Context) => {
  const sock = await ctx.upgrade();

  if (!sock) {
    return;
  }

  const uid = ctx.state.payload.usr;
  sockets.set(uid, sock);

  for await (const ev of sock) {
    if (typeof ev === "string") {
      try {
        const { from, to } = JSON.parse(ev);
        const receiverSock = sockets.get(to);
        if (!receiverSock) {
          continue;
        }
        await receiverSock.send(JSON.stringify({
          from,
        }));
      } catch {}
      continue;
    }

    if (isWebSocketCloseEvent(ev)) {
      sockets.delete(uid);
    }
  }
};
