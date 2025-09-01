import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, name } = await req.json();
    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("app_user")
      .upsert({ uid, email, name }, { onConflict: "uid" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 400 });
  }
}

// (Optional sanity check: GET returns 405 so you know the route exists)
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
