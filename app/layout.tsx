export const metadata = { title: "EveBank", description: "Virtual accounts demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell" }}>
        <main style={{ maxWidth: 880, margin: "40px auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
