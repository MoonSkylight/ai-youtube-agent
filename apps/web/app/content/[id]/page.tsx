"use client";

import { useEffect, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
};

type ActionKey =
  | ""
  | "adult-publish"
  | "kids-publish"
  | "adult-video"
  | "kids-video"
  | "youtube-upload";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [script, setScript] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionKey>("");

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
    if (!script) return;

    setVideoLoading(true);
    setMessage("Creating video...");

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

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        window.open(data.videoUrl, "_blank");
      }

      setSelectedAction(mode === "adult" ? "adult-video" : "kids-video");
      setMessage("Video created successfully");
    } catch (error: any) {
      setMessage(error.message || "Failed to create video");
    } finally {
      setVideoLoading(false);
    }
  }

  async function uploadToYouTube() {
    if (!script || !videoUrl) {
      setMessage("Create a video first");
      return;
    }

    setVideoLoading(true);
    setMessage("Uploading to YouTube...");

    try {
      const res = await fetch("/api/upload-to-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          videoUrl,
          title: script.title,
          description: script.script_body,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
        window.open(data.youtubeUrl, "_blank");
      }

      setSelectedAction("youtube-upload");
      setMessage("Upload completed successfully");
    } catch (error: any) {
      setMessage(error.message || "Upload failed");
    } finally {
      setVideoLoading(false);
    }
  }

  async function oneClickPublish(mode: "adult" | "kids") {
    if (!script) return;

    setVideoLoading(true);
    setMessage("Creating video and uploading to YouTube...");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          mode,
          title: script.title,
          description: script.script_body,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || "One-click publish failed");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
        window.open(data.youtubeUrl, "_blank");
      }

      setSelectedAction(mode === "adult" ? "adult-publish" : "kids-publish");
      setMessage("One-click publish completed successfully");
    } catch (error: any) {
      setMessage(error.message || "One-click publish failed");
    } finally {
      setVideoLoading(false);
    }
  }

  function getButtonLabel(action: ActionKey, defaultLabel: string) {
    if (videoLoading && selectedAction === action) {
      return "Working...";
    }

    if (selectedAction === action) {
      return "✅ Done";
    }

    return defaultLabel;
  }

  function getButtonColor(action: ActionKey, defaultColor: string) {
    return selectedAction === action ? "#16a34a" : defaultColor;
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

        <h1 style={{ marginTop: 0, marginBottom: 16 }}>{script.title}</h1>

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
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => oneClickPublish("adult")}
              disabled={videoLoading}
              style={{
                background: getButtonColor("adult-publish", "#dc2626"),
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {getButtonLabel("adult-publish", "🚀 One-Click Adult Publish")}
            </button>

            <button
              type="button"
              onClick={() => oneClickPublish("kids")}
              disabled={videoLoading}
              style={{
                background: getButtonColor("kids-publish", "#f59e0b"),
                color: selectedAction === "kids-publish" ? "#fff" : "#111827",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {getButtonLabel("kids-publish", "🧸 One-Click Kids Publish")}
            </button>

            <button
              type="button"
              onClick={() => createVideo("adult")}
              disabled={videoLoading}
              style={{
                background: getButtonColor("adult-video", "#7c3aed"),
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {getButtonLabel("adult-video", "🎬 Create Adult Video")}
            </button>

            <button
              type="button"
              onClick={() => createVideo("kids")}
              disabled={videoLoading}
              style={{
                background: getButtonColor("kids-video", "#22c55e"),
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {getButtonLabel("kids-video", "🧸 Create Kids Video")}
            </button>

            <button
              type="button"
              onClick={uploadToYouTube}
              disabled={videoLoading || !videoUrl}
              style={{
                background: getButtonColor("youtube-upload", "#2563eb"),
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                cursor: videoLoading || !videoUrl ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: videoUrl ? 1 : 0.6,
              }}
            >
              {getButtonLabel("youtube-upload", "📤 Upload to YouTube")}
            </button>
          </div>

          {videoUrl ? (
            <p style={{ marginTop: 12, marginBottom: 0, color: "#86efac" }}>
              Video ready for upload
            </p>
          ) : null}

          {youtubeUrl ? (
            <p style={{ marginTop: 8, marginBottom: 0, color: "#93c5fd" }}>
              YouTube published successfully
            </p>
          ) : null}

          {message ? (
            <p style={{ marginTop: 8, marginBottom: 0, color: "#cbd5e1" }}>
              {message}
            </p>
          ) : null}
        </div>

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
          {script.script_body}
        </div>
      </div>
    </div>
  );
}