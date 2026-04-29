import "./globals.css";

export const metadata = {
  title: "AI YouTube Agent",
  description: "Generate scripts, videos and upload to YouTube",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b1020",
          color: "#f8fafc",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <header
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #1f2937",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>🚀 AI YouTube Agent</h2>

          <nav style={{ display: "flex", gap: 16 }}>
            <a href="/content" style={{ color: "#93c5fd" }}>
              Dashboard
            </a>
            <a href="/login" style={{ color: "#93c5fd" }}>
              Login
            </a>
          </nav>
        </header>

        <div style={{ padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}