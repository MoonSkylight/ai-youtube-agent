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

    const res = await fetch("/api/render-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scriptId: script.id, mode }),
    });

    const data = await res.json();

    if (data.videoUrl) {
      window.open(data.videoUrl, "_blank");
    }

    if (data.images) {
      setImages(data.images);
    }

    setVideoLoading(false);
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

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
        <h1>{script?.title}</h1>

        {/* 🚀 BUTTONS MOVED TO TOP */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <button onClick={() => createVideo("adult")}>
            🎬 Create Adult Video
          </button>

          <button onClick={() => createVideo("kids")}>
            🧸 Create Kids Video
          </button>

          <button>📤 Upload to YouTube</button>

          <button onClick={() => createVideo("adult")}>
            🎨 Generate Adult Scenes
          </button>

          <button onClick={() => createVideo("kids")}>
            🎨 Generate Kids Scenes
          </button>
        </div>

        {message && <p>{message}</p>}

        {/* SCRIPT */}
        <div
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 12,
            lineHeight: 1.7,
          }}
        >
          {script?.script_body}
        </div>

        {/* IMAGES */}
        {images.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                style={{ width: "100%", marginBottom: 10 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}