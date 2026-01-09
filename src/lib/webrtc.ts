/**
 * WebRTC Peer Management for BitChat
 * Handles P2P connections, mesh routing, and message relay
 */

import { EncryptedMessage } from './crypto';

export interface PeerInfo {
  peerId: string;
  nickname: string;
  connection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  publicKey?: string;
  signingPublicKey?: string;
  sharedSecret?: CryptoKey;
  connected: boolean;
  lastSeen: number;
}

export interface SignalMessage {
  type: 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'JOIN' | 'PEERS' | 'PEER_LEFT' | 'ERROR';
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

export interface ChatMessage {
  type: 'CHAT' | 'ENCRYPTED_MSG' | 'SYSTEM' | 'KEY_EXCHANGE' | 'RELAY';
  from: string;
  nickname: string;
  content: string;
  timestamp: number;
  messageId: string;
  hopCount?: number;
  encryptedData?: EncryptedMessage;
  publicKey?: string;
  signingPublicKey?: string;
}

export type MessageHandler = (message: ChatMessage) => void;
export type PeerUpdateHandler = (peers: Map<string, PeerInfo>) => void;
export type StatusHandler = (status: string) => void;

/**
 * WebRTC Peer Manager with mesh networking
 */
export class PeerManager {
  private peers: Map<string, PeerInfo> = new Map();
  private seenMessages: Set<string> = new Set();
  private maxHops = 3;
  private messageRetentionMs = 60000; // 1 minute
  
  private onMessage?: MessageHandler;
  private onPeerUpdate?: PeerUpdateHandler;
  private onStatus?: StatusHandler;

  constructor(
    onMessage?: MessageHandler,
    onPeerUpdate?: PeerUpdateHandler,
    onStatus?: StatusHandler
  ) {
    this.onMessage = onMessage;
    this.onPeerUpdate = onPeerUpdate;
    this.onStatus = onStatus;
    
    // Clean up old seen messages periodically
    setInterval(() => {
      const now = Date.now();
      this.seenMessages.forEach((msgId) => {
        // Remove messages older than retention period
        // (In a real implementation, we'd store timestamps)
        if (this.seenMessages.size > 1000) {
          this.seenMessages.delete(msgId);
        }
      });
    }, this.messageRetentionMs);
  }

  /**
   * Create a new peer connection
   */
  async createPeerConnection(
    peerId: string,
    nickname: string,
    initiator: boolean
  ): Promise<RTCPeerConnection> {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const connection = new RTCPeerConnection(config);
    
    const peerInfo: PeerInfo = {
      peerId,
      nickname,
      connection,
      connected: false,
      lastSeen: Date.now(),
    };

    this.peers.set(peerId, peerInfo);

    // Create data channel (initiator only)
    if (initiator) {
      const dataChannel = connection.createDataChannel('chat', {
        ordered: true,
      });
      this.setupDataChannel(dataChannel, peerId);
      peerInfo.dataChannel = dataChannel;
    } else {
      // Wait for data channel from remote peer
      connection.ondatachannel = (event) => {
        this.setupDataChannel(event.channel, peerId);
        peerInfo.dataChannel = event.channel;
      };
    }

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      this.updateStatus(`Peer ${nickname}: ${state}`);
      
      if (state === 'connected') {
        peerInfo.connected = true;
        peerInfo.lastSeen = Date.now();
        this.notifyPeerUpdate();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        peerInfo.connected = false;
        this.notifyPeerUpdate();
        
        if (state === 'failed' || state === 'closed') {
          this.removePeer(peerId);
        }
      }
    };

    return connection;
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannel(channel: RTCDataChannel, peerId: string) {
    const peerInfo = this.peers.get(peerId);
    if (!peerInfo) return;

    channel.onopen = () => {
      this.updateStatus(`Data channel opened with ${peerInfo.nickname}`);
      peerInfo.connected = true;
      this.notifyPeerUpdate();
    };

    channel.onclose = () => {
      this.updateStatus(`Data channel closed with ${peerInfo.nickname}`);
      peerInfo.connected = false;
      this.notifyPeerUpdate();
    };

    channel.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        this.handleIncomingMessage(message, peerId);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  /**
   * Handle incoming messages with deduplication and relay
   */
  private handleIncomingMessage(message: ChatMessage, fromPeerId: string) {
    // Check if we've seen this message before (deduplication)
    if (this.seenMessages.has(message.messageId)) {
      return; // Ignore duplicate
    }

    this.seenMessages.add(message.messageId);
    
    // Update last seen time for peer
    const peerInfo = this.peers.get(fromPeerId);
    if (peerInfo) {
      peerInfo.lastSeen = Date.now();
    }

    // Deliver to local application
    if (this.onMessage) {
      this.onMessage(message);
    }

    // Relay to other peers if hop count allows
    const hopCount = message.hopCount || 0;
    if (hopCount < this.maxHops) {
      this.relayMessage(message, fromPeerId);
    }
  }

  /**
   * Relay message to all connected peers except the sender
   */
  private relayMessage(message: ChatMessage, excludePeerId: string) {
    const relayedMessage: ChatMessage = {
      ...message,
      hopCount: (message.hopCount || 0) + 1,
    };

    this.peers.forEach((peer, peerId) => {
      if (peerId !== excludePeerId && peer.connected && peer.dataChannel) {
        try {
          peer.dataChannel.send(JSON.stringify(relayedMessage));
        } catch (error) {
          console.error(`Error relaying message to ${peer.nickname}:`, error);
        }
      }
    });
  }

  /**
   * Send message to all connected peers
   */
  sendMessage(message: ChatMessage) {
    // Add to seen messages to prevent echo
    this.seenMessages.add(message.messageId);

    this.peers.forEach((peer) => {
      if (peer.connected && peer.dataChannel) {
        try {
          peer.dataChannel.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending message to ${peer.nickname}:`, error);
        }
      }
    });
  }

  /**
   * Send message to specific peer
   */
  sendToPeer(peerId: string, message: ChatMessage) {
    const peer = this.peers.get(peerId);
    if (peer && peer.connected && peer.dataChannel) {
      try {
        peer.dataChannel.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to ${peer.nickname}:`, error);
      }
    }
  }

  /**
   * Remove peer and cleanup connection
   */
  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      if (peer.connection) {
        peer.connection.close();
      }
      this.peers.delete(peerId);
      this.notifyPeerUpdate();
    }
  }

  /**
   * Get all peers
   */
  getPeers(): Map<string, PeerInfo> {
    return new Map(this.peers);
  }

  /**
   * Get connected peer count
   */
  getConnectedCount(): number {
    let count = 0;
    this.peers.forEach((peer) => {
      if (peer.connected) count++;
    });
    return count;
  }

  /**
   * Update peer info
   */
  updatePeerInfo(peerId: string, updates: Partial<PeerInfo>) {
    const peer = this.peers.get(peerId);
    if (peer) {
      Object.assign(peer, updates);
      this.notifyPeerUpdate();
    }
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    this.peers.forEach((peer, peerId) => {
      this.removePeer(peerId);
    });
    this.peers.clear();
    this.seenMessages.clear();
  }

  /**
   * Notify subscribers of peer updates
   */
  private notifyPeerUpdate() {
    if (this.onPeerUpdate) {
      this.onPeerUpdate(this.getPeers());
    }
  }

  /**
   * Update status
   */
  private updateStatus(status: string) {
    if (this.onStatus) {
      this.onStatus(status);
    }
  }
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique peer ID
 */
export function generatePeerId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
