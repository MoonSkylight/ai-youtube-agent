"use client";

import { useEffect, useMemo, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
};

type FeatureKey =
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [liveStatus, setLiveStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | "">("");

  useEffect(() => {
    async function loadScript() {
      try {
        setLoading(true);
        setLiveStatus("Loading script...");
        const resolvedParams = await params;
        const res = await fetch(`/api/get-script?id=${resolvedParams.id}`);
        const data = await res.json();

        if (data?.id) {
          setScript(data);
          setMessage("");
          setLiveStatus("Script loaded.");
        } else {
          setMessage("Script not found");
          setLiveStatus("Script not found.");
        }
      } catch (error: any) {
        setMessage(error.message || "Failed to load script");
        setLiveStatus("Failed to load script.");
      } finally {
        setLoading(false);
      }
    }

    loadScript();
  }, [params]);

  async function createVideo(mode: "adult" | "kids") {
    if (!script || busy) return;

    const feature = mode === "adult" ? "adult-video" : "kids-video";
    setSelectedFeature(feature);
    setBusy(true);
    setMessage("");
    setLiveStatus(
      mode === "adult"
        ? "Creating adult video in real time..."
        : "Creating kids video in real time..."
    );

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
        setLiveStatus("Video creation failed.");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setYoutubeUrl("");
        setLiveStatus("Video created successfully. Ready for upload.");
        window.open(data.videoUrl, "_blank");
      } else {
        setLiveStatus("Video finished but no URL was returned.");
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to create video");
      setLiveStatus("Video creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadToYouTube() {
    if (!script || !videoUrl || busy) {
      if (!videoUrl) {
        setMessage("Create a video first");
        setLiveStatus("Waiting for video before upload.");
      }
      return;
    }

    setSelectedFeature("youtube-upload");
    setBusy(true);
    setMessage("");
    setLiveStatus("Uploading video to YouTube in real time...");

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
        setLiveStatus("YouTube upload failed.");
        return;
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
        setLiveStatus("Uploaded to YouTube successfully.");
        window.open(data.youtubeUrl, "_blank");
      } else {
        setLiveStatus("Upload completed but no YouTube URL was returned.");
      }
    } catch (error: any) {
      setMessage(error.message || "Upload failed");
      setLiveStatus("YouTube upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function oneClickPublish(mode: "adult" | "kids") {
    if (!script || busy) return;

    const feature = mode === "adult" ? "adult-publish" : "kids-publish";
    setSelectedFeature(feature);
    setBusy(true);
    setMessage("");
    setLiveStatus(
      mode === "adult"
        ? "Writing script to final publish flow and creating adult video in real time..."
        : "Writing script to final publish flow and creating kids video in real time..."
    );

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
        setLiveStatus("One-click publish failed.");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
        setLiveStatus("One-click publish completed successfully.");
        window.open(data.youtubeUrl, "_blank");
      } else {
        setLiveStatus("Publish finished but YouTube URL was not returned.");
      }
    } catch (error: any) {
      setMessage(error.message || "One-click publish failed");
      setLiveStatus("One-click publish failed.");
    } finally {
      setBusy(false);
    }
  }

  const featureLabels = useMemo(
    () => ({
      "adult-publish": "🚀 One-Click Adult Publish",
      "kids-publish": "🧸 One-Click Kids Publish",
      "adult-video": "🎬 Create Adult Video",
      "kids-video": "🌈 Create Kids Video",
      "youtube-upload": "📤 Upload to YouTube",
    }),
    []
  );

  function buttonStyle(
    feature: FeatureKey,
    defaultBackground: string,
    defaultText = "#fff"
  ) {
    const active = selectedFeature === feature;

    return {
      background: active ? "#16a34a" : defaultBackground,
      color: active ? "#ffffff" : defaultText,
      padding: "12px 16px",
      borderRadius: 12,
      border: "none",
      cursor: busy ? "not-allowed" : "pointer",
      fontWeight: 700,
      opacity: busy && !active ? 0.7 : 1,
      transition: "all 0.2s ease",
      boxShadow: active ? "0 0 0 2px rgba(134,239,172,0.3)" : "none",
    } as const;
  }

  function buttonText(feature: FeatureKey) {
    if (busy && selectedFeature === feature) {
      return "⏳ Working...";
    }

    if (!busy && selectedFeature === feature) {
      return `✅ ${featureLabels[feature]}`;
    }

    return featureLabels[feature];
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
              disabled={busy}
              style={buttonStyle("adult-publish", "#dc2626")}
            >
              {buttonText("adult-publish")}
            </button>

            <button
              type="button"
              onClick={() => oneClickPublish("kids")}
              disabled={busy}
              style={buttonStyle("kids-publish", "#f59e0b", "#111827")}
            >
              {buttonText("kids-publish")}
            </button>

            <button
              type="button"
              onClick={() => createVideo("adult")}
              disabled={busy}
              style={buttonStyle("adult-video", "#7c3aed")}
            >
              {buttonText("adult-video")}
            </button>

            <button
              type="button"
              onClick={() => createVideo("kids")}
              disabled={busy}
              style={buttonStyle("kids-video", "#2563eb")}
            >
              {buttonText("kids-video")}
            </button>

            <button
              type="button"
              onClick={uploadToYouTube}
              disabled={busy || !videoUrl}
              style={{
                ...buttonStyle("youtube-upload", "#2563eb"),
                cursor: busy || !videoUrl ? "not-allowed" : "pointer",
                opacity: videoUrl ? 1 : 0.6,
              }}
            >
              {buttonText("youtube-upload")}
            </button>
          </div>

          <p style={{ marginTop: 14, marginBottom: 0, color: "#cbd5e1" }}>
            {liveStatus}
          </p>

          {videoUrl ? (
            <p style={{ marginTop: 10, marginBottom: 0, color: "#86efac" }}>
              Video ready for upload
            </p>
          ) : null}

          {youtubeUrl ? (
            <p style={{ marginTop: 8, marginBottom: 0, color: "#93c5fd" }}>
              YouTube published successfully
            </p>
          ) : null}

          {message ? (
            <p style={{ marginTop: 8, marginBottom: 0, color: "#fca5a5" }}>
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