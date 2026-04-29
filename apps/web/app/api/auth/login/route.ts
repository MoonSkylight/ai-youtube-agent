import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      email = String(body.email || "").trim();
      password = String(body.password || "");
    } else {
      const formData = await request.formData().catch(() => null);
      email = String(formData?.get("email") || "").trim();
      password = String(formData?.get("password") || "");
    }

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
    console.error(error);
    return NextResponse.json({
      ok: false,
      error: error.message || "Login failed",
    });
  }
}