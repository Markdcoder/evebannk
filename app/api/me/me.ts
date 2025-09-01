import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAnon, supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });

  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });

  const uid = user.id;

  const [u, vaccts, bals] = await Promise.all([
    supabaseAdmin.from("app_user").select("*").eq("uid", uid).maybeSingle(),
    supabaseAdmin.from("virtual_account").select("*").eq("uid", uid).order("created_at", { ascending: false }),
    supabaseAdmin.from("balance").select("*").eq("uid", uid),
  ]);

  return res.status(200).json({
    user: u.data || null,
    virtual_accounts: vaccts.data || [],
    balances: bals.data || [],
  });
}
