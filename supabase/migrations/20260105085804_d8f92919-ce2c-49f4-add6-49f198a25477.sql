-- Add DELETE policy for chat_messages table
CREATE POLICY "Visitors can delete messages from their conversations"
ON public.chat_messages
FOR DELETE
USING (
  public.visitor_owns_conversation(
    conversation_id, 
    current_setting('request.headers', true)::json->>'x-visitor-id'
  )
);

-- Add DELETE policy for chat_conversations table
CREATE POLICY "Visitors can delete their own conversations"
ON public.chat_conversations
FOR DELETE
USING (visitor_id = ((current_setting('request.headers'::text, true))::json ->> 'x-visitor-id'::text));