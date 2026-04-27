import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ArchiveButton } from "@/components/archive-button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function AppProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params;
  const { data: project } = await supabaseAdmin.from("app_projects").select("id, name, summary, target_users, platform_type, status, created_at").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!project) notFound();
  const { data: features } = await supabaseAdmin.from("app_features").select("id, name, description, priority, status, spec, created_at").eq("project_id", project.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><Link href="/app-builder" className="text-sm underline">Back to projects</Link><h2 className="mt-2 text-3xl font-bold">{project.name}</h2><p className="mt-2 text-neutral-500">{project.summary || "No summary yet."}</p></div><div className="flex flex-wrap gap-2"><ArchiveButton endpoint={`/api/app-projects/${project.id}/archive`} label="Archive project" /><ConfirmDeleteButton endpoint={`/api/app-projects/${project.id}/delete`} label="Delete project" confirmText="Delete this project permanently?" /></div><div className="space-y-4">{(features ?? []).length===0?<div className="rounded-2xl border p-5 text-neutral-500">No features yet.</div>:features?.map((feature:any)=><div key={feature.id} className="rounded-2xl border p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">{feature.name}</h3><p className="mt-1 text-sm text-neutral-500">{feature.priority} • {feature.status}</p>{feature.description ? <p className="mt-3 text-sm text-neutral-700">{feature.description}</p> : null}</div><ConfirmDeleteButton endpoint={`/api/app-features/${feature.id}/delete`} label="Delete feature" confirmText="Delete this feature permanently?" /></div></div>)}</div></div></DashboardShell>;
}
