import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return existing active share if one exists
  const { data: existingRows } = await supabase
    .from("calendar_shares")
    .select("token, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1);

  if (existingRows && existingRows.length > 0) {
    const existing = existingRows[0];
    const url = new URL(`/share/${existing.token}`, request.url).toString();
    return NextResponse.json({ token: existing.token, url, isActive: true });
  }

  // Create new share
  const { data: newShare, error } = await supabase
    .from("calendar_shares")
    .insert({ user_id: userId })
    .select("token")
    .single();

  if (error) {
    console.error("Failed to create share:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create share", details: error.message, code: error.code, hint: error.hint },
      { status: 500 }
    );
  }

  const url = new URL(`/share/${newShare.token}`, request.url).toString();
  return NextResponse.json({ token: newShare.token, url, isActive: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase
    .from("calendar_shares")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  return NextResponse.json({ isActive: false });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows } = await supabase
    .from("calendar_shares")
    .select("token, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1);

  if (!rows || rows.length === 0) {
    return NextResponse.json({ isActive: false });
  }

  return NextResponse.json({ token: rows[0].token, isActive: true });
}
