const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('next/dist/compiled/ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const wss = new WebSocketServer({ noServer: true });
const sockets = new Set();

globalThis.__chatSockets = sockets;

globalThis.broadcastChatUpdate = function broadcastChatUpdate() {
  const payload = JSON.stringify({ type: 'chat:update', timestamp: Date.now() });

  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload);
    }
  }
};

wss.on('connection', (socket) => {
  sockets.add(socket);
  socket.send(JSON.stringify({ type: 'chat:update', timestamp: Date.now() }));

  socket.on('close', () => {
    sockets.delete(socket);
  });

  socket.on('error', () => {
    sockets.delete(socket);
  });
});

app.prepare().then(() => {
  const upgradeHandler = app.getUpgradeHandler();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true);
    handle(req, res, parsedUrl);
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '/', true);

    if (pathname === '/api/chat/socket') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
      return;
    }

    upgradeHandler(req, socket, head);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
