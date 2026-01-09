/**
 * BitChat - Decentralized P2P Mesh Chat
 * Full-screen chat interface with E2E encryption
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Settings, AlertCircle, Lock, Wifi, WifiOff } from 'lucide-react';
import { PeerManager, ChatMessage, PeerInfo, SignalMessage, generateMessageId, generatePeerId, MessageHandler } from '@/lib/webrtc';
import { SignalingAdapter } from '@/lib/signaling';
import {
  generateKeyExchangeKeyPair,
  generateSigningKeyPair,
  exportPublicKey,
  importKeyExchangePublicKey,
  importSigningPublicKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
  KeyPair,
} from '@/lib/crypto';

interface DisplayMessage {
  id: string;
  nickname: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system' | 'error';
  encrypted?: boolean;
}

const BitChat = () => {
  // Setup state
  const [setupOpen, setSetupOpen] = useState(true);
  const [nickname, setNickname] = useState('');
  const [room, setRoom] = useState('general');
  const [tempNickname, setTempNickname] = useState('');
  const [tempRoom, setTempRoom] = useState('general');

  // Connection state
  const [peerId] = useState(() => generatePeerId());
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [peers, setPeers] = useState<Map<string, PeerInfo>>(new Map());

  // Message state
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // Crypto keys (ephemeral - in memory only)
  const [keyExchangeKeys, setKeyExchangeKeys] = useState<KeyPair | null>(null);
  const [signingKeys, setSigningKeys] = useState<KeyPair | null>(null);

  // Refs
  const signalingRef = useRef<SignalingAdapter | null>(null);
  const peerManagerRef = useRef<PeerManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handlePeerMessageRef = useRef<MessageHandler | null>(null);

  /**
   * Add message to chat display
   */
  const addMessage = useCallback((msg: DisplayMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  /**
   * Add system message
   */
  const addSystemMessage = useCallback((content: string) => {
    addMessage({
      id: generateMessageId(),
      nickname: 'System',
      content,
      timestamp: Date.now(),
      type: 'system',
    });
  }, [addMessage]);

  /**
   * Handle incoming chat messages from peers
   */
  const handlePeerMessage = useCallback(async (message: ChatMessage) => {
    try {
      let content = message.content;
      let isEncrypted = false;

      // Handle encrypted messages
      if (message.encryptedData && message.type === 'ENCRYPTED_MSG') {
        const peerInfo = peerManagerRef.current?.getPeers().get(message.from);
        if (peerInfo?.sharedSecret && peerInfo?.signingPublicKey) {
          const signingPubKey = await importSigningPublicKey(peerInfo.signingPublicKey);
          content = await decryptMessage(message.encryptedData, peerInfo.sharedSecret, signingPubKey);
          isEncrypted = true;
        } else {
          content = '[Encrypted message - keys not available]';
        }
      }

      // Handle key exchange messages
      if (message.type === 'KEY_EXCHANGE' && message.publicKey && message.signingPublicKey) {
        if (keyExchangeKeys && peerManagerRef.current) {
          const remotePubKey = await importKeyExchangePublicKey(message.publicKey);
          const sharedSecret = await deriveSharedSecret(keyExchangeKeys.privateKey, remotePubKey);
          
          peerManagerRef.current.updatePeerInfo(message.from, {
            publicKey: message.publicKey,
            signingPublicKey: message.signingPublicKey,
            sharedSecret,
          });

          addSystemMessage(`🔐 Established encrypted channel with ${message.nickname}`);
        }
        return; // Don't display key exchange as regular message
      }

      // Add to display
      addMessage({
        id: message.messageId,
        nickname: message.nickname,
        content,
        timestamp: message.timestamp,
        type: 'chat',
        encrypted: isEncrypted,
      });
    } catch (error) {
      console.error('Error handling peer message:', error);
      addMessage({
        id: generateMessageId(),
        nickname: 'System',
        content: `Error decrypting message from ${message.nickname}`,
        timestamp: Date.now(),
        type: 'error',
      });
    }
  }, [keyExchangeKeys, addMessage, addSystemMessage]);

  // Update the ref whenever the callback changes
  useEffect(() => {
    handlePeerMessageRef.current = handlePeerMessage;
  }, [handlePeerMessage]);

  /**
   * Initialize crypto keys
   */
  useEffect(() => {
    const initKeys = async () => {
      try {
        const kexKeys = await generateKeyExchangeKeyPair();
        const signKeys = await generateSigningKeyPair();
        setKeyExchangeKeys(kexKeys);
        setSigningKeys(signKeys);
      } catch (error) {
        console.error('Error generating keys:', error);
        addSystemMessage('⚠️ Error generating encryption keys');
      }
    };
    initKeys();
  }, [addSystemMessage]);

  /**
   * Handle signaling messages
   */
  const handleSignalMessage = useCallback(async (signal: SignalMessage) => {
    if (!peerManagerRef.current) return;

    switch (signal.type) {
      case 'PEERS':
        // Received list of existing peers in room
        if (signal.peers) {
          for (const peer of signal.peers) {
            if (peer.peerId !== peerId) {
              // connectToPeer will be called, defined below
              const remotePeerId = peer.peerId;
              const remoteNickname = peer.nickname;
              const initiator = true;
              
              try {
                const connection = await peerManagerRef.current.createPeerConnection(
                  remotePeerId,
                  remoteNickname,
                  initiator
                );

                // Handle ICE candidates
                connection.onicecandidate = (event) => {
                  if (event.candidate && signalingRef.current) {
                    const msg: SignalMessage = {
                      type: 'ICE_CANDIDATE',
                      from: peerId,
                      to: remotePeerId,
                      candidate: event.candidate.toJSON(),
                    };
                    signalingRef.current?.send(msg);
                  }
                };

                if (initiator) {
                  // Create and send offer
                  const offer = await connection.createOffer();
                  await connection.setLocalDescription(offer);

                  if (signalingRef.current) {
                    const msg: SignalMessage = {
                      type: 'OFFER',
                      from: peerId,
                      to: remotePeerId,
                      sdp: offer,
                    };
                    signalingRef.current?.send(msg);
                  }

                  // Send key exchange after connection
                  setTimeout(async () => {
                    if (!keyExchangeKeys || !signingKeys || !peerManagerRef.current) return;

                    try {
                      const publicKey = await exportPublicKey(keyExchangeKeys.publicKey);
                      const signingPublicKey = await exportPublicKey(signingKeys.publicKey);

                      const keyExchangeMsg: ChatMessage = {
                        type: 'KEY_EXCHANGE',
                        from: peerId,
                        nickname,
                        content: '',
                        timestamp: Date.now(),
                        messageId: generateMessageId(),
                        publicKey,
                        signingPublicKey,
                      };

                      peerManagerRef.current.sendToPeer(remotePeerId, keyExchangeMsg);
                    } catch (error) {
                      console.error('Error sending key exchange:', error);
                    }
                  }, 1000);
                }
              } catch (error) {
                console.error('Error connecting to peer:', error);
                addSystemMessage(`⚠️ Failed to connect to ${remoteNickname}`);
              }
            }
          }
        }
        break;

      case 'OFFER':
        if (signal.from && signal.sdp) {
          const remotePeerId = signal.from;
          const sdp = signal.sdp;
          
          const peers = peerManagerRef.current.getPeers();
          let connection = peers.get(remotePeerId)?.connection;

          if (!connection) {
            // Create new connection if doesn't exist
            const remotePeer = peers.get(remotePeerId);
            connection = await peerManagerRef.current.createPeerConnection(
              remotePeerId,
              remotePeer?.nickname || 'Unknown',
              false
            );

            connection.onicecandidate = (event) => {
              if (event.candidate && signalingRef.current) {
                const msg: SignalMessage = {
                  type: 'ICE_CANDIDATE',
                  from: peerId,
                  to: remotePeerId,
                  candidate: event.candidate.toJSON(),
                };
                signalingRef.current?.send(msg);
              }
            };
          }

          await connection.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);

          if (signalingRef.current) {
            const msg: SignalMessage = {
              type: 'ANSWER',
              from: peerId,
              to: remotePeerId,
              sdp: answer,
            };
            signalingRef.current?.send(msg);
          }

          // Send key exchange after connection
          setTimeout(async () => {
            if (!keyExchangeKeys || !signingKeys || !peerManagerRef.current) return;

            try {
              const publicKey = await exportPublicKey(keyExchangeKeys.publicKey);
              const signingPublicKey = await exportPublicKey(signingKeys.publicKey);

              const keyExchangeMsg: ChatMessage = {
                type: 'KEY_EXCHANGE',
                from: peerId,
                nickname,
                content: '',
                timestamp: Date.now(),
                messageId: generateMessageId(),
                publicKey,
                signingPublicKey,
              };

              peerManagerRef.current.sendToPeer(remotePeerId, keyExchangeMsg);
            } catch (error) {
              console.error('Error sending key exchange:', error);
            }
          }, 1000);
        }
        break;

      case 'ANSWER':
        if (signal.from && signal.sdp) {
          const peer = peerManagerRef.current.getPeers().get(signal.from);
          if (peer?.connection) {
            await peer.connection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        }
        break;

      case 'ICE_CANDIDATE':
        if (signal.from && signal.candidate) {
          const peer = peerManagerRef.current.getPeers().get(signal.from);
          if (peer?.connection) {
            await peer.connection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
        break;

      case 'PEER_LEFT':
        if (signal.peerId) {
          peerManagerRef.current.removePeer(signal.peerId);
          addSystemMessage(`${signal.nickname || 'User'} left the room`);
        }
        break;

      case 'ERROR':
        addSystemMessage(`⚠️ Server error: ${signal.error}`);
        break;
    }
  }, [peerId, nickname, keyExchangeKeys, signingKeys, addSystemMessage]);

  /**
   * Connect to signaling server
   */
  const connectToSignaling = useCallback(async () => {
    if (!nickname || !room) return;

    try {
      // Disconnect existing connection if any
      if (signalingRef.current) {
        signalingRef.current.disconnect();
      }

      // Create new signaling adapter (auto-detects WebSocket vs Polling)
      const signaling = new SignalingAdapter({
        peerId,
        nickname,
        room,
        onMessage: async (signal) => {
          try {
            await handleSignalMessage(signal);
          } catch (error) {
            console.error('Error handling signal:', error);
          }
        },
        onStatus: (statusMsg) => {
          setStatus(statusMsg);
          if (statusMsg.includes('Connected')) {
            setConnected(true);
          } else if (statusMsg.includes('Disconnected')) {
            setConnected(false);
          }
        },
      });

      signalingRef.current = signaling;

      // Connect
      await signaling.connect();
      
      const mode = signaling.getMode();
      addSystemMessage(`Connected via ${mode === 'websocket' ? 'WebSocket (Netlify)' : 'HTTP Polling (Vercel)'}`);
    } catch (error) {
      console.error('Error connecting to signaling server:', error);
      addSystemMessage('⚠️ Failed to connect to signaling server');
      setStatus('Connection error');
    }
  }, [nickname, room, peerId, addSystemMessage, handleSignalMessage]);

  /**
   * Send message to peers
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || !peerManagerRef.current) return;

    const msg = inputMessage.trim();
    setInputMessage('');

    // Handle commands
    if (msg.startsWith('/')) {
      handleCommand(msg);
      return;
    }

    // Create message
    const messageId = generateMessageId();
    const timestamp = Date.now();

    // Add to local display first
    addMessage({
      id: messageId,
      nickname: nickname,
      content: msg,
      timestamp,
      type: 'chat',
      encrypted: true,
    });

    // Send to peers (with encryption)
    try {
      const peersList = Array.from(peerManagerRef.current.getPeers().values());
      
      for (const peer of peersList) {
        if (peer.connected && peer.sharedSecret && signingKeys) {
          // Encrypt for this peer
          const encryptedData = await encryptMessage(
            msg,
            peer.sharedSecret,
            signingKeys.privateKey,
            keyExchangeKeys!.publicKey
          );

          const chatMessage: ChatMessage = {
            type: 'ENCRYPTED_MSG',
            from: peerId,
            nickname,
            content: msg, // Fallback for unencrypted display
            timestamp,
            messageId,
            encryptedData,
          };

          peerManagerRef.current.sendToPeer(peer.peerId, chatMessage);
        } else {
          // Send unencrypted if no shared secret yet
          const chatMessage: ChatMessage = {
            type: 'CHAT',
            from: peerId,
            nickname,
            content: msg,
            timestamp,
            messageId,
          };

          peerManagerRef.current.sendToPeer(peer.peerId, chatMessage);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addSystemMessage('⚠️ Error sending message');
    }
  };

  /**
   * Handle IRC-style commands
   */
  const handleCommand = (cmd: string) => {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/nick':
        if (parts[1]) {
          setNickname(parts[1]);
          localStorage.setItem('bitchat_nickname', parts[1]);
          addSystemMessage(`Nickname changed to ${parts[1]}`);
        }
        break;

      case '/join':
        if (parts[1]) {
          setRoom(parts[1]);
          localStorage.setItem('bitchat_room', parts[1]);
          addSystemMessage(`Switching to room: ${parts[1]}`);
          // Reconnect to new room
          if (signalingRef.current) {
            signalingRef.current?.disconnect();
          }
        }
        break;

      case '/who': {
        const peerList = Array.from(peers.values())
          .filter((p) => p.connected)
          .map((p) => p.nickname)
          .join(', ');
        addSystemMessage(`Connected peers: ${peerList || 'None'}`);
        break;
      }

      case '/clear':
        setMessages([]);
        addSystemMessage('Chat cleared');
        break;

      case '/help':
        addSystemMessage(
          'Commands: /nick <name>, /join <room>, /who, /clear, /help'
        );
        break;

      default:
        addSystemMessage(`Unknown command: ${command}`);
    }
  };

  /**
   * Initialize peer manager
   */
  useEffect(() => {
    const manager = new PeerManager(
      (msg) => handlePeerMessageRef.current?.(msg),
      (updatedPeers) => setPeers(new Map(updatedPeers)),
      (statusMsg) => setStatus(statusMsg)
    );
    peerManagerRef.current = manager;

    return () => {
      manager.cleanup();
    };
  }, []); // Empty dependency array - only create once

  /**
   * Load preferences from localStorage
   */
  useEffect(() => {
    const savedNickname = localStorage.getItem('bitchat_nickname');
    const savedRoom = localStorage.getItem('bitchat_room');
    if (savedNickname) setTempNickname(savedNickname);
    if (savedRoom) setTempRoom(savedRoom);
  }, []);

  /**
   * Auto-scroll to bottom
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (signalingRef.current) {
        signalingRef.current.disconnect();
      }
      peerManagerRef.current?.cleanup();
    };
  }, []);

  /**
   * Handle setup completion
   */
  const handleSetupComplete = () => {
    if (!tempNickname.trim()) {
      addSystemMessage('⚠️ Please enter a nickname');
      return;
    }

    setNickname(tempNickname.trim());
    setRoom(tempRoom.trim());
    localStorage.setItem('bitchat_nickname', tempNickname.trim());
    localStorage.setItem('bitchat_room', tempRoom.trim());
    setSetupOpen(false);

    // Connect after setup
    setTimeout(() => {
      connectToSignaling();
    }, 100);
  };

  const connectedPeers = Array.from(peers.values()).filter((p) => p.connected);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Setup Modal */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              BitChat Setup
            </DialogTitle>
            <DialogDescription>
              Join a decentralized, end-to-end encrypted P2P chat room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nickname</label>
              <Input
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="Enter your nickname"
                onKeyDown={(e) => e.key === 'Enter' && handleSetupComplete()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              <Input
                value={tempRoom}
                onChange={(e) => setTempRoom(e.target.value)}
                placeholder="Enter room name"
                onKeyDown={(e) => e.key === 'Enter' && handleSetupComplete()}
              />
            </div>
            <Button onClick={handleSetupComplete} className="w-full">
              Join Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Lock className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">BitChat</h1>
            <p className="text-xs text-muted-foreground">
              Room: {room} • {nickname}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={connected ? 'default' : 'secondary'} className="gap-1">
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {status}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {connectedPeers.length} peers
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${
                    msg.type === 'system' || msg.type === 'error'
                      ? 'items-center'
                      : msg.nickname === nickname
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  {msg.type === 'system' || msg.type === 'error' ? (
                    <div
                      className={`text-sm px-3 py-1 rounded-full ${
                        msg.type === 'error'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        {msg.encrypted && (
                          <Lock className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-md break-words ${
                          msg.nickname === nickname
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message... (or /help for commands)"
                className="flex-1"
                disabled={!connected}
              />
              <Button type="submit" disabled={!connected || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-border bg-card p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connected Peers ({connectedPeers.length})
            </h3>
            <div className="space-y-1">
              {connectedPeers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No peers connected</p>
              ) : (
                connectedPeers.map((peer) => (
                  <div
                    key={peer.peerId}
                    className="flex items-center gap-2 p-2 rounded bg-muted/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{peer.nickname}</span>
                    {peer.sharedSecret && (
                      <Lock className="h-3 w-3 ml-auto text-green-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Info
            </h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• End-to-end encrypted</p>
              <p>• Mesh routing (3 hops max)</p>
              <p>• No server message storage</p>
              <p>• Type /help for commands</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setSetupOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BitChat;
