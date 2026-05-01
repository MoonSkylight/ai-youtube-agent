export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const videoUrl = String(body.videoUrl || "").trim();
    const title = String(body.title || "AI Generated Video").trim();
    const description = String(body.description || "").trim();

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

    if (
      !process.env.YOUTUBE_CLIENT_ID ||
      !process.env.YOUTUBE_CLIENT_SECRET ||
      !process.env.YOUTUBE_REFRESH_TOKEN
    ) {
      return NextResponse.json(
        { ok: false, error: "YouTube env variables missing" },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Download video from your render step
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to fetch video" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const stream = Readable.from(buffer);

    const upload = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: `${title} | AI Story`,
          description: description.slice(0, 4000),
          tags: [
            "AI video",
            "AI story",
            "kids story",
            "animation",
            "automated video",
          ],
          categoryId: "22",
        },
        status: {
          privacyStatus: "public", // ✅ PUBLIC VIDEO
        },
      },
      media: {
        mimeType: "video/mp4",
        body: stream,
      },
    });

    return NextResponse.json({
      ok: true,
      youtubeVideoId: upload.data.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${upload.data.id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}