"use client";

import { useState } from "react";

export default function CreateVideoButton({ scriptId }: { scriptId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Render failed");
        return;
      }

      setMessage("Video ready: " + data.videoUrl);
      window.open(data.videoUrl, "_blank");
    } catch (error: any) {
      setMessage(error.message || "Render failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "Rendering..." : "Create Video"}
      </button>

      {message ? (
        <p style={{ marginTop: 12, color: "red" }}>{message}</p>
      ) : null}
    </div>
  );
}