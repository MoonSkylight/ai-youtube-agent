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

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to create video");
        return;
      }

      setMessage("Video created successfully");

      if (data.videoUrl) {
        window.open(data.videoUrl, "_blank");
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to create video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => createVideo("adult")}
        disabled={loading}
        style={{
          background: "#7c3aed",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Creating..." : "Create Adult Video"}
      </button>

      <button
        type="button"
        onClick={() => createVideo("kids")}
        disabled={loading}
        style={{
          background: "#22c55e",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Creating..." : "Create Kids Video"}
      </button>

      {message ? (
        <p
          style={{
            width: "100%",
            marginTop: 8,
            marginBottom: 0,
            color: "#93c5fd",
            fontSize: 14,
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}