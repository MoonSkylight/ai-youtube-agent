import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const scriptId = String(body.scriptId || "").trim();

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("scripts")
      .select("title, script_body")
      .eq("id", scriptId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const text = encodeURIComponent(data.script_body || "");

    // Simple generated "video" using text render service
    const videoUrl = `https://dummyimage.com/1280x720/000/fff&text=${text.slice(
      0,
      200
    )}`;

    return NextResponse.json({
      ok: true,
      title: data.title,
      videoUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Render failed" },
      { status: 500 }
    );
  }
}