import { DashboardShell } from "@/components/dashboard-shell";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function SettingsPage() {
  const user = await requireUser();
  const { data: profile } = await supabaseAdmin.from("profiles").select("display_name, business_name, niche, timezone, preferred_tone, work_hours_per_day").eq("user_id", user.id).maybeSingle();
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Settings</h2><p className="text-neutral-500">Manage your profile and operating preferences.</p></div><ProfileForm initialValues={profile ?? undefined} /></div></DashboardShell>;
}
