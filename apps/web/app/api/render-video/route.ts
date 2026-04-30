import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult");

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const script = data.script_body || "";

    let style = "";

    if (mode === "kids") {
      style =
        "cartoon colorful kids animation, toys, fruits, playful, soft lighting";
    } else {
      style =
        "realistic cinematic, 3D animation, paper craft, sand motion, dramatic lighting";
    }

    const image = `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
      style + " " + script.slice(0, 80)
    )}`;

    return NextResponse.json({
      ok: true,
      videoUrl: image,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Render failed" },
      { status: 500 }
    );
  }
}