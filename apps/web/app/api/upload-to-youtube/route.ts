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
      .select("id, title, script_body")
      .eq("id", scriptId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const title = String(data.title || "Untitled Video");
    const description = String(data.script_body || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    return NextResponse.json({
      ok: true,
      message: "Temporary YouTube upload mock completed",
      youtubeUrl: "https://www.youtube.com/",
      uploadedTitle: title,
      uploadedDescription: description,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}