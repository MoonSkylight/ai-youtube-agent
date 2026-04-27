import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const tokenPath = path.join(process.cwd(), "youtube-token.json");
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

    const accessToken = tokenData.access_token;

    const tmpDir = path.join(process.cwd(), "tmp");
    const files = fs.readdirSync(tmpDir);
    const videoFile = files.find((f) => f.endsWith(".mp4"));

    if (!videoFile) {
      return NextResponse.json({ ok: false, error: "No video found" });
    }

    const videoPath = path.join(tmpDir, videoFile);
    const videoBuffer = fs.readFileSync(videoPath);

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4",
        },
        body: JSON.stringify({
          snippet: {
            title: "AI Generated Video",
            description: "Created automatically",
            tags: ["AI", "automation"],
          },
          status: {
            privacyStatus: "private",
          },
        }),
      }
    );

    const uploadUrl = initRes.headers.get("location");

    if (!uploadUrl) {
      const err = await initRes.text();
      return NextResponse.json({ ok: false, error: err });
    }

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
      },
      body: videoBuffer,
    });

    const result = await uploadRes.json();

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({
      ok: false,
      error: e.message,
    });
  }
}