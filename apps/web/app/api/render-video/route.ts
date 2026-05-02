export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

function buildPrompt(script: string, mode: "adult" | "kids") {
  const clean = script.replace(/\s+/g, " ").trim().slice(0, 500);

  if (mode === "kids") {
    return `Colorful animated motion, playful camera movement, friendly kids style. ${clean}`;
  }

  return `Cinematic motion, realistic lighting, smooth camera movement, dramatic scene animation. ${clean}`;
}

function getPromptImage(mode: "adult" | "kids") {
  if (mode === "kids") {
    return "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1280&q=80";
  }

  return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1280&q=80";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult") as "adult" | "kids";

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const promptText = buildPrompt(data.script_body || "", mode);
    const promptImage = getPromptImage(mode);

    const runway = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET!,
    });

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
      const videoUrl = output[0];

      if (!videoUrl) {
        return NextResponse.json(
          { ok: false, error: "No video generated" },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabase
        .from("scripts")
        .update({
          publish_status: "rendered",
          video_url: videoUrl,
          rendered_at: new Date().toISOString(),
        })
        .eq("id", scriptId);

      if (updateError) {
        return NextResponse.json(
          {
            ok: true,
            videoUrl,
            warning: `Video created, but failed to update Supabase: ${updateError.message}`,
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        ok: true,
        videoUrl,
      });
    } catch (error: any) {
      if (error instanceof TaskFailedError) {
        return NextResponse.json(
          { ok: false, error: error.message || "Runway task failed" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { ok: false, error: error.message || "Render failed" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Render failed" },
      { status: 500 }
    );
  }
}