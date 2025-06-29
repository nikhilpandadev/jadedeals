// This file has been moved to the correct location for Supabase Edge Functions.
// Please use supabase/functions/archive-expired-deals/index.ts as your entrypoint.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Call the Postgres function to archive expired deals
  const { error } = await supabase.rpc("archive_expired_deals");
  if (error) {
    return new Response(`Archiving failed: ${error.message}`, { status: 500 });
  }
  return new Response("Archiving completed successfully", { status: 200 });
});
