import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const bodySchema = z.object({ publishJobId: z.string().uuid(), scheduledFor: z.string().min(1) });
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const { data, error } = await supabaseAdmin.from("publish_jobs").update({ scheduled_for: body.scheduledFor, updated_at: new Date().toISOString() }).eq("id", body.publishJobId).eq("user_id", user.id).select("*").single(); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true, publishJob:data }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to schedule publish job" }, { status:500 }); } }
