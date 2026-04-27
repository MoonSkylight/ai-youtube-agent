"use client";

import { useState } from "react";

export function RoutineActions() {
  const [loading, setLoading] = useState<null | "start" | "end">(null);
  const [message, setMessage] = useState("");

  async function runAction(kind: "start" | "end") {
    setLoading(kind);
    setMessage("");
    try {
      const response = await fetch(kind === "start" ? "/api/routine/start-day" : "/api/routine/end-day", { method: "POST" });
      const result = await response.json();
      setMessage(result.ok ? `${kind === "start" ? "Day started" : "Day ended"}.` : result.error || "Failed.");
      if (result.ok) window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  return <div className="flex flex-wrap items-center gap-4 rounded-2xl border p-5 shadow-sm"><button onClick={() => runAction("start")} disabled={loading !== null} className="rounded-xl border px-4 py-3 font-medium">{loading === "start" ? "Starting..." : "Start day"}</button><button onClick={() => runAction("end")} disabled={loading !== null} className="rounded-xl border px-4 py-3 font-medium">{loading === "end" ? "Closing..." : "End day"}</button>{message ? <span className="text-sm text-neutral-500">{message}</span> : null}</div>;
}
