export default function AdminLoginPage() {
  return (
    <main className="login-card card">
      <div className="form-stack">
        <span className="kicker">Secure admin login</span>
        <h1>Editorial Dashboard</h1>
        <p className="muted-text">Use the seeded admin account or your configured credentials to manage generated sports drafts.</p>
        <form action="/api/admin/login" method="post" className="form-stack">
          <input className="input" type="email" name="email" placeholder="Admin email" required />
          <input className="input" type="password" name="password" placeholder="Password" required />
          <button className="button button-primary" type="submit">Login</button>
        </form>
      </div>
    </main>
  );
}
