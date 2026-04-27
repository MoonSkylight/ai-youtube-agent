import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const bodySchema = z.object({ publishJobId: z.string().uuid() });
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const { data: job, error } = await supabaseAdmin.from("publish_jobs").select("id, user_id, video_id, platform, status").eq("id", body.publishJobId).eq("user_id", user.id).single(); if (error || !job) return NextResponse.json({ ok:false, error:"Publish job not found" }, { status:404 }); if (job.platform !== "tiktok") return NextResponse.json({ ok:false, error:"Invalid platform" }, { status:400 }); await supabaseAdmin.from("publish_jobs").update({ status: "posted", external_post_id: `tt_stub_${job.id}` }).eq("id", job.id); return NextResponse.json({ ok:true, message:"TikTok publish stub completed.", externalPostId:`tt_stub_${job.id}` }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed TikTok publish" }, { status:500 }); } }
