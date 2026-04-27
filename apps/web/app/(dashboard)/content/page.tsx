import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { ScriptForm } from "@/components/script-form";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function ContentPage() {
  const user = await requireUser();
  const { data: scripts } = await supabaseAdmin.from("scripts").select("id, platform, title, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Content Studio</h2><p className="text-neutral-500">Create short-form video script drafts for TikTok and YouTube.</p></div><ScriptForm /><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{(scripts ?? []).length === 0 ? <div className="rounded-2xl border p-5 text-neutral-500">No scripts yet.</div> : scripts?.map((script: any) => <Link key={script.id} href={`/content/${script.id}`} className="rounded-2xl border p-5 shadow-sm transition hover:shadow-md"><h3 className="text-lg font-semibold">{script.title}</h3><p className="mt-1 text-sm text-neutral-500">{script.platform} • {script.status}</p><p className="mt-2 text-xs text-neutral-500">Created: {script.created_at}</p></Link>)}</div></div></DashboardShell>;
}
