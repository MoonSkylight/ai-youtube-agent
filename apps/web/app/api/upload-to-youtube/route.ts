import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("scripts")
      .select("id, title, script_body")
      .eq("id", scriptId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
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

    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to download generated video" },
        { status: 400 }
      );
    }

    const arrayBuffer = await videoResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const title = String(data.title || "AI Generated Video").slice(0, 100);
    const description = String(data.script_body || "").slice(0, 4000);

    const uploadResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags: ["AI", "story", "video"],
          categoryId: "1",
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
      youtubeVideoId: uploadResponse.data.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${uploadResponse.data.id}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}