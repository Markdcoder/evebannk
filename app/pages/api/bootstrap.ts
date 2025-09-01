import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { uid, email, name } = req.body || {};
    if (!uid || !email) return res.status(400).json({ error: "uid and email required" });

    const { error } = await supabaseAdmin
      .from("app_user")
      .upsert({ uid, email, name }, { onConflict: "uid" });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || "error" });
  }
}
