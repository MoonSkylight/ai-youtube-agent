import { DashboardShell } from "@/components/dashboard-shell";
import { TasksManager } from "@/components/tasks-manager";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function TasksPage() {
  const user = await requireUser();
  const { data: tasks } = await supabaseAdmin.from("tasks").select("id, title, details, category, priority, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Tasks</h2><p className="text-neutral-500">Manage the work created by you and your agents.</p></div><TasksManager tasks={(tasks as any[]) ?? []} /></div></DashboardShell>;
}
