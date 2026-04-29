"use client";

import { useState } from "react";

export default function UploadToYouTubeButton({
  scriptId,
}: {
  scriptId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/upload-to-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      setMessage("Upload completed");
      if (data.youtubeUrl) {
        window.open(data.youtubeUrl, "_blank");
      }
    } catch (error: any) {
      setMessage(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid #2563eb",
          background: "#2563eb",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {loading ? "Uploading..." : "Upload to YouTube"}
      </button>

      {message ? (
        <p
          style={{
            marginTop: 10,
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