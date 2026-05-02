"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        window.location.href = "/content";
        return;
      }

      setMessage(data.error || "Login failed.");
    } catch (error: any) {
      setMessage(error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-grid">
        <div className="login-hero studio-card">
          <div>
            <div className="studio-kicker">AI YouTube Agent</div>
            <h1 className="studio-title">
              Run your story pipeline from one workspace
            </h1>
            <p className="studio-subtitle">
              Generate scripts, build videos, and publish to YouTube with a
              cleaner production dashboard.
            </p>
          </div>

          <div className="login-feature-list">
            <div className="pipeline-item">
              <span className="pipeline-dot">1</span>
              <div>
                <strong>Write and organize scripts</strong>
                <p>
                  Keep story ideas, scripts, and publishing state in one place.
                </p>
              </div>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-dot">2</span>
              <div>
                <strong>Render and review videos</strong>
                <p>Track generated output before sending it live.</p>
              </div>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-dot">3</span>
              <div>
                <strong>Publish directly to YouTube</strong>
                <p>
                  Manage your production flow without jumping between tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-panel studio-card">
          <div className="section-head">
            <span className="section-label">Login</span>
            <h2>Welcome back</h2>
            <p>Sign in to open your AI video workspace.</p>
          </div>

          <div className="form-stack" style={{ marginTop: 20 }}>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message ? (
              <div className="notice notice-danger">{message}</div>
            ) : null}

            <button
              className="ui-btn ui-btn-primary login-submit"
              onClick={handleLogin}
              disabled={loading}
              type="button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="login-footer-links">
              <Link href="/" className="text-link">
                Back to home
              </Link>
              <span className="footer-sep">•</span>
              <Link href="/content" className="text-link">
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}