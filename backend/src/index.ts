import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';
import type { ServerWebSocket } from 'bun';
import type { SceneKey, SceneMessage } from './types/scenes';

interface Client {
  type: 'control' | 'display';
  id: string;
  ws: ServerWebSocket;
}

// Create HTTP server for API endpoints
const app = new Hono();
const clients = new Map<string, Client>();

// Track current scene
let currentScene: SceneKey = 'space';

// CORS middleware
app.use(
  '/*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (c: Context) => c.json({ status: 'ok' }));

function handleMessage(clientId: string, message: SceneMessage) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'SCENE_CHANGE':
      if (message.scene) {
        currentScene = message.scene;
      }
      broadcastToDisplays(message);
      break;
    case 'SCENE_STATUS':
      // Send current scene state to the requesting client
      const statusMessage: SceneMessage = {
        type: 'SCENE_STATUS',
        scene: currentScene,
        status: 'ready',
      };
      client.ws.send(JSON.stringify(statusMessage));
      break;
    case 'CONTROL_INPUT':
      broadcastToDisplays(message);
      break;
  }
}

function broadcastToDisplays(message: SceneMessage) {
  for (const [_, client] of clients) {
    if (client.type === 'display') {
      client.ws.send(JSON.stringify(message));
    }
  }
}

function broadcastToControls(message: SceneMessage) {
  for (const [_, client] of clients) {
    if (client.type === 'control') {
      client.ws.send(JSON.stringify(message));
    }
  }
}

function broadcastStatus() {
  const status: SceneMessage = {
    type: 'SCENE_STATUS',
    status: 'ready',
    scene: currentScene,
    payload: {
      displays: Array.from(clients.values()).filter((client) => client.type === 'display').length,
      controls: Array.from(clients.values()).filter((client) => client.type === 'control').length,
    },
  };

  broadcastToControls(status);
}

// Create WebSocket server
const wsServer = Bun.serve({
  port: 3002, // Different port for WebSocket server
  fetch(req) {
    // Upgrade all requests to WebSocket
    const success = wsServer.upgrade(req);
    if (!success) {
      return new Response('WebSocket upgrade failed', { status: 400 });
    }
  },
  websocket: {
    message(ws: ServerWebSocket, message: string) {
      try {
        const id = Array.from(clients.entries()).find(([_, client]) => client.ws === ws)?.[0];
        if (!id) return;

        const parsedMessage = JSON.parse(message) as SceneMessage;

        // Handle client type registration
        if (parsedMessage.clientType) {
          const client = clients.get(id);
          if (client) {
            clients.set(id, { ...client, type: parsedMessage.clientType });
            broadcastStatus();
            return;
          }
        }

        handleMessage(id, parsedMessage);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    },
    open(ws: ServerWebSocket) {
      const id = crypto.randomUUID();
      clients.set(id, { id, ws, type: 'display' });
      console.log(`Client connected: ${id}`);
    },
    close(ws: ServerWebSocket) {
      const id = Array.from(clients.entries()).find(([_, client]) => client.ws === ws)?.[0];
      if (id) {
        clients.delete(id);
        broadcastStatus();
        console.log(`Client disconnected: ${id}`);
      }
    },
  },
});

// Create HTTP server
const httpServer = Bun.serve({
  port: 3001,
  fetch: app.fetch,
});

console.log(`HTTP server running at http://localhost:${httpServer.port}`);
console.log(`WebSocket server running at ws://localhost:${wsServer.port}`);

export { httpServer, wsServer };
