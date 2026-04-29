import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json({
      ok: true,
      title: "Generated Video",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      message: "Fallback video ready",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Render failed" },
      { status: 500 }
    );
  }
}