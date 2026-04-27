"use client";

export default function CreateVideoButton({ scriptId }: { scriptId: string }) {
  async function handleClick() {
    try {
      console.log("Starting full pipeline...");

      // 1️⃣ Generate voice
      const voiceRes = await fetch("/api/voice-from-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId }),
      });

      const voiceData = await voiceRes.json();
      console.log("VOICE:", voiceData);

      if (!voiceData.ok) {
        alert("Voice failed: " + JSON.stringify(voiceData.error));
        return;
      }

      // 2️⃣ Create video record
      const videoRes = await fetch("/api/videos/create-from-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId,
          platformTarget: "youtube",
        }),
      });

      const videoData = await videoRes.json();
      console.log("VIDEO RECORD:", videoData);

      if (!videoData.ok) {
        alert("Video record failed: " + JSON.stringify(videoData.error));
        return;
      }

      // 3️⃣ Render video
      const renderRes = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scriptId }),
      });

      const renderData = await renderRes.json();
      console.log("RENDER:", renderData);

      if (!renderData.ok) {
        alert("Render failed: " + JSON.stringify(renderData.error));
        return;
      }

      // ⚠️ IMPORTANT: paste your latest access_token here
      const accessToken = "PASTE_YOUR_ACCESS_TOKEN_HERE";

      // 4️⃣ Upload to YouTube
      const uploadRes = await fetch("/api/youtube/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
        }),
      });

      const uploadData = await uploadRes.json();
      console.log("UPLOAD:", uploadData);

      if (!uploadData.ok) {
        alert("Upload failed: " + JSON.stringify(uploadData.error));
        return;
      }

      alert("🎉 Video uploaded to YouTube successfully!");

    } catch (error: any) {
      console.error("FULL ERROR:", error);
      alert("Button error: " + error.message);
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        marginTop: 12,
        padding: "10px 16px",
        background: "#000",
        color: "#fff",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      🚀 Full Auto: Create + Upload Video
    </button>
  );
}