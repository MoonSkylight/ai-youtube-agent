import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const bodySchema = z.object({ title: z.string().min(1), details: z.string().optional(), category: z.string(), priority: z.enum(["low","medium","high","critical"]), status: z.string() });
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { const user = await requireUser(); const { id } = await context.params; const body = bodySchema.parse(await request.json()); const { data, error } = await supabaseAdmin.from("tasks").update({ title: body.title, details: body.details ?? null, category: body.category, priority: body.priority, status: body.status, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id).select("*").single(); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true, task:data }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to update task" }, { status:500 }); } }
