export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

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

    const runway = new RunwayML({
      apiKey: process.env.RUNWAYML_API_SECRET!,
    });

    // 🔥 FIX: Provide image (required)
    const promptImage = `https://dummyimage.com/1280x720/000/fff&text=${encodeURIComponent(
      promptText
    )}`;

    try {
      const task = await runway.imageToVideo
        .create({
          model: "gen4.5",
          promptImage, // ✅ REQUIRED
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

      return NextResponse.json({
        ok: true,
        videoUrl,
      });
    } catch (error) {
      if (error instanceof TaskFailedError) {
        return NextResponse.json(
          { ok: false, error: "Runway task failed" },
          { status: 500 }
        );
      }

      throw error;
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Render failed" },
      { status: 500 }
    );
  }
}