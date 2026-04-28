import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    console.log("BODY:", body);

    if (!body) {
      return NextResponse.json({
        ok: false,
        error: "No data received",
      });
    }

    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({
        ok: false,
        error: "Email and password are required",
      });
    }

    // TEMP: bypass auth to confirm flow
    return NextResponse.json({
      ok: true,
      redirectTo: "/content",
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      ok: false,
      error: "Login failed",
    });
  }
}