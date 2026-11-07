import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  // The Accounts link stays highlighted on an account's own page too.
  const onAccounts = pathname === "/" || pathname.startsWith("/accounts");
  const onSend = pathname.startsWith("/send");

  return (
    <div className="shell">
      <aside className="sidebar">
        <span className="wordmark">Ledger</span>

        <nav className="sidenav" aria-label="Main">
          <Link
            to="/"
            className={onAccounts ? "active" : undefined}
            aria-current={onAccounts ? "page" : undefined}
          >
            Accounts
          </Link>
          <Link
            to="/send"
            className={onSend ? "active" : undefined}
            aria-current={onSend ? "page" : undefined}
          >
            Send money
          </Link>
        </nav>

        <div className="sidebar-user">
          <p className="user-name">{user.name}</p>
          <p className="user-email">{user.email}</p>
          <button type="button" className="signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
