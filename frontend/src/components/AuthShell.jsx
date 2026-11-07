// The split layout shared by the sign in and sign up pages.
export default function AuthShell({ title, children }) {
  return (
    <div className="auth-split">
      <aside className="auth-aside">
        <p className="wordmark">Ledger</p>
        <p className="auth-line">Open accounts, check balances and send money in a few steps.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-box">
          <h1>{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
