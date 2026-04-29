"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.ok) {
      window.location.href = "/content";
    } else {
      alert(data.error);
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        background: "#111827",
        padding: 24,
        borderRadius: 16,
      }}
    >
      <h1>Login</h1>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}