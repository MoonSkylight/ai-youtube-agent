import Link from "next/link";

const storyTones = [
  "Gentle",
  "Playful",
  "Heartwarming",
  "Educational",
  "Epic",
  "Bedtime",
  "Curious",
  "Moral lesson",
];

const voiceOptions = [
  { id: "A", name: "Ava", meta: "Warm · Female" },
  { id: "N", name: "Noah", meta: "Deep · Male" },
  { id: "L", name: "Luna", meta: "Bright · Female" },
  { id: "M", name: "Milo", meta: "Friendly · Male" },
];

const artStyles = [
  "Watercolor storybook",
  "Pastel dreamscape",
  "Paper cut layers",
  "Soft 3D cartoon",
  "Flat illustration",
  "Classic painted scene",
];

const recentVideos = [
  "The Lost Star",
  "Magic Forest Friends",
  "Brave Little Robot",
];

export default function HomePage() {
  return (
    <main className="studio-shell">
      <header className="app-nav">
        <div className="app-nav-brand">
          <Link href="/" className="app-nav-logo">
            AI YouTube Agent
          </Link>
          <span className="app-nav-tag">Studio</span>
        </div>

        <nav className="app-nav-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/content" className="nav-link">
            Dashboard
          </Link>
          <Link href="/login" className="nav-link">
            Login
          </Link>
        </nav>
      </header>

      <header className="studio-header">
        <div className="hero-copy">
          <div className="studio-kicker">AI YouTube Agent</div>
          <h1 className="studio-title">Build story videos from one control room</h1>
          <p className="studio-subtitle">
            Write the story, shape the visuals, generate the video, and publish
            to YouTube with a cleaner production workflow.
          </p>
        </div>

        <div className="studio-header-actions">
          <Link href="/content" className="ui-btn ui-btn-secondary">
            Open Dashboard
          </Link>
          <button className="ui-btn ui-btn-primary" type="button">
            New Project
          </button>
        </div>
      </header>

      <section className="studio-steps">
        {["Story", "Voice", "Visuals", "Settings", "Publish"].map(
          (step, index) => (
            <div
              key={step}
              className={`step-pill ${index === 0 ? "active" : ""}`}
            >
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          )
        )}
      </section>

      <section className="studio-grid">
        <div className="studio-main">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Step 1</span>
              <h2>Story brief</h2>
              <p>
                Define the title, angle, and emotional direction for your next
                video.
              </p>
            </div>

            <div className="form-stack">
              <div>
                <label>Video title</label>
                <input placeholder="The Brave Little Rabbit" />
              </div>

              <div>
                <label>Story idea</label>
                <textarea
                  rows={6}
                  placeholder="A little rabbit learns courage when a friend needs help in the dark forest."
                />
              </div>

              <div>
                <label>Tone</label>
                <div className="chip-grid">
                  {storyTones.map((tone) => (
                    <button key={tone} className="chip" type="button">
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Step 2</span>
              <h2>Narration setup</h2>
              <p>Choose the storyteller voice and pacing for your audience.</p>
            </div>

            <div className="voice-grid">
              {voiceOptions.map((voice) => (
                <button key={voice.name} className="voice-card" type="button">
                  <div className="voice-avatar">{voice.id}</div>
                  <div>
                    <div className="voice-name">{voice.name}</div>
                    <div className="voice-meta">{voice.meta}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="settings-grid" style={{ marginTop: 18 }}>
              <div>
                <label>Narration speed</label>
                <input defaultValue="100%" />
              </div>
              <div>
                <label>Music mood</label>
                <input defaultValue="Soft piano" />
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Step 3</span>
              <h2>Visual direction</h2>
              <p>Pick the art style and motion language for the final edit.</p>
            </div>

            <div className="chip-grid">
              {artStyles.map((style) => (
                <button key={style} className="chip" type="button">
                  {style}
                </button>
              ))}
            </div>

            <div className="settings-grid" style={{ marginTop: 18 }}>
              <div>
                <label>Transition style</label>
                <input defaultValue="Slow fade" />
              </div>
              <div>
                <label>Subtitle mode</label>
                <input defaultValue="Bottom captions" />
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Step 4</span>
              <h2>Production settings</h2>
              <p>Configure runtime, scenes, and publishing defaults.</p>
            </div>

            <div className="settings-grid">
              <div>
                <label>Target duration</label>
                <input defaultValue="8 minutes" />
              </div>
              <div>
                <label>Scene count</label>
                <input defaultValue="8" />
              </div>
              <div>
                <label>Upload visibility</label>
                <input defaultValue="Public" />
              </div>
              <div>
                <label>Auto-thumbnail</label>
                <input defaultValue="Enabled" />
              </div>
            </div>
          </div>
        </div>

        <aside className="studio-side">
          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Summary</span>
              <h2>Project snapshot</h2>
            </div>

            <div className="summary-list">
              <div>
                <span>Genre</span>
                <strong>Children&apos;s story</strong>
              </div>
              <div>
                <span>Voice</span>
                <strong>Ava</strong>
              </div>
              <div>
                <span>Visual style</span>
                <strong>Watercolor storybook</strong>
              </div>
              <div>
                <span>Estimated cost</span>
                <strong>$0 free stack</strong>
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Channel</span>
              <h2>Quick stats</h2>
            </div>

            <div className="stats-grid">
              <div>
                <strong>3</strong>
                <span>Videos</span>
              </div>
              <div>
                <strong>4.4k</strong>
                <span>Views</span>
              </div>
              <div>
                <strong>127</strong>
                <span>Subs</span>
              </div>
              <div>
                <strong>$0</strong>
                <span>Cost</span>
              </div>
            </div>
          </div>

          <div className="studio-card">
            <div className="section-head">
              <span className="section-label">Recent</span>
              <h2>Recent videos</h2>
            </div>

            <div className="recent-list">
              {recentVideos.map((item) => (
                <div key={item} className="recent-item">
                  {item}
                </div>
              ))}
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <Link href="/content" className="ui-btn ui-btn-secondary">
                View Content
              </Link>
              <Link href="/content" className="ui-btn ui-btn-primary">
                Generate Now
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}