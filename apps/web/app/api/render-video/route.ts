import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();

    if (!scriptId) {
      return NextResponse.json(
        {
          ok: false,
          error: "scriptId is required",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("scripts")
      .select("id, title, script_body")
      .eq("id", scriptId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Script not found",
        },
        { status: 404 }
      );
    }

    const script = String(data.script_body || "").trim();

    if (!script) {
      return NextResponse.json(
        {
          ok: false,
          error: "Script is empty",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      title: data.title || "Generated Video",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      message: "Temporary fallback video returned successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Render failed",
      },
      { status: 500 }
    );
  }
}