import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requireUser(); const { id } = await context.params; const { data, error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", user.id).select("id").single(); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true, notification:data }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to mark notification read" }, { status:500 }); } }
