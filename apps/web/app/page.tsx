"use client";

import { useState } from "react";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"adult" | "kids">("adult");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    if (!title.trim() || !prompt.trim()) {
      setMessage("Please enter a title and prompt.");
      return;
    }

    setLoading(true);
    setMessage("Generating script...");

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          prompt,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to generate script");
        return;
      }

      setMessage("Script created successfully.");

      if (data.id) {
        window.location.href = `/content/${data.id}`;
        return;
      }

      window.location.href = "/content";
    } catch (error: any) {
      setMessage(error.message || "Failed to generate script");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 840,
          background: "rgba(15, 23, 42, 0.88)",
          border: "1px solid #1f2937",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(37,99,235,0.12)",
              color: "#93c5fd",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            AI YouTube Agent
          </div>

          <h1
            style={{
              margin: "0 0 12px 0",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Write a script and turn it into a video.
          </h1>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 640,
            }}
          >
            Create story scripts for YouTube, open the generated result, and
            continue to video rendering and publishing.
          </p>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Video title
            </label>
            <input
              type="text"
              placeholder="Example: The Lost City in the Clouds"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Prompt
            </label>
            <textarea
              placeholder="Describe the story, theme, audience, tone, and what the script should include..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                minHeight: 220,
                resize: "vertical",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #334155",
                background: "#020617",
                color: "white",
                width: "100%",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Video mode
            </label>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setMode("adult")}
                style={{
                  background: mode === "adult" ? "#16a34a" : "#1e293b",
                  color: "#fff",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 700,
                }}
              >
                Adult
              </button>

              <button
                type="button"
                onClick={() => setMode("kids")}
                style={{
                  background: mode === "kids" ? "#16a34a" : "#1e293b",
                  color: "#fff",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 700,
                }}
              >
                Kids
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "14px 18px",
                borderRadius: 12,
                border: "none",
                fontWeight: 800,
              }}
            >
              {loading ? "Generating..." : "Generate Script"}
            </button>

            <a
              href="/content"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 18px",
                borderRadius: 12,
                background: "#1e293b",
                color: "#e2e8f0",
                fontWeight: 700,
              }}
            >
              Open Dashboard
            </a>
          </div>

          {message ? (
            <p style={{ margin: 0, color: "#cbd5e1" }}>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}