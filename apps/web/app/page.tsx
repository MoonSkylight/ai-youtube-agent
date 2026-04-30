export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 40, marginBottom: 16 }}>
          🚀 AI YouTube Agent
        </h1>

        <p style={{ marginBottom: 24, color: "#94a3b8" }}>
          Generate scripts, create videos, and upload to YouTube
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/login">
            <button>Login</button>
          </a>

          <a href="/signup">
            <button>Create Account</button>
          </a>
        </div>
      </div>
    </div>
  );
}