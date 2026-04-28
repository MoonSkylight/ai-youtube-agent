import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ ok: true });

    const cookies = {
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
    };

    // Example usage (optional)
    cookies.setAll([
      {
        name: "test",
        value: "123",
        options: { httpOnly: true },
      },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      ok: false,
      error: "Login failed",
    });
  }
}