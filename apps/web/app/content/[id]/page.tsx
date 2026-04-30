"use client";

import { useEffect, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
};

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [script, setScript] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    async function loadScript() {
      const resolvedParams = await params;
      const res = await fetch(`/api/get-script?id=${resolvedParams.id}`);
      const data = await res.json();
      setScript(data);
      setLoading(false);
    }

    loadScript();
  }, [params]);

  async function createVideo(mode: "adult" | "kids") {
    if (!script) return;

    setVideoLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId: script.id, mode }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to create video");
        return;
      }

      if (data.videoUrl) {
        window.open(data.videoUrl, "_blank");
      }

      if (data.images) {
        setImages(data.images);
      }

      setMessage("Done successfully");
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setVideoLoading(false);
    }
  }

  async function uploadToYouTube() {
    if (!script) return;

    setMessage("Uploading...");

    try {
      const res = await fetch("/api/upload-to-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId: script.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      if (data.youtubeUrl) {
        window.open(data.youtubeUrl, "_blank");
      }

      setMessage("Upload complete");
    } catch (error: any) {
      setMessage(error.message || "Upload failed");
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b1020",
          color: "#fff",
          padding: 40,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#fff",
        padding: 40,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <a
          href="/content"
          style={{
            color: "#93c5fd",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← Back to Dashboard
        </a>

        <h1 style={{ marginTop: 0, marginBottom: 16 }}>{script?.title}</h1>

        {/* STICKY ACTION BAR */}
        <div
          style={{
            position: "sticky",
            top: 16,
            zIndex: 50,
            background: "rgba(11,16,32,0.92)",
            backdropFilter: "blur(10px)",
            padding: 16,
            borderRadius: 16,
            border: "1px solid #1f2937",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => createVideo("adult")}
              disabled={videoLoading}
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
              {videoLoading ? "Creating..." : "🎬 Create Adult Video"}
            </button>

            <button
              type="button"
              onClick={() => createVideo("kids")}
              disabled={videoLoading}
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
              {videoLoading ? "Creating..." : "🧸 Create Kids Video"}
            </button>

            <button
              type="button"
              onClick={uploadToYouTube}
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              📤 Upload to YouTube
            </button>

            <button
              type="button"
              onClick={() => createVideo("adult")}
              style={{
                background: "#9333ea",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🎨 Generate Adult Scenes
            </button>

            <button
              type="button"
              onClick={() => createVideo("kids")}
              style={{
                background: "#16a34a",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🎨 Generate Kids Scenes
            </button>
          </div>

          {message ? (
            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: "#93c5fd",
                fontSize: 14,
              }}
            >
              {message}
            </p>
          ) : null}
        </div>

        {/* SCRIPT */}
        <div
          style={{
            background: "#111827",
            padding: 24,
            borderRadius: 16,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            color: "#e5e7eb",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {script?.script_body}
        </div>

        {/* IMAGES */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                style={{
                  background: "#111827",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                <img
                  src={img}
                  alt={`Scene ${i + 1}`}
                  style={{
                    width: "100%",
                    display: "block",
                  }}
                />
                <div style={{ padding: 12, color: "#cbd5e1" }}>
                  Scene {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}