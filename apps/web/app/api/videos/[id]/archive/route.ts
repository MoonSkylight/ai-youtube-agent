import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requireUser(); const { id } = await context.params; await supabaseAdmin.from("videos").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id); return NextResponse.json({ ok:true }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to archive video" }, { status:500 }); } }
