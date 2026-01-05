import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-visitor-id",
};

const SYSTEM_PROMPT = `You are a helpful AI assistant for a developer's portfolio website. You help visitors learn about:

- The developer's research publications and academic work
- Web3 projects including $DrQ token ecosystem on Solana and the Q mirror token
- Community building efforts like the Telegram chat (t.me/qdrqchat) and Friday movie nights on cytu.be/r/dienull
- Technical skills in CSS, web development, and blockchain
- ENS domains: drq.eth and dienull.eth

Be friendly, concise, and helpful. If asked about specific technical details you don't know, suggest the visitor explore the relevant section of the portfolio or reach out via the contact form.`;

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(visitorId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(visitorId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(visitorId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Validate message structure
function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }
  
  if (messages.length > 50) {
    return { valid: false, error: "Too many messages (max 50)" };
  }
  
  const validRoles = ["user", "assistant", "system"];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Message ${i} is invalid` };
    }
    
    if (!msg.role || typeof msg.role !== "string") {
      return { valid: false, error: `Message ${i} missing valid role` };
    }
    
    if (!validRoles.includes(msg.role)) {
      return { valid: false, error: `Message ${i} has invalid role` };
    }
    
    if (!msg.content || typeof msg.content !== "string") {
      return { valid: false, error: `Message ${i} missing valid content` };
    }
    
    if (msg.content.length > 10000) {
      return { valid: false, error: `Message ${i} content too long (max 10000 chars)` };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get visitor ID from header for rate limiting
    const visitorId = req.headers.get("x-visitor-id") || "anonymous";
    
    // Check rate limit
    if (!checkRateLimit(visitorId)) {
      console.warn(`Rate limit exceeded for visitor: ${visitorId}`);
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute and try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages } = body;
    
    // Validate input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.warn(`Invalid input from visitor ${visitorId}: ${validation.error}`);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Chat request from visitor ${visitorId} with ${messages.length} messages`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
