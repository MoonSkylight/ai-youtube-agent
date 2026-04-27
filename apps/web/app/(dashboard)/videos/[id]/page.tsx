import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ArchiveButton } from "@/components/archive-button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { VideoPublishActions } from "@/components/video-publish-actions";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params;
  const { data: video } = await supabaseAdmin.from("videos").select("id, title, platform_target, caption, status, file_asset_id, thumbnail_asset_id, script_id, created_at").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!video) notFound();
  return <DashboardShell><div className="space-y-6"><div><Link href="/videos" className="text-sm underline">Back to videos</Link><h2 className="mt-2 text-3xl font-bold">{video.title}</h2><p className="mt-1 text-sm text-neutral-500">{video.platform_target} • {video.status}</p></div><div className="flex flex-wrap gap-2"><ArchiveButton endpoint={`/api/videos/${video.id}/archive`} label="Archive video" /><ConfirmDeleteButton endpoint={`/api/videos/${video.id}/delete`} label="Delete video" confirmText="Delete this video permanently?" /></div><VideoPublishActions videoId={video.id} platform={video.platform_target as any} /><div className="rounded-2xl border p-5 shadow-sm"><h3 className="text-lg font-semibold">Caption</h3><p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{video.caption || "No caption yet."}</p></div></div></DashboardShell>;
}
