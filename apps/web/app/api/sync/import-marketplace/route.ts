import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
import { createNotification } from "@/lib/notifications";
const bodySchema = z.object({ provider: z.enum(["amazon","ebay"]), entityType: z.enum(["products","orders","listings"]) });
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const { data: syncJob, error } = await supabaseAdmin.from("sync_jobs").insert({ user_id: user.id, provider: body.provider, job_type: `import_${body.entityType}`, status: "queued", metadata: { entityType: body.entityType, stub: true } }).select("*").single(); if (error || !syncJob) return NextResponse.json({ ok:false, error:error?.message || "Failed to create sync job" }, { status:500 }); await createNotification({ userId: user.id, title: `${body.provider} import queued`, body: `A stub import job was created for ${body.entityType}.`, level: "info", link: "/workers" }); return NextResponse.json({ ok:true, syncJob }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to queue marketplace import" }, { status:500 }); } }
