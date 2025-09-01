"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => { sub.subscription.unsubscribe(); }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!session) return;
      try {
        const user = session.user;
        await fetch("/api/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.id, email: user.email, name: user.user_metadata?.name || null })
        });
        const r = await fetch("/api/me", { headers: { Authorization: `Bearer ${session.access_token}` }});
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to load profile");
        setMe(j);
      } catch (e:any) {
        setError(e.message);
      }
    };
    bootstrap();
  }, [session]);

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return (
      <div>
        <h1>EveBank</h1>
        <p>Sign in to get your dashboard.</p>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
      </div>
    );
  }

  return (
    <div>
      <h1>EveBank Dashboard</h1>
      <p>
        Signed in as <b>{session.user.email}</b>{" "}
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {me ? (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <h3>Your Profile</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(me.user, null, 2)}</pre>
          </section>

          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <h3>Virtual Accounts</h3>
            {me.virtual_accounts?.length ? (
              <ul>
                {me.virtual_accounts.map((v:any) => (
                  <li key={v.id}>
                    <b>{v.bank_name}</b> — <code>{v.account_number}</code> ({v.currency})
                  </li>
                ))}
              </ul>
            ) : <p>No virtual account yet. Ask admin to create one.</p>}
          </section>

          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <h3>Balances</h3>
            {me.balances?.length ? (
              <ul>
                {me.balances.map((b:any) => (
                  <li key={b.currency}><b>{b.currency}:</b> {b.amount}</li>
                ))}
              </ul>
            ) : <p>0.00</p>}
          </section>

          <section style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <h3>Admin</h3>
            <p>Open <a href="/admin" target="_blank">/admin</a> to approve KYC & create a Virtual Account for a user.</p>
          </section>
        </div>
      ) : <p>Loading dashboard…</p>}
    </div>
  );
}
