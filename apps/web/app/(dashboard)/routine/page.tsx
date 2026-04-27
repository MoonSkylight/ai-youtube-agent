import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { RoutineActions } from "@/components/routine-actions";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function RoutinePage() {
  const user = await requireUser();
  const { data: routines } = await supabaseAdmin.from("routines").select("id, routine_date, morning_plan, completed_summary, created_at").eq("user_id", user.id).order("routine_date", { ascending: false }).limit(10);
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Routine</h2><p className="text-neutral-500">Start your day plan and close your day with a review.</p></div><RoutineActions /><DataTable title="Routine history" rows={(routines as any[]) ?? []} columns={[{ key: "routine_date", label: "Date" }, { key: "morning_plan", label: "Morning plan" }, { key: "completed_summary", label: "Completed summary" }]} /></div></DashboardShell>;
}
