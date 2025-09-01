"use client";

import { useState } from "react";

export default function AdminPage() {
  const [uid, setUid] = useState("");
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
        body: JSON.stringify({ uid })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setMsg(`Created: ${j.bank_name} ${j.account_number}`);
    } catch (e:any) {
      setErr(e.message);
    }
  };

  return (
    <div>
      <h1>Admin - Create Virtual Account</h1>
      <p>Paste the user's <b>UID</b> and click create. This route is protected by a secret header.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="User UID" value={uid} onChange={e => setUid(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button onClick={createVA}>Create</button>
      </div>
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
