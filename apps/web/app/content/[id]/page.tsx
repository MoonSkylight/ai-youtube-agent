"use client";

import { useState, useEffect } from "react";

export default function Page({ params }: any) {
  const [data, setData] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/get-script?id=${params.id}`);
      const json = await res.json();
      setData(json);
    }
    load();
  }, [params.id]);

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  // Split script into "pages"
  const pages = (data.script_body || "")
    .split("\n")
    .filter((p: string) => p.trim().length > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#fff",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* BOOK COVER */}
      <div
        style={{
          width: 320,
          height: 420,
          background: "linear-gradient(135deg, #6366f1, #22c55e)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 30,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24 }}>{data.title}</h1>
        <p style={{ opacity: 0.7 }}>A Magical Story</p>
      </div>

      {/* STORY PAGE */}
      <div
        style={{
          width: 500,
          minHeight: 300,
          background: "#111827",
          borderRadius: 20,
          padding: 24,
          textAlign: "center",
          fontSize: 18,
          lineHeight: 1.7,
        }}
      >
        {pages[pageIndex]}
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
        >
          ⬅ Previous
        </button>

        <button
          onClick={() =>
            setPageIndex((p) => Math.min(pages.length - 1, p + 1))
          }
        >
          Next ➡
        </button>
      </div>

      {/* PAGE INDICATOR */}
      <p style={{ marginTop: 10 }}>
        Page {pageIndex + 1} / {pages.length}
      </p>
    </div>
  );
}