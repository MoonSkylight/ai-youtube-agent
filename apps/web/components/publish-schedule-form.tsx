"use client";
import { useState } from "react";
export function PublishScheduleForm({ publishJobId, currentValue }: { publishJobId: string; currentValue?: string | null }) {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function handleSubmit(formData: FormData) {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/publish-jobs/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publishJobId, scheduledFor: String(formData.get("scheduledFor") || "") }) });
      const result = await response.json(); setMessage(result.ok ? "Schedule updated." : result.error || "Failed."); if (result.ok) window.location.reload();
    } finally { setLoading(false); }
  }
  return <form action={handleSubmit} className="flex flex-wrap items-center gap-3"><input name="scheduledFor" type="datetime-local" defaultValue={currentValue ? currentValue.slice(0,16) : ""} className="rounded-xl border px-3 py-2 text-sm" /><button disabled={loading} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Saving..." : "Save schedule"}</button>{message ? <span className="text-xs text-neutral-500">{message}</span> : null}</form>;
}
