"use client";

import { useState } from "react";

type Props = { publishJobId: string; platform: "youtube" | "tiktok"; status: string; };

export function PublishJobActions({ publishJobId, platform, status }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function handlePublish() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/publish/${platform}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publishJobId }) });
      const result = await response.json();
      setMessage(result.ok ? "Published." : result.error || "Failed.");
      if (result.ok) window.location.reload();
    } finally { setLoading(false); }
  }
  if (status === "posted") return <span className="text-xs text-neutral-500">Already posted</span>;
  return <div className="flex items-center gap-3"><button disabled={loading} onClick={handlePublish} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Publishing..." : `Publish to ${platform}`}</button>{message ? <span className="text-xs text-neutral-500">{message}</span> : null}</div>;
}
