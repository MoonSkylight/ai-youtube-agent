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

    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const script = String(data.script_body || "");

    const scenes = script
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const images = scenes.slice(0, 5).map((scene: string) => {
      const style =
        mode === "kids"
          ? "cartoon kids animation colorful toys fruits"
          : "cinematic realistic 3d animation dramatic lighting";

      return `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
        `${style} ${scene.slice(0, 60)}`
      )}`;
    });

    const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

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