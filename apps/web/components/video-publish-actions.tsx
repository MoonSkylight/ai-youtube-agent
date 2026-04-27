"use client";
import { useState } from "react";
export function VideoPublishActions({ videoId, platform }: { videoId: string; platform: "youtube" | "tiktok"; }) {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function requestPublish() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/publish-jobs/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId, platform }) });
      const result = await response.json(); setMessage(result.ok ? "Approval requested." : result.error || "Failed."); if (result.ok) window.location.reload();
    } finally { setLoading(false); }
  }
  return <div className="flex items-center gap-3"><button disabled={loading} onClick={requestPublish} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Requesting..." : `Request ${platform} publish`}</button>{message ? <span className="text-xs text-neutral-500">{message}</span> : null}</div>;
}
