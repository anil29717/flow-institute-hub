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
      .eq("role", "owner")
      .single();

    if (!roleData) throw new Error("Only owners can create teacher accounts");

    // Get caller's institute for auto-generating employee_id
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("institute_id")
      .eq("user_id", caller.id)
      .single();

    let instCode = "INST";
    if (callerProfile?.institute_id) {
      const { data: inst } = await supabaseAdmin
        .from("institutes")
        .select("code")
        .eq("id", callerProfile.institute_id)
        .single();
      if (inst?.code) instCode = inst.code.toUpperCase();
    }

    const { email, password, firstName, lastName, phone, qualification, specialization, experienceYears, salaryAmount, salaryType, paymentFrequency } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Missing required fields: email, password, firstName, lastName");
    }

    // Auto-generate employee ID: INST_CODE-TEA-RANDOM
    const random = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `${instCode}-TEA-${random}`;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Assign teacher role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "teacher",
    });
    if (roleError) throw roleError;

    // 3. Update profile with phone and institute_id
    const updateData: Record<string, unknown> = {};
    if (phone) updateData.phone = phone;
    if (callerProfile?.institute_id) updateData.institute_id = callerProfile.institute_id;
    if (Object.keys(updateData).length > 0) {
      await supabaseAdmin.from("profiles").update(updateData).eq("user_id", userId);
    }

    // 4. Get profile id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) throw new Error("Profile not created");

    // 5. Create teacher record
    const { error: teacherError } = await supabaseAdmin.from("teachers").insert({
      profile_id: profile.id,
      employee_id: employeeId,
      institute_id: callerProfile?.institute_id || null,
      qualification: qualification || null,
      specialization: specialization || null,
      experience_years: experienceYears || 0,
      salary_amount: salaryAmount || 0,
      salary_type: salaryType || 'per_month',
      payment_frequency: paymentFrequency || 'monthly',
    });
    if (teacherError) throw teacherError;

    return new Response(JSON.stringify({ success: true, userId, employeeId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
