export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://www.gbpreports.com",
  "Vary": "Origin",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-provider-token, content-type",
};

export function handleCorsOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

