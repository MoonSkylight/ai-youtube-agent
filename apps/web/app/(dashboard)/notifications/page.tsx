import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarkAllNotificationsReadButton, NotificationActions } from "@/components/notification-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function NotificationsPage() {
  const user = await requireUser();
  const { data: notifications } = await supabaseAdmin.from("notifications").select("id, title, body, level, is_read, link, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  return <DashboardShell><div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-3xl font-bold">Notifications</h2><p className="text-neutral-500">Important updates from your agents and workflows.</p></div><MarkAllNotificationsReadButton /></div><div className="space-y-4">{(notifications ?? []).length===0?<div className="rounded-2xl border p-5 text-neutral-500">No notifications yet.</div>:notifications?.map((item:any)=><div key={item.id} className="rounded-2xl border p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">{item.title}</h3>{item.body ? <p className="mt-2 text-sm text-neutral-700">{item.body}</p> : null}<p className="mt-2 text-xs text-neutral-500">{item.created_at}</p>{item.link ? <Link href={item.link} className="mt-2 inline-block text-sm underline">Open related page</Link> : null}</div><div className="flex items-center gap-2"><StatusBadge status={item.level} />{!item.is_read ? <NotificationActions notificationId={item.id} /> : null}</div></div></div>)}</div></div></DashboardShell>;
}
