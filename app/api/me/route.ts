import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const hdr = req.headers.get("authorization") || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const uid = user.id;

  const [u, vaccts, bals] = await Promise.all([
    supabaseAdmin.from("app_user").select("*").eq("uid", uid).maybeSingle(),
    supabaseAdmin.from("virtual_account").select("*").eq("uid", uid).order("created_at", { ascending: false }),
    supabaseAdmin.from("balance").select("*").eq("uid", uid),
  ]);

  return NextResponse.json({
    user: u.data || null,
    virtual_accounts: vaccts.data || [],
    balances: bals.data || [],
  });
}
