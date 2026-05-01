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
        { ok: false, error: "YouTube environment variables are missing" },
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

    const downloaded = await fetch(videoUrl);

    if (!downloaded.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to download video from videoUrl" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await downloaded.arrayBuffer());
    const stream = Readable.from(buffer);

    const upload = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title.slice(0, 100),
          description: description.slice(0, 4000),
          tags: ["AI", "video", "story"],
          categoryId: "22",
        },
        status: {
          privacyStatus: "private",
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