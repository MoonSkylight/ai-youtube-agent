import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
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

    // 🎬 STEP 1: Split into scenes
    const scenes = script.split("\n").filter((s: string) => s.trim().length > 0);

    // 🎨 STEP 2: Generate images
    const images = scenes.slice(0, 5).map((scene: string, i: number) => {
      const style =
        mode === "kids"
          ? "cartoon kids animation colorful toys"
          : "cinematic realistic 3d animation";

      return `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
        style + " " + scene.slice(0, 50)
      )}`;
    });

    // 🎥 STEP 3: Use external video generator (mock real pipeline)
    const videoUrl =
      "https://www.w3schools.com/html/mov_bbb.mp4";

    return NextResponse.json({
      ok: true,
      images,
      videoUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Render failed" },
      { status: 500 }
    );
  }
}