// supabase/functions/get-locations/index.ts
// Returns a list of GBP locations for a given account (mock for now)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsOptions } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle preflight
  const preflight = handleCorsOptions(req);
  if (preflight) return preflight;

  try {
    // Supabase will verify the JWT for us (verify_jwt = true in config.toml),
    // but we still check presence to return a clear 401 if missing.
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read query params
    const url = new URL(req.url);
    const account = url.searchParams.get("account");
    if (!account) {
      return new Response(JSON.stringify({ error: "Missing 'account' query param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If you already pass the Google token from the frontend, you can read it here:
    // const googleToken = req.headers.get("x-provider-token") || "";

    // TODO (later): call the real GBP API using the Google token & account id.
    // For now, return mock locations to unblock the UI.
    const mockLocations = [
      { id: "locations/111", name: "Client A - Main St" },
      { id: "locations/222", name: "Client B - Oak Ave" },
      { id: "locations/333", name: "Client C - Riverside" },
    ];

    // Example: filter by account if you want different mocks per account
    // (right now this just echoes back the same list)
    const locations = mockLocations;

    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-locations error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
