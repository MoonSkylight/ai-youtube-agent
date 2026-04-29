import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const title = String(body.title || "Generated Video").trim();
    const script = String(body.script || "").trim();

    if (!script) {
      return NextResponse.json(
        {
          ok: false,
          error: "Script is required",
        },
        { status: 400 }
      );
    }

    // Temporary fallback so the app flow works without ElevenLabs/ffmpeg issues
    return NextResponse.json({
      ok: true,
      title,
      videoUrl:
        "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
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