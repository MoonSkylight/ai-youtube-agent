import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const bodySchema = z.object({ name: z.string().min(1), summary: z.string().optional(), targetUsers: z.string().optional(), platformType: z.string().optional() });
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const { data, error } = await supabaseAdmin.from("app_projects").insert({ user_id: user.id, name: body.name, summary: body.summary ?? null, target_users: body.targetUsers ?? null, platform_type: body.platformType ?? null, status: "draft" }).select("*").single(); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true, project:data }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to create app project" }, { status:500 }); } }
