import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * One-time setup: create the owner account.
 * POST /api/setup/create-owner
 * Body: { email: string, password: string, fullName?: string }
 *
 * This route should be disabled after initial setup.
 */
export async function POST(request: Request) {
  // Only allow in development or if no owner exists yet
  const { data: existingOwner } = await supabaseAdmin
    .from("profiles" as never)
    .select("id")
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (existingOwner) {
    return NextResponse.json(
      { error: "Owner account already exists." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { email, password, fullName } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Create auth user
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: fullName || "",
        role: "owner",
      },
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Profile auto-created by trigger, but update full_name if provided
  if (fullName && authUser.user) {
    await supabaseAdmin.from("profiles" as never).update({ full_name: fullName } as never).eq("id", authUser.user.id);
  }

  return NextResponse.json({
    message: "Owner account created successfully.",
    userId: authUser.user.id,
  });
}
