import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      redirectTo: "/content",
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return response;
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}