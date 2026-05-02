export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function buildSystemPrompt(mode: "adult" | "kids") {
  if (mode === "kids") {
    return `You are a children's YouTube scriptwriter.
Write safe, simple, colorful, family-friendly story scripts.
Use clear language, short scenes, and an engaging storytelling tone.
Return plain text only.`;
  }

  return `You are a professional YouTube scriptwriter.
Write cinematic, engaging, highly watchable story scripts for a general audience.
Use strong hooks, vivid scenes, and clean pacing.
Return plain text only.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const title = String(body.title || "").trim();
    const prompt = String(body.prompt || "").trim();
    const mode = String(body.mode || "adult").trim() as "adult" | "kids";

    if (!title || !prompt) {
      return NextResponse.json(
        { ok: false, error: "title and prompt are required" },
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY is missing" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(mode),
        },
        {
          role: "user",
          content: `Title: ${title}

Prompt: ${prompt}

Write a complete YouTube-ready script based on this request.`,
        },
      ],
    });

    const scriptBody = completion.choices[0]?.message?.content?.trim() || "";

    if (!scriptBody) {
      return NextResponse.json(
        { ok: false, error: "No script was generated" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = {
      title,
      prompt,
      mode,
      platform: "youtube",
      script_body: scriptBody,
    };

    const { data, error } = await supabase
      .from("scripts")
      .insert(payload)
      .select("id, title")
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          details: error.details ?? null,
          hint: error.hint ?? null,
          code: error.code ?? null,
          payload,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      title: data.title,
      script_body: scriptBody,
    });
  } catch (err: any) {
    console.error("GENERATE SCRIPT ERROR:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to generate script",
      },
      { status: 500 }
    );
  }
}