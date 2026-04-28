import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("LOGIN BODY:", body);

    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({
        ok: false,
        error: "Email and password are required",
      });
    }

    return NextResponse.json({
      ok: true,
      redirectTo: "/content",
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: "Login failed",
    });
  }
}