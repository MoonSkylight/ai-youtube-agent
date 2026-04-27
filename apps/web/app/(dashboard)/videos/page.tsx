import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
import { VideoPublishActions } from "@/components/video-publish-actions";

export default async function VideosPage() {
  const user = await requireUser();
  const { data: videos } = await supabaseAdmin.from("videos").select("id, title, platform_target, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Videos</h2><p className="text-neutral-500">Manage video drafts created from content scripts.</p></div><div className="space-y-4">{(videos ?? []).length===0?<div className="rounded-2xl border p-5 text-neutral-500">No videos yet.</div>:videos?.map((video:any)=><div key={video.id} className="rounded-2xl border p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link href={`/videos/${video.id}`} className="text-lg font-semibold underline">{video.title}</Link><p className="mt-1 text-sm text-neutral-500">{video.platform_target} • {video.status}</p></div><VideoPublishActions videoId={video.id} platform={video.platform_target} /></div></div>)}</div></div></DashboardShell>;
}
