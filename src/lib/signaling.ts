/**
 * Signaling Adapter for BitChat
 * Supports both WebSocket (Netlify) and HTTP polling (Vercel)
 */

import { SignalMessage } from './webrtc';

export type SignalingMode = 'websocket' | 'polling';
export type MessageHandler = (message: SignalMessage) => void;
export type StatusHandler = (status: string) => void;

export interface SignalingOptions {
  mode?: SignalingMode;
  peerId: string;
  nickname: string;
  room: string;
  onMessage: MessageHandler;
  onStatus: StatusHandler;
}

/**
 * Signaling Adapter - abstracts WebSocket and polling implementations
 */
export class SignalingAdapter {
  private mode: SignalingMode;
  private peerId: string;
  private nickname: string;
  private room: string;
  private onMessage: MessageHandler;
  private onStatus: StatusHandler;
  
  private ws: WebSocket | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private baseUrl: string;

  constructor(options: SignalingOptions) {
    this.peerId = options.peerId;
    this.nickname = options.nickname;
    this.room = options.room;
    this.onMessage = options.onMessage;
    this.onStatus = options.onStatus;
    
    // Auto-detect mode based on environment
    this.mode = options.mode || this.detectMode();
    
    // Determine base URL based on environment
    this.baseUrl = this.getBaseUrl();
  }

  /**
   * Auto-detect signaling mode
   */
  private detectMode(): SignalingMode {
    // Check if running on Vercel
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('drqsatoshin.xyz') ||
        window.location.hostname.includes('drqsatoshin.com')) {
      return 'polling';
    }
    
    // Check if running on Netlify
    if (window.location.hostname.includes('netlify.app')) {
      return 'websocket';
    }
    
    // Default to polling for other domains (safer fallback)
    return 'polling';
  }

  /**
   * Get base URL for signaling
   */
  private getBaseUrl(): string {
    if (import.meta.env.DEV) {
      // Local development - try WebSocket first
      return this.mode === 'websocket' 
        ? 'ws://localhost:8888/.netlify/functions/signal'
        : 'http://localhost:5173/api/signal';
    }
    
    // Production
    if (this.mode === 'websocket') {
      return `wss://${window.location.host}/.netlify/functions/signal`;
    } else {
      return `https://${window.location.host}/api/signal`;
    }
  }

  /**
   * Connect to signaling server
   */
  async connect(): Promise<void> {
    if (this.mode === 'websocket') {
      await this.connectWebSocket();
    } else {
      await this.connectPolling();
    }
  }

  /**
   * Connect via WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    try {
      this.ws = new WebSocket(this.baseUrl);

      this.ws.onopen = () => {
        this.onStatus('Connected to signaling server (WebSocket)');
        
        // Join room
        this.send({
          type: 'JOIN',
          room: this.room,
          peerId: this.peerId,
          nickname: this.nickname,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: SignalMessage = JSON.parse(event.data);
          this.onMessage(message);
        } catch (error) {
          console.error('Error parsing signal message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onStatus('Connection error');
      };

      this.ws.onclose = () => {
        this.onStatus('Disconnected');
        
        // Attempt reconnect after 5 seconds
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error connecting via WebSocket:', error);
      throw error;
    }
  }

  /**
   * Connect via HTTP polling
   */
  private async connectPolling(): Promise<void> {
    try {
      // Join room
      const response = await fetch(`${this.baseUrl}?action=join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: this.peerId,
          nickname: this.nickname,
          room: this.room,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const data = await response.json();
      this.onStatus('Connected to signaling server (Polling)');
      
      // Handle initial peers
      if (data.type === 'PEERS') {
        this.onMessage(data);
      }

      // Start polling for messages
      this.startPolling();
    } catch (error) {
      console.error('Error connecting via polling:', error);
      this.onStatus('Connection error');
      
      // Retry after 5 seconds
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 5000);
    }
  }

  /**
   * Start polling for messages
   */
  private startPolling(): void {
    // Poll every 1 second
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}?action=poll&peerId=${this.peerId}`);
        
        if (!response.ok) {
          throw new Error('Polling failed');
        }

        const data = await response.json();
        
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((message: SignalMessage) => {
            this.onMessage(message);
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Don't throw - just log and continue polling
      }
    }, 1000);

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${this.baseUrl}?action=heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: this.peerId }),
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000);
  }

  /**
   * Send message to signaling server
   */
  send(message: SignalMessage): void {
    if (this.mode === 'websocket') {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    } else {
      // For polling mode, send via HTTP
      fetch(`${this.baseUrl}?action=signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }).catch((error) => {
        console.error('Error sending signal:', error);
      });
    }
  }

  /**
   * Disconnect from signaling server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.mode === 'websocket') {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    } else {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Send leave request
      fetch(`${this.baseUrl}?action=leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: this.peerId }),
      }).catch((error) => {
        console.error('Error leaving room:', error);
      });
    }

    this.onStatus('Disconnected');
  }

  /**
   * Get current mode
   */
  getMode(): SignalingMode {
    return this.mode;
  }
}
