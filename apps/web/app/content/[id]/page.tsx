"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ScriptData = {
  id: string;
  title: string;
  script_body: string;
  video_url?: string | null;
  youtube_url?: string | null;
  publish_status?: string | null;
};

function getStatusClass(status: string | null | undefined) {
  if (status === "published") return "status-published";
  if (status === "rendered") return "status-rendered";
  return "status-draft";
}

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
          setVideoUrl(data.video_url || "");
          setYoutubeUrl(data.youtube_url || "");
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

  async function refreshScript() {
    if (!script?.id) return;

    try {
      const res = await fetch(`/api/get-script?id=${script.id}`);
      const data = await res.json();

      if (data?.id) {
        setScript(data);
        setVideoUrl(data.video_url || "");
        setYoutubeUrl(data.youtube_url || "");
      }
    } catch {}
  }

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

      await refreshScript();
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

      await refreshScript();
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

      await refreshScript();
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
      <main className="studio-shell">
        <div className="studio-card">
          <div className="notice notice-info">Loading workspace...</div>
        </div>
      </main>
    );
  }

  if (!script) {
    return (
      <main className="studio-shell">
        <div className="studio-card">
          <div className="stack">
            <Link href="/content" className="ui-btn ui-btn-secondary">
              Back to Dashboard
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
    <main className="studio-shell">
      <header className="studio-header">
        <div className="hero-copy">
          <div className="studio-kicker">Project Workspace</div>
          <h1 className="studio-title">{script.title}</h1>
          <p className="studio-subtitle">
            Review the script, render video output, and publish directly to
            YouTube.
          </p>
        </div>

        <div className="studio-header-actions">
          <div className={`status-badge ${getStatusClass(script.publish_status)}`}>
            {(script.publish_status || "draft").toUpperCase()}
          </div>

          <Link href="/content" className="ui-btn ui-btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="studio-grid">
        <div className="studio-main">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Script</span>
              <h2>Story content</h2>
              <p>Review the saved script before generating or publishing.</p>
            </div>

            <textarea value={script.script_body || ""} readOnly />
          </div>
        </div>

        <aside className="studio-side">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Actions</span>
              <h2>Production controls</h2>
            </div>

            <div className="stack">
              <button
                className="ui-btn btn-danger"
                onClick={() => oneClickPublish("adult")}
                disabled={working}
              >
                {working ? "Working..." : "One-Click Adult Publish"}
              </button>

              <button
                className="ui-btn btn-warning"
                onClick={() => oneClickPublish("kids")}
                disabled={working}
              >
                {working ? "Working..." : "One-Click Kids Publish"}
              </button>

              <button
                className="ui-btn ui-btn-primary"
                onClick={() => createVideo("adult")}
                disabled={working}
              >
                Create Adult Video
              </button>

              <button
                className="ui-btn btn-success"
                onClick={() => createVideo("kids")}
                disabled={working}
              >
                Create Kids Video
              </button>

              <button
                className="ui-btn ui-btn-secondary"
                onClick={uploadToYouTube}
                disabled={working}
              >
                Upload to YouTube
              </button>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Status</span>
              <h2>Project output</h2>
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
            ) : (
              <div className="notice notice-info">
                No active task. Choose a production action to continue.
              </div>
            )}

            <div className="summary-list" style={{ marginTop: 16 }}>
              <div>
                <span>Generated video</span>
                <strong>{videoUrl ? "Available" : "Waiting"}</strong>
              </div>
              <div>
                <span>YouTube link</span>
                <strong>{youtubeUrl ? "Published" : "Waiting"}</strong>
              </div>
            </div>

            {videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="output-link"
              >
                Open generated video
              </a>
            ) : null}

            {youtubeUrl ? (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="output-link"
              >
                Open YouTube video
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}