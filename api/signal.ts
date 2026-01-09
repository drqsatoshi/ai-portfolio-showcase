/**
 * BitChat Signaling Server (Vercel Serverless Function)
 * WebSocket server for P2P peer discovery and WebRTC signaling
 * 
 * Note: Vercel does not natively support WebSocket connections in serverless functions.
 * This implementation uses a REST API approach as a fallback for Vercel deployments.
 * 
 * For production WebSocket support on Vercel, consider:
 * 1. Using a separate WebSocket service (e.g., Pusher, Ably, Socket.io on dedicated server)
 * 2. Using Vercel Edge Functions with WebSocket support (beta)
 * 3. Deploying signaling server separately (e.g., Railway, Render, Fly.io)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

interface PeerInfo {
  peerId: string;
  nickname: string;
  room: string;
  lastSeen: number;
}

interface SignalMessage {
  type: string;
  from?: string;
  to?: string;
  room?: string;
  peerId?: string;
  nickname?: string;
  peers?: Array<{ peerId: string; nickname: string }>;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  error?: string;
}

// In-memory storage (Note: This won't persist across function invocations in serverless)
// For production, use external storage like Redis, Upstash, or a real-time database
const peers = new Map<string, PeerInfo>();
const pendingMessages = new Map<string, SignalMessage[]>();

/**
 * Clean up stale peers (older than 5 minutes)
 */
function cleanupStalePeers() {
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  
  for (const [peerId, peer] of peers.entries()) {
    if (now - peer.lastSeen > staleThreshold) {
      peers.delete(peerId);
      pendingMessages.delete(peerId);
    }
  }
}

/**
 * Get all peers in a room
 */
function getPeersInRoom(room: string, excludePeerId?: string): Array<{ peerId: string; nickname: string }> {
  const roomPeers: Array<{ peerId: string; nickname: string }> = [];
  
  for (const [peerId, peer] of peers.entries()) {
    if (peer.room === room && peerId !== excludePeerId) {
      roomPeers.push({ peerId: peer.peerId, nickname: peer.nickname });
    }
  }
  
  return roomPeers;
}

/**
 * REST API handler for Vercel
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  cleanupStalePeers();

  const { action } = req.query;

  switch (action) {
    case 'join': {
      // Join a room
      const { peerId, nickname, room } = req.body;
      
      if (!peerId || !nickname || !room) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Register peer
      peers.set(peerId, {
        peerId,
        nickname,
        room,
        lastSeen: Date.now(),
      });

      // Initialize message queue
      if (!pendingMessages.has(peerId)) {
        pendingMessages.set(peerId, []);
      }

      // Get existing peers in room
      const existingPeers = getPeersInRoom(room, peerId);

      return res.status(200).json({
        type: 'PEERS',
        peers: existingPeers,
      });
    }

    case 'signal': {
      // Send signaling message to specific peer
      const message: SignalMessage = req.body;
      
      if (!message.to) {
        return res.status(400).json({ error: 'Missing recipient' });
      }

      // Update sender's last seen
      if (message.from) {
        const peer = peers.get(message.from);
        if (peer) {
          peer.lastSeen = Date.now();
        }
      }

      // Queue message for recipient
      const recipientMessages = pendingMessages.get(message.to) || [];
      recipientMessages.push(message);
      pendingMessages.set(message.to, recipientMessages);

      return res.status(200).json({ success: true });
    }

    case 'poll': {
      // Poll for pending messages
      const { peerId } = req.query;
      
      if (!peerId || typeof peerId !== 'string') {
        return res.status(400).json({ error: 'Missing peerId' });
      }

      // Update last seen
      const peer = peers.get(peerId);
      if (peer) {
        peer.lastSeen = Date.now();
      }

      // Get and clear pending messages
      const messages = pendingMessages.get(peerId) || [];
      pendingMessages.set(peerId, []);

      return res.status(200).json({ messages });
    }

    case 'leave': {
      // Leave room
      const { peerId } = req.body;
      
      if (!peerId) {
        return res.status(400).json({ error: 'Missing peerId' });
      }

      peers.delete(peerId);
      pendingMessages.delete(peerId);

      return res.status(200).json({ success: true });
    }

    case 'heartbeat': {
      // Keep connection alive
      const { peerId } = req.body;
      
      if (!peerId) {
        return res.status(400).json({ error: 'Missing peerId' });
      }

      const peer = peers.get(peerId);
      if (peer) {
        peer.lastSeen = Date.now();
        return res.status(200).json({ success: true });
      }

      return res.status(404).json({ error: 'Peer not found' });
    }

    default:
      return res.status(200).json({
        message: 'BitChat Signaling Server (Vercel)',
        status: 'active',
        note: 'This REST-based implementation is a fallback for Vercel. For better real-time performance, consider using a WebSocket service or deploying the signaling server separately.',
        endpoints: {
          join: 'POST /api/signal?action=join',
          signal: 'POST /api/signal?action=signal',
          poll: 'GET /api/signal?action=poll&peerId=<peerId>',
          leave: 'POST /api/signal?action=leave',
          heartbeat: 'POST /api/signal?action=heartbeat',
        },
      });
  }
}
