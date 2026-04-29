import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type ScriptRow = {
  id: string;
  title: string | null;
  created_at: string | null;
  script_body: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}

function getExcerpt(text: string | null, maxLength = 140) {
  if (!text) return "No script body available yet.";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength)}...`;
}

export default async function ContentPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title, created_at, script_body")
    .order("created_at", { ascending: false });

  const scripts: ScriptRow[] = data ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#f8fafc",
        padding: "32px 20px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#94a3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Dashboard
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 36,
                lineHeight: 1.1,
              }}
            >
              Content Studio
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                color: "#cbd5e1",
                maxWidth: 640,
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              Manage your generated scripts, review content, create demo videos,
              and prepare uploads from one clean workspace.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                background: "#1e293b",
                color: "#f8fafc",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #334155",
                fontWeight: 600,
              }}
            >
              Home
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              Total Scripts
            </p>
            <h2 style={{ margin: "12px 0 0", fontSize: 32 }}>{scripts.length}</h2>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              Status
            </p>
            <h2 style={{ margin: "12px 0 0", fontSize: 32 }}>Ready</h2>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              Workflow
            </p>
            <h2 style={{ margin: "12px 0 0", fontSize: 24 }}>
              Script → Video → Upload
            </h2>
          </div>
        </section>

        <section
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Saved Scripts</h2>
              <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                Open any script to review its full content and continue the
                workflow.
              </p>
            </div>
          </div>

          {error ? (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: "#3f1d1d",
                color: "#fecaca",
                border: "1px solid #7f1d1d",
              }}
            >
              Failed to load scripts: {error.message}
            </div>
          ) : scripts.length === 0 ? (
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                border: "1px dashed #334155",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              No scripts found yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              {scripts.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 20,
                    padding: 20,
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 22,
                        color: "#f8fafc",
                      }}
                    >
                      {item.title || "Untitled Script"}
                    </h3>
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: 14,
                      }}
                    >
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#cbd5e1",
                      lineHeight: 1.6,
                    }}
                  >
                    {getExcerpt(item.script_body)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}