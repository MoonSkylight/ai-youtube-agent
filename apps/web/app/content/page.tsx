import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type ScriptRow = {
  id: string;
  title: string;
};

export default async function ContentPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title")
    .order("created_at", { ascending: false });

  const scripts = (data ?? []) as ScriptRow[];

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="badge-top">AI YouTube Agent</span>
          <h1 className="page-title">Content Dashboard</h1>
          <p className="page-subtitle">
            Review scripts and open each workflow.
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
            <div className="stat-label">Dashboard</div>
            <div className="stat-value">Ready</div>
          </div>

          <div className="stat card">
            <div className="stat-label">Workflow</div>
            <div className="stat-value">Live</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body stack">
            <div>
              <h2 className="card-title">All Scripts</h2>
              <p className="card-muted">
                Open a script to create video or upload to YouTube.
              </p>
            </div>

            {error ? (
              <div className="notice notice-danger">Failed to load scripts.</div>
            ) : scripts.length === 0 ? (
              <div className="empty">No scripts found.</div>
            ) : (
              <div className="list">
                {scripts.map((script, index) => (
                  <Link
                    key={script.id}
                    href={`/content/${script.id}`}
                    className="script-item"
                  >
                    <h3 className="script-title">
                      {script.title || "Untitled Script"}
                    </h3>
                    <div className="script-meta">
                      Script #{index + 1} • Open details
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}