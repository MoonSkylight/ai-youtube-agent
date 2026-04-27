"use client";
import { useState } from "react";
export function MediaUploadForm({ scriptId }: { scriptId: string }) {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function handleSubmit(formData: FormData) {
    setLoading(true); setMessage("");
    try {
      formData.set("scriptId", scriptId);
      const response = await fetch("/api/media-assets/upload", { method: "POST", body: formData });
      const result = await response.json(); setMessage(result.ok ? "Asset uploaded." : result.error || "Failed."); if (result.ok) window.location.reload();
    } finally { setLoading(false); }
  }
  return <form action={handleSubmit} className="flex flex-wrap items-center gap-3 rounded-2xl border p-5 shadow-sm"><input type="hidden" name="assetType" value="video" /><input type="hidden" name="autoLinkVideo" value="true" /><input name="file" type="file" required className="text-sm" /><button disabled={loading} className="rounded-xl border px-4 py-2 text-sm">{loading ? "Uploading..." : "Upload asset"}</button>{message ? <span className="text-xs text-neutral-500">{message}</span> : null}</form>;
}
