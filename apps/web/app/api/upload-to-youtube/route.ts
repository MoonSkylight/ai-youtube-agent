import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const scriptId = String(body.scriptId || "").trim();
    const videoUrl = String(body.videoUrl || "").trim();

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId is required" },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { ok: false, error: "videoUrl is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "YouTube upload route is ready. Add googleapis dependency next.",
      youtubeUrl: "https://www.youtube.com/",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}