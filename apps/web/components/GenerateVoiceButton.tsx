"use client";

export default function CreateVideoButton({ scriptId }: { scriptId: string }) {
  return (
    <button
      onClick={async () => {
        await fetch("/api/videos/create-from-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scriptId,
            platformTarget: "youtube",
          }),
        });

        const res = await fetch("/api/render-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scriptId }),
        });

        const data = await res.json();

        if (data.ok) {
          alert("🎬 Video created! Check tmp folder.");
        } else {
          alert("❌ " + (data.error || "Failed"));
        }
      }}
      style={{
        marginTop: 12,
        padding: "10px 16px",
        background: "#000",
        color: "#fff",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      🎬 Create Video
    </button>
  );
}