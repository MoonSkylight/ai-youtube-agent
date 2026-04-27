import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ ok: false, error: "No code" });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/api/youtube/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  console.log("YOUTUBE TOKENS:", tokenData);

  // ✅ Save token locally (simple storage)
  const filePath = path.join(process.cwd(), "youtube-token.json");
  fs.writeFileSync(filePath, JSON.stringify(tokenData, null, 2));

  return NextResponse.json({
    ok: true,
    message: "YouTube connected and token saved",
  });
}