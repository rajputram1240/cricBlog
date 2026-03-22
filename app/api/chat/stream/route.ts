import { getChatUserSession } from '@/lib/auth';
import { subscribeToChatUpdates } from '@/lib/chat-events';

export const runtime = 'nodejs';

function encodeSseMessage(payload: { timestamp: number }) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: Request) {
  await getChatUserSession();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (payload: { timestamp: number }) => {
        controller.enqueue(encoder.encode(encodeSseMessage(payload)));
      };

      send({ timestamp: Date.now() });

      const unsubscribe = subscribeToChatUpdates(send);
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 15000);

      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };

      request.signal.addEventListener('abort', cleanup, { once: true });
    },
    cancel() {
      // The request abort listener clears the subscription.
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
