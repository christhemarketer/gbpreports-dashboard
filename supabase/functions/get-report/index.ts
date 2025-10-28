// supabase/functions/get-report/index.ts
// Returns a full report object for a given GBP location (mock for now)

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

    // Required query param: ?location=locations/123
    const url = new URL(req.url);
    const location = url.searchParams.get("location");
    if (!location) {
      return new Response(JSON.stringify({ error: "Missing 'location' query param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO (later): use Google provider token to fetch live GBP data
    // const googleToken = req.headers.get("x-provider-token") || "";

    // ---- MOCK DATA (shape matches your Dashboard.jsx expectations) ----
    const mockReports: Record<string, any> = {
      "locations/111": {
        businessName: "Main Street Pizzeria",
        nap: { address: "123 Main St, Anytown, USA", phone: "(555) 123-4567" },
        type: "Location-Based",
        metrics: {
          calls: "1,204",
          websiteClicks: "850",
          directionRequests: "430",
          photoViews: "5.2k",
        },
        performanceTrend: [
          { name: "Jan", clicks: 200, views: 500 },
          { name: "Feb", clicks: 300, views: 700 },
          { name: "Mar", clicks: 500, views: 1200 },
          { name: "Apr", clicks: 450, views: 1100 },
          { name: "May", clicks: 600, views: 1500 },
          { name: "Jun", clicks: 850, views: 2100 },
        ],
        searchViews: { discovery: 75, direct: 25 },
        keywords: [
          { keyword: "pizza near me", count: 450 },
          { keyword: "best pizza anytown", count: 210 },
          { keyword: "main street pizzeria", count: 120 },
          { keyword: "restaurant open late", count: 85 },
          { keyword: "slice pepperoni", count: 40 },
        ],
        reviews: {
          totalCount: 482,
          averageRating: 4.6,
          recent: [
            { id: 1, user: "Jane D.", rating: 5, text: "Best pizza in town!", responded: true },
            { id: 2, user: "John S.", rating: 4, text: "Great service, good crust.", responded: false },
            { id: 3, user: "Mike B.", rating: 5, text: "A must-visit every time I am in Anytown.", responded: true },
          ],
        },
        aiSummary:
          'Your performance this month was exceptionally strong, driven by a 30% increase in "pizza near me" searches. While photo views are high, your review response rate has dropped to 50%. Focusing on responding to all new reviews could significantly boost customer trust.',
      },
      "locations/222": {
        businessName: "Oak Avenue Legal Services",
        nap: { address: "456 Oak Ave, Anytown, USA", phone: "(555) 987-6543" },
        type: "Service Area Business",
        metrics: {
          calls: "310",
          websiteClicks: "420",
          directionRequests: "90",
          photoViews: "1.1k",
        },
        performanceTrend: [
          { name: "Jan", clicks: 100, views: 200 },
          { name: "Feb", clicks: 120, views: 250 },
          { name: "Mar", clicks: 150, views: 300 },
          { name: "Apr", clicks: 180, views: 400 },
          { name: "May", clicks: 250, views: 500 },
          { name: "Jun", clicks: 420, views: 700 },
        ],
        searchViews: { discovery: 60, direct: 40 },
        keywords: [
          { keyword: "lawyer near me", count: 150 },
          { keyword: "legal services anytown", count: 90 },
          { keyword: "oak avenue legal", count: 45 },
          { keyword: "family law", count: 30 },
        ],
        reviews: {
          totalCount: 75,
          averageRating: 4.9,
          recent: [
            { id: 1, user: "Sarah K.", rating: 5, text: "Very professional and helpful.", responded: true },
            { id: 2, user: "Tom W.", rating: 5, text: "Helped me with my case, highly recommend.", responded: true },
          ],
        },
        aiSummary:
          'Your calls and website clicks saw a significant uptick this month, aligning with a rise in "lawyer near me" queries. Your review profile is pristine—keep encouraging satisfied clients to leave reviews to maintain this advantage.',
      },
    };

    const report = mockReports[location] ?? mockReports["locations/111"];

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-report error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
