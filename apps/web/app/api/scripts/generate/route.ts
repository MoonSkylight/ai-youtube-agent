import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const platform = String(body.platform || "youtube");
    const topic = String(body.topic || "");
    const audience = String(body.audience || "general");
    const goal = String(body.goal || "engagement");
    const angle = String(body.angle || "educational");

    let response = NextResponse.json({ ok: false });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options?: any;
            }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const prompt = `You are a professional YouTube growth strategist.

Create a HIGH-ENGAGEMENT ${platform} video script.

Topic: ${topic}
Audience: ${audience}
Goal: ${goal}
Angle: ${angle}

Rules:
- Strong hook in first 3 seconds
- Fast-paced
- Short sentences
- Keep viewer watching
- Make it feel viral

Return:

TITLE:
HOOK:
SCRIPT:
CTA:
DESCRIPTION:
HASHTAGS:
`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a YouTube content creator AI.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error(aiData);
      return NextResponse.json(
        { ok: false, error: aiData },
        { status: 500 }
      );
    }

    const output = aiData.choices?.[0]?.message?.content || "";

    const { data: savedScript, error: saveError } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        platform: platform.toLowerCase(),
        title: topic || "Untitled Script",
        hook: output.slice(0, 300),
        script_body: output,
        caption: `Generated for topic: ${topic}`,
        status: "draft",
      })
      .select("*")
      .single();

    if (saveError) {
      console.error(saveError);
      return NextResponse.json(
        { ok: false, error: saveError.message },
        { status: 500 }
      );
    }

    response = NextResponse.json({
      ok: true,
      script: output,
      savedScript,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate script" },
      { status: 500 }
    );
  }
}