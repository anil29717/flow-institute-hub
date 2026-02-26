import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, firstName, lastName, role } = await req.json();

    // Check if any owner already exists
    if (role === "owner") {
      const { data: existingOwners } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("role", "owner")
        .limit(1);
      if (existingOwners && existingOwners.length > 0) {
        throw new Error("An owner account already exists");
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (authError) throw authError;

    const userId = authData.user.id;

    // Assign role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role,
    });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
