"use client";
import { useState } from "react";
export function PublishRetryButton({ publishJobId }: { publishJobId: string }) { const [loading, setLoading] = useState(false); async function handleRetry() { setLoading(true); try { await fetch(`/api/publish-jobs/${publishJobId}/retry`, { method: "POST" }); window.location.reload(); } finally { setLoading(false); } } return <button disabled={loading} onClick={handleRetry} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Retrying..." : "Retry"}</button>; }
