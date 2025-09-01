import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== process.env.FLW_WEBHOOK_HASH) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const event = await req.json();
  const d = event?.data || {};
  const provider_event_id = String(d?.id ?? "");
  const account_number = d?.account_number ?? d?.meta?.account_number;
  const amount = Number(d?.amount ?? 0);
  const currency = String(d?.currency || "NGN").toUpperCase();
  const narration = event?.event || d?.narration || "credit";

  if (!provider_event_id || !account_number || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const va = await supabaseAdmin
    .from("virtual_account")
    .select("uid")
    .eq("account_number", account_number)
    .limit(1)
    .maybeSingle();
  if (va.error) return NextResponse.json({ error: va.error.message }, { status: 400 });

  const uid = va.data?.uid ?? null;

  const ins = await supabaseAdmin.from("txn").insert({
    uid, provider_event_id, account_number, amount, currency, type: "credit", narration, raw: event
  });
  if (ins.error && !ins.error.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: ins.error.message }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
