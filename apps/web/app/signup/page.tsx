"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.ok) {
      alert("Account created. Now login.");
      window.location.href = "/login";
    } else {
      alert(data.error);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h1>Create Account</h1>

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

        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}