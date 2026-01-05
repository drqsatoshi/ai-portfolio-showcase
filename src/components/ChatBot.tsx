import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string | null; created_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const getVisitorId = (): string => {
  const key = 'portfolio_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(getVisitorId());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations on open
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at')
      .eq('visitor_id', visitorId.current)
      .order('updated_at', { ascending: false });
    
    if (data) setConversations(data);
  };

  const loadConversation = async (conversationId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data as Message[]);
      setCurrentConversationId(conversationId);
      setShowHistory(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role,
      content
    });
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let convId = currentConversationId;

    try {
      // Create conversation if new
      if (!convId) {
        const { data } = await supabase
          .from('chat_conversations')
          .insert({ 
            visitor_id: visitorId.current,
            title: input.trim().slice(0, 50)
          })
          .select('id')
          .single();
        
        if (data) {
          convId = data.id;
          setCurrentConversationId(convId);
        }
      } else {
        // Update conversation timestamp
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);
      }

      // Save user message
      if (convId) {
        await saveMessage(convId, 'user', userMessage.content);
      }

      // Stream AI response
      const assistantContent = await streamChat(newMessages);

      // Save assistant message
      if (convId && assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
      }

      // Refresh conversation list
      loadConversations();

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 hover:scale-110"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-foreground">Portfolio Assistant</h3>
              <p className="text-xs text-primary-foreground/70">Ask me about projects & skills</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={startNewConversation}
                title="New conversation"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 hover:bg-primary-foreground/10",
                  showHistory ? "text-primary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
                )}
                onClick={() => setShowHistory(!showHistory)}
                title="Chat history"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory ? (
            <ScrollArea className="h-[350px] p-4">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No previous conversations</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg transition-colors",
                        "hover:bg-muted text-sm",
                        currentConversationId === conv.id && "bg-muted"
                      )}
                    >
                      <p className="font-medium truncate text-foreground">
                        {conv.title || "Untitled conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Hi! Ask me anything about the portfolio, Web3 projects, or research publications.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        msg.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
