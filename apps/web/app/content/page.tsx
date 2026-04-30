<div style={{ display: "flex", gap: 12 }}>
  <a href="/">
    <button>Home</button>
  </a>

  <form action="/api/auth/logout" method="POST">
    <button type="submit">Logout</button>
  </form>
</div>