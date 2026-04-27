"use client";

import { useState } from "react";

export function ScriptForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resultText, setResultText] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");
    setResultText("");

    try {
      const payload = {
        platform: String(formData.get("platform") || "youtube"),
        topic: String(formData.get("topic") || ""),
        audience: String(formData.get("audience") || ""),
        goal: String(formData.get("goal") || ""),
        angle: String(formData.get("angle") || ""),
      };

      const response = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        setMessage("Script draft created and saved.");
        setResultText(result.script || "");
        window.location.reload();
      } else {
        setMessage(
          typeof result.error === "string"
            ? result.error
            : JSON.stringify(result.error)
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <form action={handleSubmit}>
        <div>
          <label>Platform</label>
          <br />
          <select name="platform" defaultValue="youtube">
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        <div>
          <label>Topic</label>
          <br />
          <input name="topic" required />
        </div>

        <div>
          <label>Audience</label>
          <br />
          <input name="audience" />
        </div>

        <div>
          <label>Goal</label>
          <br />
          <input name="goal" />
        </div>

        <div>
          <label>Angle</label>
          <br />
          <textarea name="angle" rows={4} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button disabled={loading}>
            {loading ? "Generating..." : "Create script draft"}
          </button>
        </div>
      </form>

      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}

      {resultText ? (
        <div style={{ marginTop: 16 }}>
          <h3>Generated Script</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{resultText}</pre>
        </div>
      ) : null}
    </div>
  );
}