-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can select conversations by visitor_id" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update their conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can select messages" ON public.chat_messages;

-- Create security definer function to check visitor owns conversation
CREATE OR REPLACE FUNCTION public.visitor_owns_conversation(_conversation_id uuid, _visitor_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_conversations
    WHERE id = _conversation_id
      AND visitor_id = _visitor_id
  )
$$;

-- chat_conversations policies: validate visitor_id from header
CREATE POLICY "Visitors can insert their own conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can select their own conversations"
ON public.chat_conversations
FOR SELECT
USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can update their own conversations"
ON public.chat_conversations
FOR UPDATE
USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

-- chat_messages policies: validate conversation ownership via header
CREATE POLICY "Visitors can insert messages to their conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  public.visitor_owns_conversation(conversation_id, current_setting('request.headers', true)::json->>'x-visitor-id')
);

CREATE POLICY "Visitors can select messages from their conversations"
ON public.chat_messages
FOR SELECT
USING (
  public.visitor_owns_conversation(conversation_id, current_setting('request.headers', true)::json->>'x-visitor-id')
);