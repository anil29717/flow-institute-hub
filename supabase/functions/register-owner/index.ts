import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      instituteName, code, address, phone, instituteEmail,
      ownerEmail, ownerPassword, ownerFirstName, ownerLastName, ownerPhone
    } = await req.json();

    // Validate required fields
    if (!instituteName || !code || !ownerEmail || !ownerPassword || !ownerFirstName || !ownerLastName) {
      throw new Error("Missing required fields");
    }

    if (ownerPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Check if institute code already exists
    const { data: existingInst } = await supabaseAdmin
      .from("institutes")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (existingInst) throw new Error("Institute code already taken");

    // Check if email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === ownerEmail);
    if (emailExists) throw new Error("Email already registered");

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { first_name: ownerFirstName, last_name: ownerLastName },
    });
    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Create institute (is_approved = false by default)
    const { data: institute, error: instError } = await supabaseAdmin
      .from("institutes")
      .insert({
        name: instituteName,
        code,
        address: address || null,
        phone: phone || null,
        email: instituteEmail || null,
        owner_user_id: userId,
        is_approved: false,
        is_active: true,
      })
      .select()
      .single();
    if (instError) throw instError;

    // 3. Assign owner role
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "owner" });
    if (roleErr) throw roleErr;

    // 4. Update profile with institute_id and phone
    const profileUpdate: any = { institute_id: institute.id };
    if (ownerPhone) profileUpdate.phone = ownerPhone;
    await supabaseAdmin.from("profiles").update(profileUpdate).eq("user_id", userId);

    return new Response(JSON.stringify({ success: true, instituteId: institute.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
