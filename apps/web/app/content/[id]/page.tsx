"use client";

import { useEffect, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
};

async function parseJsonResponse(res: Response) {
  const rawText = await res.text();

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error(rawText.slice(0, 300) || "Non-JSON response received");
  }
}

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

  useEffect(() => {
    async function loadScript() {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/get-script?id=${resolvedParams.id}`, {
          headers: {
            Accept: "application/json",
          },
        });

        const data = await parseJsonResponse(res);

        if (!res.ok) {
          setMessage(data?.error || "Failed to load script");
          return;
        }

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
          Accept: "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          mode,
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Failed to create video");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
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
          Accept: "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          videoUrl,
          title: script.title,
          description: script.script_body,
        }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || !data.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
        window.open(data.youtubeUrl, "_blank");
      }

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
          Accept: "application/json",
        },
        body: JSON.stringify({
          scriptId: script.id,
          mode,
          title: script.title,
          description: script.script_body,
        }),
      });

      const data = await parseJsonResponse(res);

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

      setMessage("One-click publish completed successfully");
    } catch (error: any) {
      setMessage(error.message || "One-click publish failed");
    } finally {
      setVideoLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#fff", background: "#111827", minHeight: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (!script) {
    return (
      <div style={{ padding: 24, color: "#fff", background: "#111827", minHeight: "100vh" }}>
        {message || "Script not found"}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <a
        href="/content"
        style={{
          color: "#93c5fd",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        ← Back to Dashboard
      </a>

      <h1 style={{ fontSize: 32, marginBottom: 20 }}>{script.title}</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <button
          onClick={() => oneClickPublish("adult")}
          disabled={videoLoading}
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {videoLoading ? "Working..." : "🚀 One-Click Adult Publish"}
        </button>

        <button
          onClick={() => oneClickPublish("kids")}
          disabled={videoLoading}
          style={{
            background: "#f59e0b",
            color: "#111827",
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {videoLoading ? "Working..." : "🧸 One-Click Kids Publish"}
        </button>

        <button
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
          🎬 Create Adult Video
        </button>

        <button
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
          🌈 Create Kids Video
        </button>

        <button
          onClick={uploadToYouTube}
          disabled={videoLoading}
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
      </div>

      {videoUrl ? (
        <div
          style={{
            background: "#14532d",
            color: "#dcfce7",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          Video ready for upload
        </div>
      ) : null}

      {youtubeUrl ? (
        <div
          style={{
            background: "#1e3a8a",
            color: "#dbeafe",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          YouTube published successfully
        </div>
      ) : null}

      {message ? (
        <div
          style={{
            background: "#374151",
            color: "#fff",
            padding: 12,
            borderRadius: 10,
            marginBottom: 20,
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      ) : null}

      <div
        style={{
          background: "#1f2937",
          padding: 20,
          borderRadius: 12,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {script.script_body}
      </div>
    </div>
  );
}