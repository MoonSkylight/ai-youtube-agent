"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DashboardActionsProps = {
  scriptId: string;
  hasVideo: boolean;
  hasYoutube: boolean;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
};

export default function DashboardActions({
  scriptId,
  hasVideo,
  hasYoutube,
  videoUrl,
  youtubeUrl,
}: DashboardActionsProps) {
  const router = useRouter();
  const [working, setWorking] = useState(false);

  function openWorkspace() {
    router.push(`/content/${scriptId}`);
  }

  function openVideo() {
    if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  }

  function openYoutube() {
    if (youtubeUrl) {
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function quickGenerate() {
    setWorking(true);

    try {
      router.push(`/content/${scriptId}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="actions" style={{ marginTop: 14 }}>
      <button
        type="button"
        className="ui-btn ui-btn-primary"
        onClick={openWorkspace}
        disabled={working}
      >
        Open Workspace
      </button>

      {!hasYoutube && hasVideo ? (
        <button
          type="button"
          className="ui-btn ui-btn-secondary"
          onClick={openVideo}
          disabled={working}
        >
          Preview Video
        </button>
      ) : null}

      {hasYoutube ? (
        <button
          type="button"
          className="ui-btn ui-btn-secondary"
          onClick={openYoutube}
          disabled={working}
        >
          Watch on YouTube
        </button>
      ) : null}

      <button
        type="button"
        className="ui-btn ui-btn-secondary"
        onClick={quickGenerate}
        disabled={working}
      >
        {working ? "Opening..." : "Generate Now"}
      </button>
    </div>
  );
}