import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const bodySchema = z.object({ taskIds: z.array(z.string().uuid()).min(1), action: z.enum(["complete","archive","reset","start"]) });
const actionToStatus = { complete: "completed", archive: "archived", reset: "draft", start: "in_progress" } as const;
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const status = actionToStatus[body.action]; const { data, error } = await supabaseAdmin.from("tasks").update({ status, updated_at: new Date().toISOString() }).in("id", body.taskIds).eq("user_id", user.id).select("id"); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true, updated: data?.length ?? 0, status }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to bulk update tasks" }, { status:500 }); } }
