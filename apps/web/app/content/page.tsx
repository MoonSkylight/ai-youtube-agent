import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type ScriptRow = {
  id: string;
  title: string | null;
  created_at?: string | null;
};

export default async function ContentPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p style={{ color: "#fca5a5" }}>
          Supabase environment variables are missing.
        </p>
      </div>
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  const scripts: ScriptRow[] = data || [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ marginTop: 8, color: "#94a3b8" }}>
            Manage scripts, open a script, create videos, and publish to
            YouTube.
          </p>
        </div>

        <Link
          href="/"
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          + New Script
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {error ? (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#111827",
              border: "1px solid #7f1d1d",
              color: "#fecaca",
              padding: 20,
              borderRadius: 16,
            }}
          >
            Failed to load scripts.
          </div>
        ) : null}

        {!error && scripts.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#111827",
              border: "1px solid #1f2937",
              color: "#cbd5e1",
              padding: 24,
              borderRadius: 16,
            }}
          >
            No scripts yet. Create your first script to get started.
          </div>
        ) : null}

        {scripts.map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.id}`}
            style={{
              display: "block",
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 18,
              padding: 20,
              color: "#e5e7eb",
              textDecoration: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(37,99,235,0.15)",
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Script
            </div>

            <h2
              style={{
                margin: "0 0 10px 0",
                fontSize: 20,
                lineHeight: 1.3,
              }}
            >
              {item.title?.trim() || "Untitled Script"}
            </h2>

            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              Open this script and use the action buttons to create video or
              publish.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}