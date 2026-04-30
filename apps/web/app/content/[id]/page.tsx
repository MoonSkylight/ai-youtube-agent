"use client";

import { useEffect, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
  created_at?: string;
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
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    async function loadScript() {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/get-script?id=${resolvedParams.id}`);
        const data = await res.json();

        if (data?.id) {
          setScript(data);
        } else {
          setMessage("Script not found");
        }
      } catch (error: any) {
        setMessage(error.message || "Failed to load script");
      } finally {
        setLoading(false);
      }
    }

    loadScript();
  }, [params]);

  async function createVideo(mode: "adult" | "kids") {
    if (!script?.id) return;

    setVideoLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to create video");
        return;
      }

      if (data.images) {
        setImages(data.images);
      }

      if (data.videoUrl) {
        window.open(data.videoUrl, "_blank");
      }

      setMessage("Video created successfully");
    } catch (error: any) {
      setMessage(error.message || "Failed to create video");
    } finally {
      setVideoLoading(false);
    }
  }

  async function uploadToYouTube() {
    if (!script?.id) return;

    setUploadLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/upload-to-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      if (data.youtubeUrl) {
        window.open(data.youtubeUrl, "_blank");
      }

      setMessage("Upload completed");
    } catch (error: any) {
      setMessage(error.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleGenerateScenes(mode: "adult" | "kids") {
    if (!script?.id) return;

    setMessage("Generating scenes...");

    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to generate scenes");
        return;
      }

      setImages(data.images || []);
      setMessage("Scenes generated successfully");
    } catch (error: any) {
      setMessage(error.message || "Failed to generate scenes");
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

  if (!script) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b1020",
          color: "#fff",
          padding: 40,
        }}
      >
        {message || "Script not found"}
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

        <div
          style={{
            background: "#111827",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            marginBottom: 24,
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 32 }}>{script.title}</h1>
          <p style={{ color: "#94a3b8", marginBottom: 24 }}>
            Story / script workspace
          </p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              fontSize: 16,
              color: "#e5e7eb",
              background: "#0f172a",
              borderRadius: 16,
              padding: 20,
            }}
          >
            {script.script_body}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 20,
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
              {videoLoading ? "Creating..." : "Create Adult Video"}
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
              {videoLoading ? "Creating..." : "Create Kids Video"}
            </button>

            <button
              type="button"
              onClick={uploadToYouTube}
              disabled={uploadLoading}
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
              {uploadLoading ? "Uploading..." : "Upload to YouTube"}
            </button>

            <button
              type="button"
              onClick={() => handleGenerateScenes("adult")}
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
              Generate Adult Scenes
            </button>

            <button
              type="button"
              onClick={() => handleGenerateScenes("kids")}
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
              Generate Kids Scenes
            </button>
          </div>

          {message ? (
            <p style={{ marginTop: 16, color: "#93c5fd" }}>{message}</p>
          ) : null}
        </div>

        {images.length > 0 ? (
          <div
            style={{
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
        ) : null}
      </div>
    </div>
  );
}