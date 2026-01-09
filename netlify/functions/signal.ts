/**
 * BitChat Signaling Server
 * WebSocket server for P2P peer discovery and WebRTC signaling
 * Runs as a Netlify Function with WebSocket support
 */

import { Handler } from '@netlify/functions';

interface Client {
  socket: any;
  peerId: string;
  nickname: string;
  room: string;
}

interface SignalMessage {
  type: string;
  from?: string;
  to?: string;
  room?: string;
  peerId?: string;
  nickname?: string;
  peers?: Array<{ peerId: string; nickname: string }>;
  sdp?: any;
  candidate?: any;
  error?: string;
}

// Store active connections per room
const rooms = new Map<string, Map<string, Client>>();

/**
 * Get all peers in a room except the specified peer
 */
function getPeersInRoom(room: string, excludePeerId?: string): Array<{ peerId: string; nickname: string }> {
  const roomClients = rooms.get(room);
  if (!roomClients) return [];

  const peers: Array<{ peerId: string; nickname: string }> = [];
  roomClients.forEach((client, peerId) => {
    if (peerId !== excludePeerId) {
      peers.push({ peerId: client.peerId, nickname: client.nickname });
    }
  });

  return peers;
}

/**
 * Add client to room
 */
function addClientToRoom(room: string, peerId: string, client: Client) {
  if (!rooms.has(room)) {
    rooms.set(room, new Map());
  }
  rooms.get(room)!.set(peerId, client);
}

/**
 * Remove client from room
 */
function removeClientFromRoom(room: string, peerId: string) {
  const roomClients = rooms.get(room);
  if (roomClients) {
    roomClients.delete(peerId);
    if (roomClients.size === 0) {
      rooms.delete(room);
    }
  }
}

/**
 * Send message to specific peer
 */
function sendToClient(room: string, peerId: string, message: SignalMessage) {
  const roomClients = rooms.get(room);
  if (roomClients) {
    const client = roomClients.get(peerId);
    if (client && client.socket) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending to client ${peerId}:`, error);
      }
    }
  }
}

/**
 * Broadcast message to all clients in room except sender
 */
function broadcastToRoom(room: string, message: SignalMessage, excludePeerId?: string) {
  const roomClients = rooms.get(room);
  if (roomClients) {
    roomClients.forEach((client, peerId) => {
      if (peerId !== excludePeerId) {
        try {
          client.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error broadcasting to ${peerId}:`, error);
        }
      }
    });
  }
}

/**
 * Handle WebSocket connection
 */
export const handler: Handler = async (event, context) => {
  // Handle WebSocket connections
  if (event.headers.upgrade === 'websocket') {
    return {
      statusCode: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    };
  }

  // This is a simplified version - in production with Netlify,
  // you would use Netlify's WebSocket support via context.clientContext
  // For now, this is a placeholder that would work with proper Netlify WebSocket setup

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'BitChat Signaling Server',
      status: 'active',
    }),
  };
};

// WebSocket handler (for local development with ws package)
export function handleWebSocket(ws: any, peerId: string, nickname: string, room: string) {
  const client: Client = {
    socket: ws,
    peerId,
    nickname,
    room,
  };

  // Add to room
  addClientToRoom(room, peerId, client);

  // Send existing peers to new client
  const existingPeers = getPeersInRoom(room, peerId);
  const peersMessage: SignalMessage = {
    type: 'PEERS',
    peers: existingPeers,
  };
  ws.send(JSON.stringify(peersMessage));

  // Notify other peers about new client
  const joinMessage: SignalMessage = {
    type: 'PEER_JOINED',
    peerId,
    nickname,
  };
  broadcastToRoom(room, joinMessage, peerId);

  // Handle incoming messages
  ws.on('message', (data: any) => {
    try {
      const message: SignalMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'OFFER':
        case 'ANSWER':
        case 'ICE_CANDIDATE':
          // Relay signaling messages to specific peer
          if (message.to) {
            sendToClient(room, message.to, {
              ...message,
              from: peerId,
            });
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Invalid message format',
      }));
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    removeClientFromRoom(room, peerId);
    
    // Notify other peers
    const leaveMessage: SignalMessage = {
      type: 'PEER_LEFT',
      peerId,
      nickname,
    };
    broadcastToRoom(room, leaveMessage);
  });

  ws.on('error', (error: any) => {
    console.error(`WebSocket error for ${peerId}:`, error);
    removeClientFromRoom(room, peerId);
  });
}
