type ChatListener = (payload: { timestamp: number }) => void;

const listeners = new Set<ChatListener>();

export function subscribeToChatUpdates(listener: ChatListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishChatUpdate() {
  const payload = { timestamp: Date.now() };
  for (const listener of listeners) {
    listener(payload);
  }
}
