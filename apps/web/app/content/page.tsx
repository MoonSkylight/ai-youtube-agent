import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type ScriptRow = {
  id: string;
  title: string;
  publish_status: string | null;
  youtube_url: string | null;
  published_at: string | null;
};

function getStatusLabel(status: string | null) {
  if (status === "published") return "Published";
  if (status === "rendered") return "Rendered";
  return "Draft";
}

export default async function ContentPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title, publish_status, youtube_url, published_at")
    .order("created_at", { ascending: false });

  const scripts = (data ?? []) as ScriptRow[];

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="badge-top">AI YouTube Agent</span>
          <h1 className="page-title">Content Dashboard</h1>
          <p className="page-subtitle">
            Review scripts, publishing state, and YouTube output.
          </p>
        </div>

        <div className="actions">
          <Link href="/" className="btn btn-secondary">
            Home
          </Link>
        </div>
      </div>

      <section className="grid">
        <div className="stats">
          <div className="stat card">
            <div className="stat-label">Total Scripts</div>
            <div className="stat-value">{scripts.length}</div>
          </div>

          <div className="stat card">
            <div className="stat-label">Published</div>
            <div className="stat-value">
              {scripts.filter((s) => s.publish_status === "published").length}
            </div>
          </div>

          <div className="stat card">
            <div className="stat-label">Drafts</div>
            <div className="stat-value">
              {scripts.filter((s) => s.publish_status !== "published").length}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body stack">
            <div>
              <h2 className="card-title">All Scripts</h2>
              <p className="card-muted">
                Open a script, render a video, or jump to YouTube.
              </p>
            </div>

            {error ? (
              <div className="notice notice-danger">Failed to load scripts.</div>
            ) : scripts.length === 0 ? (
              <div className="empty">No scripts found.</div>
            ) : (
              <div className="list">
                {scripts.map((script, index) => (
                  <div key={script.id} className="script-item">
                    <h3 className="script-title">
                      {script.title || "Untitled Script"}
                    </h3>

                    <div className="script-meta">Script #{index + 1}</div>

                    <div
                      className={`status-badge ${
                        script.publish_status === "published"
                          ? "status-published"
                          : script.publish_status === "rendered"
                          ? "status-rendered"
                          : "status-draft"
                      }`}
                      style={{ marginTop: 10 }}
                    >
                      {getStatusLabel(script.publish_status)}
                    </div>

                    <div className="actions" style={{ marginTop: 12 }}>
                      <Link
                        href={`/content/${script.id}`}
                        className="btn btn-primary"
                      >
                        Open
                      </Link>

                      {script.youtube_url ? (
                        <a
                          href={script.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-success"
                        >
                          Watch on YouTube
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}