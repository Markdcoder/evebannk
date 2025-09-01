"use client";

import { useState } from "react";

export default function AdminPage() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");     // optional, fallback to sandbox@example.com
  const [bvn, setBvn] = useState("");         // required if permanent
  const [isPermanent, setIsPermanent] = useState(true); // choose permanent or temporary
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const createVA = async () => {
    setMsg(null); setErr(null);
    try {
      const r = await fetch("/api/admin/accounts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_HEADER || ""
        },
        body: JSON.stringify({
          uid,
          email: email || undefined,
          bvn: isPermanent ? bvn : undefined,
          isPermanent
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setMsg(`Created: ${j.bank_name} ${j.account_number} (permanent: ${j.is_permanent ? "yes" : "no"})`);
    } catch (e:any) {
      setErr(e.message);
    }
  };

  return (
    <div>
      <h1>Admin — Create Virtual Account</h1>
      <p style={{marginBottom:12}}>
        Paste the user's <b>UID</b>. For <b>permanent</b> accounts you must provide a valid BVN (sandbox test BVN or real BVN in production).
      </p>
      <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <input placeholder="User UID" value={uid} onChange={e => setUid(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="User Email (optional)" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8 }} />

        <label style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input type="checkbox" checked={isPermanent} onChange={e => setIsPermanent(e.target.checked)} />
          Permanent account (requires BVN)
        </label>

        {isPermanent && (
          <input placeholder="BVN (11 digits)" value={bvn} onChange={e => setBvn(e.target.value)} style={{ padding: 8 }} />
        )}

        <button onClick={createVA}>Create Virtual Account</button>
      </div>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
