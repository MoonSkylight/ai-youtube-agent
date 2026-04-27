import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ffmpegBinary =
  process.platform === "win32"
    ? path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe")
    : path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg");

(ffmpeg as any).setFfmpegPath(ffmpegBinary);

export async function POST(req: NextRequest) {
  try {
    const { scriptId } = await req.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: script, error } = await supabase
      .from("scripts")
      .select("id, title, script_body")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const videoPath = path.join(tmpDir, `video-${Date.now()}.mp4`);

    const lines = String(script.script_body || "")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean)
      .slice(0, 12)
      .join("   ")
      .replace(/:/g, "\\:");

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input("color=c=black:s=1080x1920:d=12")
        .inputFormat("lavfi")
        .videoFilters([
          {
            filter: "drawtext",
            options: {
              text: (script.title || "AI Video").replace(/:/g, "\\:"),
              fontcolor: "white",
              fontsize: 48,
              x: "(w-text_w)/2",
              y: 180,
            },
          },
          {
            filter: "drawtext",
            options: {
              text: lines,
              fontcolor: "white",
              fontsize: 28,
              x: 80,
              y: 400,
              box: 1,
              boxcolor: "black@0.4",
              boxborderw: 20,
            },
          },
        ])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p"])
        .save(videoPath)
        .on("end", () => resolve())
        .on("error", reject);
    });

    return NextResponse.json({
      ok: true,
      videoPath,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Render failed" },
      { status: 500 }
    );
  }
}