// supabase/functions/get-accounts/index.ts
// Returns a list of GBP accounts for the signed-in user (mock for now)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsOptions } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle preflight (CORS)
  const preflight = handleCorsOptions(req);
  if (preflight) return preflight;

  try {
    // Basic auth presence check (Supabase also verifies the JWT for us)
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Later we'll use this to call Google APIs
    // const googleToken = req.headers.get("x-provider-token") || "";

    // ---- MOCK DATA (minimal fields used by the UI chain) ----
    const accounts = [
      { id: "accounts/aaa", name: "Client A Holdings" },
      { id: "accounts/bbb", name: "Client B Group" },
    ];

    return new Response(JSON.stringify(accounts), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-accounts error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
