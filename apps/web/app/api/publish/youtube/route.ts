export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";
import { google } from "googleapis";
import { Readable } from "stream";

function buildPrompt(script: string, mode: "adult" | "kids") {
  const clean = script.replace(/\s+/g, " ").trim().slice(0, 500);

  if (mode === "kids") {
    return `cartoon colorful kids animation ${clean}`;
  }

  return `cinematic realistic 3d animation ${clean}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult").trim() as "adult" | "kids";
    const title = String(body.title || "AI Generated Video").trim();
    const description = String(body.description || "").trim();

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId required" },
        { status: 400 }
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

    if (!process.env.RUNWAYML_API_SECRET) {
      return NextResponse.json(
        { ok: false, error: "RUNWAYML_API_SECRET missing" },
        { status: 500 }
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: script, error: scriptError } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (scriptError || !script) {
      return NextResponse.json(
        { ok: false, error: scriptError?.message || "Script not found" },
        { status: 404 }
      );
    }

    const promptText = buildPrompt(script.script_body || "", mode);

    const runway = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET,
    });

    const promptImage = `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
      promptText
    )}`;

    let videoUrl = "";

    try {
      const task = await runway.imageToVideo
        .create({
          model: "gen4.5",
          promptImage,
          promptText,
          ratio: "1280:720",
          duration: 5,
        })
        .waitForTaskOutput({
          timeout: 5 * 60 * 1000,
        });

      const output = Array.isArray(task.output) ? task.output : [];
      videoUrl = output[0] || "";

      if (!videoUrl) {
        return NextResponse.json(
          { ok: false, error: "No video generated" },
          { status: 500 }
        );
      }
    } catch (error) {
      if (error instanceof TaskFailedError) {
        return NextResponse.json(
          { ok: false, error: "Runway task failed" },
          { status: 500 }
        );
      }

      throw error;
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
        { ok: false, error: "Failed to fetch generated video" },
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

    return NextResponse.json({
      ok: true,
      videoUrl,
      youtubeVideoId: upload.data.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${upload.data.id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Publish failed" },
      { status: 500 }
    );
  }
}