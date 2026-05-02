"use client";

import Link from "next/link";
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
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "info" | "success" | "warning" | "danger"
  >("info");
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    async function loadScript() {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/get-script?id=${resolvedParams.id}`);
        const data = await res.json();

        if (data?.id) {
          setScript(data);
          setMessage("");
        } else {
          setMessageType("danger");
          setMessage("Script not found.");
        }
      } catch (error: any) {
        setMessageType("danger");
        setMessage(error?.message || "Failed to load script.");
      } finally {
        setLoading(false);
      }
    }

    loadScript();
  }, [params]);

  async function createVideo(mode: "adult" | "kids") {
    if (!script) return;

    setWorking(true);
    setMessageType("info");
    setMessage(`Creating ${mode} video...`);

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
        setMessageType("danger");
        setMessage(data.error || "Failed to create video.");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      setMessageType("success");
      setMessage("Video created successfully.");
    } catch (error: any) {
      setMessageType("danger");
      setMessage(error?.message || "Failed to create video.");
    } finally {
      setWorking(false);
    }
  }

  async function uploadToYouTube() {
    if (!script || !videoUrl) {
      setMessageType("warning");
      setMessage("Create a video first.");
      return;
    }

    setWorking(true);
    setMessageType("info");
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
        setMessageType("danger");
        setMessage(data.error || "Upload failed.");
        return;
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
      }

      setMessageType("success");
      setMessage("Upload completed successfully.");
    } catch (error: any) {
      setMessageType("danger");
      setMessage(error?.message || "Upload failed.");
    } finally {
      setWorking(false);
    }
  }

  async function oneClickPublish(mode: "adult" | "kids") {
    if (!script) return;

    setWorking(true);
    setMessageType("info");
    setMessage(`Creating and publishing ${mode} video...`);

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
        setMessageType("danger");
        setMessage(data.error || "One-click publish failed.");
        return;
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      if (data.youtubeUrl) {
        setYoutubeUrl(data.youtubeUrl);
      }

      setMessageType("success");
      setMessage("One-click publish completed successfully.");
    } catch (error: any) {
      setMessageType("danger");
      setMessage(error?.message || "One-click publish failed.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <div className="card">
          <div className="card-body">
            <div className="notice notice-info">Loading script...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!script) {
    return (
      <main className="app-shell">
        <div className="card">
          <div className="card-body stack">
            <Link href="/content" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
            <div className="notice notice-danger">
              {message || "Script not found."}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="badge-top">AI YouTube Agent</span>
          <h1 className="page-title">{script.title}</h1>
          <p className="page-subtitle">
            Generate, review, and publish this script.
          </p>
        </div>

        <div className="actions">
          <Link href="/content" className="btn btn-secondary">
            ← Back
          </Link>
        </div>
      </div>

      <section className="grid grid-2">
        <div className="card">
          <div className="card-body stack">
            <div>
              <h2 className="card-title">Script Content</h2>
              <p className="card-muted">
                Review the script before generating the video.
              </p>
            </div>

            <textarea value={script.script_body || ""} readOnly />
          </div>
        </div>

        <div className="card">
          <div className="card-body stack">
            <div>
              <h2 className="card-title">Publishing Actions</h2>
              <p className="card-muted">
                Choose a workflow for video generation and publishing.
              </p>
            </div>

            <div className="actions">
              <button
                className="btn btn-danger"
                onClick={() => oneClickPublish("adult")}
                disabled={working}
              >
                {working ? "Working..." : "🚀 One-Click Adult Publish"}
              </button>

              <button
                className="btn btn-warning"
                onClick={() => oneClickPublish("kids")}
                disabled={working}
              >
                {working ? "Working..." : "🧸 One-Click Kids Publish"}
              </button>

              <button
                className="btn btn-primary"
                onClick={() => createVideo("adult")}
                disabled={working}
              >
                🎬 Create Adult Video
              </button>

              <button
                className="btn btn-success"
                onClick={() => createVideo("kids")}
                disabled={working}
              >
                🧸 Create Kids Video
              </button>

              <button
                className="btn btn-secondary"
                onClick={uploadToYouTube}
                disabled={working}
              >
                📤 Upload to YouTube
              </button>
            </div>

            {message ? (
              <div
                className={`notice ${
                  messageType === "success"
                    ? "notice-success"
                    : messageType === "warning"
                    ? "notice-warning"
                    : messageType === "danger"
                    ? "notice-danger"
                    : "notice-info"
                }`}
              >
                {message}
              </div>
            ) : null}

            {videoUrl ? (
              <div className="notice notice-success">
                Video ready:{" "}
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-text"
                >
                  Open generated video
                </a>
              </div>
            ) : null}

            {youtubeUrl ? (
              <div className="notice notice-success">
                YouTube published:{" "}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-text"
                >
                  Open YouTube video
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}