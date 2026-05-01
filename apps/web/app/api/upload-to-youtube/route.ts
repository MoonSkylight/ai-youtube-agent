export const runtime = "nodejs"; // ⭐ THIS FIXES THE ERROR

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const videoUrl = body.videoUrl;

    if (!videoUrl) {
      return NextResponse.json(
        { ok: false, error: "videoUrl required" },
        { status: 400 }
      );
    }

    // Just confirm working for now
    return NextResponse.json({
      ok: true,
      message: "YouTube upload route ready",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}