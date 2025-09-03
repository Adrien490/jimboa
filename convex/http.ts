import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add authentication routes
auth.addHttpRoutes(http);

// Public API route to get group info by code (for sharing links)
http.route({
  path: "/api/groups/info",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Code parameter is required" }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        }
      );
    }

    try {
      // Query the group by code (this would need a public query)
      const groupInfo = await ctx.runQuery(api.groups.getByCode, { code });
      
      if (!groupInfo) {
        return new Response(
          JSON.stringify({ error: "Group not found" }),
          { 
            status: 404,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          name: groupInfo.name,
          type: groupInfo.type,
          memberCount: groupInfo.memberCount,
          isPublic: true
        }),
        { 
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }),
});

// Webhook endpoint for external integrations
http.route({
  path: "/webhooks/external",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const authHeader = request.headers.get("Authorization");
      
      // Simple webhook authentication (you should use a proper secret in production)
      if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { 
            status: 401,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Process webhook data (example: external service notification)
      console.log("Received webhook:", body);
      
      // You could trigger internal actions here
      // await ctx.runMutation(internal.notifications.processWebhook, { data: body });

      return new Response(
        JSON.stringify({ success: true, received: true }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process webhook" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        service: "jimboa-api"
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }),
});

// CORS preflight handler for all routes
http.route({
  path: "/api/groups/info",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
