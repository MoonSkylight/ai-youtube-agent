"use client";

import { useState, useEffect } from "react";

function splitIntoPages(text: string) {
  const paragraphs = text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const pages: string[] = [];
  let current = "";

  paragraphs.forEach((p) => {
    if ((current + " " + p).length > 500) {
      pages.push(current);
      current = p;
    } else {
      current = current ? current + " " + p : p;
    }
  });

  if (current) pages.push(current);

  return pages;
}

function generateImage(text: string) {
  const encoded = encodeURIComponent(text.slice(0, 120));
  return `https://dummyimage.com/800x500/1e293b/ffffff&text=${encoded}`;
}

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

  const pages = splitIntoPages(data.script_body || "");

  const currentText = pages[pageIndex];
  const imageUrl = generateImage(currentText);

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

      {/* STORYBOOK PAGE */}
      <div
        style={{
          width: 700,
          background: "#f8fafc",
          color: "#111",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* IMAGE */}
        <img
          src={imageUrl}
          alt="Story Illustration"
          style={{ width: "100%", height: 300, objectFit: "cover" }}
        />

        {/* TEXT */}
        <div style={{ padding: 24, fontSize: 18, lineHeight: 1.7 }}>
          {currentText}
        </div>
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
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

      <p style={{ marginTop: 10 }}>
        Page {pageIndex + 1} / {pages.length}
      </p>
    </div>
  );
}