type ChatSocket = {
  OPEN: number;
  readyState: number;
  send: (message: string) => void;
};

declare global {
  var __chatSockets: Set<ChatSocket> | undefined;
  var broadcastChatUpdate: (() => void) | undefined;
}

export function publishChatUpdate() {
  globalThis.broadcastChatUpdate?.();
}
