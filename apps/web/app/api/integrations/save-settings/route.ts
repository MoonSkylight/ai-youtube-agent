import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";
const settingSchema = z.object({ provider: z.string().min(1), isEnabled: z.boolean(), mode: z.string().optional(), accountLabel: z.string().optional() });
const bodySchema = z.object({ settings: z.array(settingSchema) });
export async function POST(request: NextRequest) { try { const user = await requireUser(); const body = bodySchema.parse(await request.json()); const rows = body.settings.map((item) => ({ user_id: user.id, provider: item.provider, is_enabled: item.isEnabled, mode: item.mode ?? null, account_label: item.accountLabel ?? null, updated_at: new Date().toISOString() })); const { error } = await supabaseAdmin.from("integration_settings").upsert(rows, { onConflict: "user_id,provider" }); if (error) return NextResponse.json({ ok:false, error:error.message }, { status:500 }); return NextResponse.json({ ok:true }); } catch (error) { console.error(error); return NextResponse.json({ ok:false, error:"Failed to save integration settings" }, { status:500 }); } }
