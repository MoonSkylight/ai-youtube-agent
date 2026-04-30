"use client";

import { useState } from "react";

export default function CreateVideoButtons({
  scriptId,
}: {
  scriptId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createVideo(mode: "adult" | "kids") {
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
          mode,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Failed");
        return;
      }

      window.open(data.videoUrl, "_blank");
    } catch (err: any) {
      setMessage(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
      <button
        onClick={() => createVideo("adult")}
        disabled={loading}
        style={{
          background: "#7c3aed",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
        }}
      >
        🎬 Create Adult Video
      </button>

      <button
        onClick={() => createVideo("kids")}
        disabled={loading}
        style={{
          background: "#22c55e",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
        }}
      >
        🧸 Create Kids Video
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}