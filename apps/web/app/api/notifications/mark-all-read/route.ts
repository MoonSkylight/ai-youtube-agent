import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
export async function POST() { try { const user = await requireUser(); const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to mark all notifications read" }, { status:500 }); } }
