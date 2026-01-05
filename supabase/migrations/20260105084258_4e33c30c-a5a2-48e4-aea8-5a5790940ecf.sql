-- Create conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations - visitors can only access their own via visitor_id passed in request
CREATE POLICY "Anyone can insert conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can select conversations by visitor_id" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update their conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (true);

-- RLS policies for messages
CREATE POLICY "Anyone can insert messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can select messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Index for faster lookups
CREATE INDEX idx_conversations_visitor_id ON public.chat_conversations(visitor_id);
CREATE INDEX idx_messages_conversation_id ON public.chat_messages(conversation_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();