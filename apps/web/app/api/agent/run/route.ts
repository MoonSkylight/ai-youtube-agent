import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Temporarily disable OpenAI during build
    // (we will re-enable after deployment works)

    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      ok: true,
      message: "Agent route is working (safe mode)",
      received: body || null,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Agent error",
      },
      { status: 500 }
    );
  }
}