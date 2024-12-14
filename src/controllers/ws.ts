import { Context } from "@oak/oak";

export { ws };

const sockets: Map<string, WebSocket> = new Map();

const ws = (ctx: Context) => {
  const sock = ctx.upgrade();

  if (!sock) {
    return;
  }

  const uid = ctx.state.payload.usr;
  sockets.set(uid, sock);

  sock.onmessage = (ev: MessageEvent<string>) => {
    try {
      const { from, to } = JSON.parse(ev.data);
      const receiverSock = sockets.get(to);
      if (receiverSock) {
        receiverSock.send(
          JSON.stringify({
            from,
          }),
        );
      }
    } catch {}
  };

  sock.onclose = () => {
    sockets.delete(uid);
  };
};
