export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { createClient } from "@supabase/supabase-js";

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

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { ok: false, error: "Supabase env variables missing" },
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
          privacyStatus: "public",
        },
      },
      media: {
        mimeType: "video/mp4",
        body: stream,
      },
    });

    const youtubeVideoId = upload.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: updateError } = await supabase
      .from("scripts")
      .update({
        publish_status: "published",
        youtube_video_id: youtubeVideoId,
        youtube_url: youtubeUrl,
        published_at: new Date().toISOString(),
      })
      .eq("id", scriptId);

    if (updateError) {
      return NextResponse.json(
        {
          ok: true,
          youtubeVideoId,
          youtubeUrl,
          warning: `Uploaded to YouTube, but failed to update Supabase: ${updateError.message}`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      youtubeVideoId,
      youtubeUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}