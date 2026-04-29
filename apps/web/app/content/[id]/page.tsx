import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CreateVideoButton from "@/components/CreateVideoButton";
import UploadToYouTubeButton from "@/components/UploadToYouTubeButton";

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

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title, created_at, script_body")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const script = data as ScriptRow;

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
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/content"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to Content
          </Link>
        </div>

        <section
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Script Detail
              </p>
              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: 36,
                  lineHeight: 1.1,
                }}
              >
                {script.title || "Untitled Script"}
              </h1>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "#94a3b8",
                }}
              >
                Created: {formatDate(script.created_at)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <CreateVideoButton scriptId={script.id} />
              <UploadToYouTubeButton scriptId={script.id} />
            </div>
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
          <h2
            style={{
              marginTop: 0,
              marginBottom: 18,
              fontSize: 24,
            }}
          >
            Script Body
          </h2>

          <div
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 18,
              padding: 20,
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              color: "#e2e8f0",
              fontSize: 15,
            }}
          >
            {script.script_body || "No script body available."}
          </div>
        </section>
      </div>
    </main>
  );
}