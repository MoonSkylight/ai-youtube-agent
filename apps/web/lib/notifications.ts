import { supabaseAdmin } from "@/lib/db/server";
export async function createNotification(params: { userId: string; title: string; body?: string; level?: string; link?: string; }) { await supabaseAdmin.from("notifications").insert({ user_id: params.userId, title: params.title, body: params.body ?? null, level: params.level ?? "info", link: params.link ?? null }); }
