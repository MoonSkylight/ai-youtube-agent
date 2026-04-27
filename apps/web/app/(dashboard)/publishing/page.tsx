import { DashboardShell } from "@/components/dashboard-shell";
import { PublishJobActions } from "@/components/publish-job-actions";
import { PublishScheduleForm } from "@/components/publish-schedule-form";
import { PublishRetryButton } from "@/components/publish-retry-button";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function PublishingPage() {
  const user = await requireUser();
  const { data: jobs } = await supabaseAdmin.from("publish_jobs").select("id, platform, status, external_post_id, failure_reason, attempts, scheduled_for, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Publishing Queue</h2><p className="text-neutral-500">Track queued and published social posts.</p></div><div className="space-y-4">{(jobs ?? []).length === 0 ? <div className="rounded-2xl border p-5 text-neutral-500">No publish jobs yet.</div> : jobs?.map((job: any) => <div key={job.id} className="rounded-2xl border p-5 shadow-sm"><div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-lg font-semibold">{job.platform}</h3><p className="mt-1 text-sm text-neutral-500">Status: {job.status} {job.external_post_id ? `• External ID: ${job.external_post_id}` : ""}</p><p className="mt-1 text-xs text-neutral-500">Scheduled: {job.scheduled_for ?? "Not scheduled"}</p>{job.failure_reason ? <p className="mt-1 text-xs text-red-600">Failure: {job.failure_reason}</p> : null}</div><div className="flex flex-wrap items-center gap-2"><PublishJobActions publishJobId={job.id} platform={job.platform} status={job.status} />{job.status === "failed" ? <PublishRetryButton publishJobId={job.id} /> : null}</div></div><PublishScheduleForm publishJobId={job.id} currentValue={job.scheduled_for} /></div></div>)}</div></div></DashboardShell>;
}
