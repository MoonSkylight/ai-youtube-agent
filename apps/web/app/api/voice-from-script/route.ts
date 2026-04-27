import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateVoice } from "@/lib/voice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: script, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", body.scriptId)
      .single();

    if (error || !script) {
      return NextResponse.json(
        { ok: false, error: "Script not found" },
        { status: 404 }
      );
    }

    const audio = await generateVoice(script.script_body || "");
    const fileName = `voice-${script.id}-${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("media-assets")
      .upload(fileName, audio, { contentType: "audio/mpeg" });

    if (uploadError) {
      console.error("STORAGE ERROR:", uploadError);
      return NextResponse.json(
        { ok: false, error: uploadError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, fileName });
  } catch (e: any) {
    console.error("VOICE ERROR FULL:", e);
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Voice generation failed",
      },
      { status: 500 }
    );
  }
}