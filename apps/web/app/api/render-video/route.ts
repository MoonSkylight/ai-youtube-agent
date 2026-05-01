export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

function buildPrompt(script: string, mode: "adult" | "kids") {
  const clean = script.replace(/\s+/g, " ").trim().slice(0, 900);

  if (mode === "kids") {
    return `Create a bright, child-friendly animated story video. Style: colorful cartoon, playful, gentle motion, expressive characters, clean backgrounds, wholesome tone. Story: ${clean}`;
  }

  return `Create a cinematic story video. Style: realistic or stylized 3D, polished lighting, dramatic composition, smooth camera motion, high detail. Story: ${clean}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const scriptId = String(body.scriptId || "").trim();
    const mode = String(body.mode || "adult").trim() as "adult" | "kids";

    if (!scriptId) {
      return NextResponse.json(
        { ok: false, error: "scriptId is required" },
        { status: 400 }
      );
    }

    if (!process.env.RUNWAYML_API_SECRET) {
      return NextResponse.json(
        { ok: false, error: "RUNWAYML_API_SECRET is missing" },
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

    const promptText = buildPrompt(String(data.script_body || ""), mode);

    const runway = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET,
    });

    try {
      const task = await runway.imageToVideo
        .create({
          model: "gen4.5",
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
          { ok: false, error: "Runway returned no video URL" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        title: data.title || "Generated Video",
        videoUrl,
        taskId: task.id,
        images: [],
      });
    } catch (error) {
      if (error instanceof TaskFailedError) {
        return NextResponse.json(
          {
            ok: false,
            error: "Runway task failed",
            details: error.taskDetails,
          },
          { status: 500 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Render failed" },
      { status: 500 }
    );
  }
}