import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

const bodySchema = z.object({
  scriptId: z.string().uuid(),
  platformTarget: z.enum(["youtube", "tiktok"]),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ FIX: safe JSON parsing
    let raw;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Missing request body" },
        { status: 400 }
      );
    }

    const body = bodySchema.parse(raw);

    // ✅ get logged-in user
    const user = await requireUser();

    // ✅ get script
    const { data: script, error: scriptError } = await supabaseAdmin
      .from("scripts")
      .select("id, user_id, title, caption")
      .eq("id", body.scriptId)
      .eq("user_id", user.id)
      .single();

    if (scriptError || !script) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    // ✅ create video record
    const { data: video, error } = await supabaseAdmin
      .from("videos")
      .insert({
        user_id: user.id,
        script_id: script.id,
        title: script.title,
        platform_target: body.platformTarget,
        caption: script.caption ?? null,
        status: "draft",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      video,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Failed to create video" },
      { status: 500 }
    );
  }
}