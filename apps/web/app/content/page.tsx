import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type ScriptRow = {
  id: string;
  title: string;
  publish_status: string | null;
  youtube_url: string | null;
  video_url: string | null;
};

function getStatusLabel(status: string | null) {
  if (status === "published") return "Published";
  if (status === "rendered") return "Rendered";
  return "Draft";
}

function getStatusClass(status: string | null) {
  if (status === "published") return "status-published";
  if (status === "rendered") return "status-rendered";
  return "status-draft";
}

export default async function ContentPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scripts")
    .select("id, title, publish_status, youtube_url, video_url, created_at")
    .order("created_at", { ascending: false });

  const scripts = (data ?? []) as ScriptRow[];
  const publishedCount = scripts.filter(
    (item) => item.publish_status === "published"
  ).length;
  const renderedCount = scripts.filter(
    (item) => item.publish_status === "rendered"
  ).length;
  const draftCount = scripts.filter(
    (item) => !item.publish_status || item.publish_status === "draft"
  ).length;

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div className="hero-copy">
          <div className="studio-kicker">AI YouTube Agent</div>
          <h1 className="studio-title">Content command center</h1>
          <p className="studio-subtitle">
            Track scripts, monitor production status, and jump directly into
            render or publish actions.
          </p>
        </div>

        <div className="studio-header-actions">
          <Link href="/" className="ui-btn ui-btn-secondary">
            Back Home
          </Link>
          <Link href="/" className="ui-btn ui-btn-primary">
            New Story
          </Link>
        </div>
      </header>

      <section className="stats-strip">
        <div className="metric-card">
          <span>Total scripts</span>
          <strong>{scripts.length}</strong>
        </div>
        <div className="metric-card">
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>
        <div className="metric-card">
          <span>Rendered</span>
          <strong>{renderedCount}</strong>
        </div>
        <div className="metric-card">
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </div>
      </section>

      <section className="studio-grid">
        <div className="studio-main">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Library</span>
              <h2>Story projects</h2>
              <p>
                Open any project to generate video, upload to YouTube, or review
                saved output.
              </p>
            </div>

            {error ? (
              <div className="notice notice-danger">
                Failed to load scripts from Supabase.
              </div>
            ) : scripts.length === 0 ? (
              <div className="empty">No scripts found yet.</div>
            ) : (
              <div className="project-list">
                {scripts.map((script, index) => (
                  <article key={script.id} className="project-card">
                    <div className="project-top">
                      <div>
                        <div className="project-index">
                          Project #{String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="project-title">
                          {script.title || "Untitled Script"}
                        </h3>
                      </div>

                      <div
                        className={`status-badge ${getStatusClass(
                          script.publish_status
                        )}`}
                      >
                        {getStatusLabel(script.publish_status)}
                      </div>
                    </div>

                    <div className="project-links">
                      <span>
                        Video: {script.video_url ? "Generated" : "Not ready"}
                      </span>
                      <span>
                        YouTube: {script.youtube_url ? "Published" : "Not published"}
                      </span>
                    </div>

                    <div className="actions" style={{ marginTop: 14 }}>
                      <Link
                        href={`/content/${script.id}`}
                        className="ui-btn ui-btn-primary"
                      >
                        Open Workspace
                      </Link>

                      {script.youtube_url ? (
                        <a
                          href={script.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ui-btn ui-btn-secondary"
                        >
                          Watch on YouTube
                        </a>
                      ) : null}

                      {script.video_url && !script.youtube_url ? (
                        <a
                          href={script.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ui-btn ui-btn-secondary"
                        >
                          Preview Video
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="studio-side">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Pipeline</span>
              <h2>Status overview</h2>
            </div>

            <div className="pipeline-list">
              <div className="pipeline-item">
                <span className="pipeline-dot">1</span>
                <div>
                  <strong>Draft queue</strong>
                  <p>{draftCount} waiting for production</p>
                </div>
              </div>

              <div className="pipeline-item">
                <span className="pipeline-dot">2</span>
                <div>
                  <strong>Rendered videos</strong>
                  <p>{renderedCount} ready for upload</p>
                </div>
              </div>

              <div className="pipeline-item">
                <span className="pipeline-dot">3</span>
                <div>
                  <strong>Published library</strong>
                  <p>{publishedCount} live on YouTube</p>
                </div>
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Guidance</span>
              <h2>Recommended flow</h2>
            </div>

            <div className="summary-list">
              <div>
                <span>1</span>
                <strong>Open a script workspace</strong>
              </div>
              <div>
                <span>2</span>
                <strong>Generate the video render</strong>
              </div>
              <div>
                <span>3</span>
                <strong>Upload or one-click publish</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}