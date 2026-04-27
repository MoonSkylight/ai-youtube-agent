import { DashboardShell } from "@/components/dashboard-shell";
import { ApprovalsManager } from "@/components/approvals-manager";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function ApprovalsPage() {
  const user = await requireUser();
  const { data: approvals } = await supabaseAdmin.from("approvals").select("id, action_type, status, payload, requested_by_agent, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-6"><div><h2 className="text-3xl font-bold">Approvals</h2><p className="text-neutral-500">Review and approve sensitive AI actions.</p></div><ApprovalsManager approvals={(approvals as any[]) ?? []} /></div></DashboardShell>;
}
