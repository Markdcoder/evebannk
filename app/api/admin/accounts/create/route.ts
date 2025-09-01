import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAdmin(req: NextRequest): boolean {
  const header = req.headers.get("x-admin-key");
  return !!header && header === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uid, bvn, email, isPermanent } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }

    // Mark user as KYC approved
    const u = await supabaseAdmin
      .from("app_user")
      .update({ kyc_status: "approved" })
      .eq("uid", uid);
    if (u.error) throw new Error(u.error.message);

    const reference = `evb_${uid}_${Date.now()}`;

    // Build request body for Flutterwave
    const body: Record<string, any> = {
      email: email || "sandbox@example.com",
      is_permanent: Boolean(isPermanent),
      tx_ref: reference,
    };
    if (isPermanent) body.bvn = String(bvn);

    const resp = await fetch("https://api.flutterwave.com/v3/virtual-account-numbers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.message || JSON.stringify(json));

    const data = json?.data || {};
    const account_number = data.account_number || "0000000000";
    const bank_name = data.bank_name || "Test Bank";
    const account_reference = data.order_ref || reference;

    const ins = await supabaseAdmin.from("virtual_account").insert({
      uid,
      account_number,
      bank_name,
      account_reference,
      currency: "NGN",
    });
    if (ins.error) throw new Error(ins.error.message);

    return NextResponse.json({
      ok: true,
      account_number,
      bank_name,
      is_permanent: Boolean(isPermanent),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 400 });
  }
}
