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

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Not authenticated");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Only admins can create institutes");

    const { instituteName, code, address, phone, instituteEmail, ownerEmail, ownerPassword, ownerFirstName, ownerLastName } = await req.json();

    if (!instituteName || !code || !ownerEmail || !ownerPassword || !ownerFirstName || !ownerLastName) {
      throw new Error("Missing required fields");
    }

    // 1. Create institute
    const { data: institute, error: instError } = await supabaseAdmin
      .from("institutes")
      .insert({
        name: instituteName,
        code,
        address: address || null,
        phone: phone || null,
        email: instituteEmail || null,
        is_approved: true,
        is_active: true,
      })
      .select()
      .single();

    if (instError) throw instError;

    // 2. Create owner auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { first_name: ownerFirstName, last_name: ownerLastName },
    });
    if (authError) throw authError;

    const userId = authData.user.id;

    // 3. Assign owner role
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "owner" });

    // 4. Update profile with institute_id
    await supabaseAdmin.from("profiles").update({ institute_id: institute.id }).eq("user_id", userId);

    // 5. Set owner_user_id on institute
    await supabaseAdmin.from("institutes").update({ owner_user_id: userId }).eq("id", institute.id);

    return new Response(JSON.stringify({ success: true, instituteId: institute.id, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
