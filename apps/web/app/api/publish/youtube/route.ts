export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult").trim();

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId is required" },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const renderRes = await fetch(`${origin}/api/render-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scriptId, mode }),
    });

    const renderData = await renderRes.json();

    if (!renderRes.ok || !renderData.ok || !renderData.videoUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: renderData.error || "Video generation failed",
        },
        { status: 500 }
      );
    }

    const uploadRes = await fetch(`${origin}/api/upload-to-youtube`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scriptId,
        videoUrl: renderData.videoUrl,
        title: renderData.title || body.title || "AI Generated Video",
        description: body.description || "",
      }),
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: uploadData.error || "Upload failed",
          videoUrl: renderData.videoUrl,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      videoUrl: renderData.videoUrl,
      youtubeUrl: uploadData.youtubeUrl,
      youtubeVideoId: uploadData.youtubeVideoId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Publish failed" },
      { status: 500 }
    );
  }
}