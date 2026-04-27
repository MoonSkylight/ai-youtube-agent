"use client";
import { useState } from "react";
export function NotificationActions({ notificationId }: { notificationId: string }) {
  const [loading, setLoading] = useState(false);
  async function markRead() { setLoading(true); try { await fetch(`/api/notifications/${notificationId}/mark-read`, { method: "POST" }); window.location.reload(); } finally { setLoading(false); } }
  return <button disabled={loading} onClick={markRead} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Saving..." : "Mark read"}</button>;
}
export function MarkAllNotificationsReadButton() { const [loading, setLoading] = useState(false); async function markAllRead() { setLoading(true); try { await fetch("/api/notifications/mark-all-read", { method: "POST" }); window.location.reload(); } finally { setLoading(false); } } return <button disabled={loading} onClick={markAllRead} className="rounded-xl border px-3 py-2 text-sm">{loading ? "Saving..." : "Mark all read"}</button>; }
