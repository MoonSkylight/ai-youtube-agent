import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
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
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <a href="/content" className="app-brand">
                <span className="app-brand-dot" />
                <span>AI YouTube Agent</span>
              </a>

              <nav className="app-nav">
                <a href="/content" className="app-nav-link">
                  Dashboard
                </a>
                <a href="/" className="app-nav-link">
                  New Script
                </a>
                <a href="/login" className="app-nav-link">
                  Login
                </a>
              </nav>
            </div>
          </header>

          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}