export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";
import { google } from "googleapis";
import { Readable } from "stream";

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

function sanitizePromptText(input: string) {
  return input
    .replace(/iron man/gi, "armored sci-fi hero")
    .replace(/spider-man/gi, "agile masked hero")
    .replace(/batman/gi, "dark vigilante hero")
    .replace(/superman/gi, "flying hero")
    .replace(/super man/gi, "flying hero")
    .replace(/hulk/gi, "powerful green hero")
    .replace(/thor/gi, "mythic hero")
    .replace(/thanos/gi, "cosmic villain")
    .replace(/marvel/gi, "comic universe")
    .replace(/\bdc\b/gi, "comic universe")
    .replace(/kill|murder|blood|weapon|gun|fight|war/gi, "action")
    .replace(/[^\w\s,.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function buildPrompt(script: string, mode: "adult" | "kids") {
  const clean = sanitizePromptText(script);

  if (mode === "kids") {
    return `friendly colorful animated adventure scene, cartoon style, cheerful lighting, safe for children, fantasy storytelling, ${clean}`;
  }

  return `cinematic family-friendly animated sci-fi adventure scene, stylized hero, dramatic lighting, action storytelling, safe non-violent tone, ${clean}`;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/publish",
    message: "publish route is live",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult").trim() as "adult" | "kids";
    const title = String(body.title || "AI Generated Video").trim();
    const description = String(body.description || "").trim();

    if (!scriptId) {
      return jsonError("scriptId required", 400);
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return jsonError("Supabase env variables missing", 500);
    }

    if (!process.env.RUNWAYML_API_SECRET) {
      return jsonError("RUNWAYML_API_SECRET missing", 500);
    }

    if (
      !process.env.YOUTUBE_CLIENT_ID ||
      !process.env.YOUTUBE_CLIENT_SECRET ||
      !process.env.YOUTUBE_REFRESH_TOKEN
    ) {
      return jsonError("YouTube env variables missing", 500);
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
      return jsonError(scriptError?.message || "Script not found", 404);
    }

    const sourceText = `${script.title || ""}. ${script.script_body || ""}`.trim();
    const promptText = buildPrompt(sourceText, mode);

    const runway = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET,
    });

    const promptImage = `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
      "safe animated story scene"
    )}`;

    let videoUrl = "";

    try {
      const task = await runway.imageToVideo
        .create({
          model: "gen4_turbo",
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
        return jsonError("No video generated", 500);
      }
    } catch (error: any) {
      if (error instanceof TaskFailedError) {
        return jsonError(error?.message || "Runway task failed", 500);
      }

      return jsonError(error?.message || "Runway generation failed", 500);
    }

    const generatedVideoResponse = await fetch(videoUrl);

    if (!generatedVideoResponse.ok) {
      return jsonError("Failed to fetch generated video", 400);
    }

    const buffer = Buffer.from(await generatedVideoResponse.arrayBuffer());
    const stream = Readable.from(buffer);

    try {
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

      const upload = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: `${title} | AI Story`,
            description: description.slice(0, 4000),
            tags: ["AI video", "AI story", "animation", "automated video"],
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
    } catch (error: any) {
      return jsonError(error?.message || "YouTube upload failed", 500);
    }
  } catch (err: any) {
    return jsonError(err?.message || "Publish failed", 500);
  }
}