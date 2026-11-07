import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { createAccount, getNamedAccounts } from "../api.js";
import { statusLabel } from "../format.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setAccounts(await getNamedAccounts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openAccount() {
    setOpening(true);
    setError("");
    try {
      await createAccount();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setOpening(false);
    }
  }

  const firstName = user.name.trim().split(" ")[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Accounts</h1>
          <p className="lead">Welcome back, {firstName}.</p>
        </div>
        <button type="button" className="btn" onClick={openAccount} disabled={opening}>
          {opening ? "Opening…" : "Open new account"}
        </button>
      </div>

      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status">Loading accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="empty">
          You don't have an account yet. Open your first account to start sending and receiving
          money.
        </p>
      ) : (
        <ul className="cards">
          {accounts.map((a) => (
            <li key={a._id} className="acct-card">
              <div className="acct-card-top">
                <h2>{a.name}</h2>
                <span className={`status status-${a.status.toLowerCase()}`}>
                  {statusLabel(a.status)}
                </span>
              </div>
              <p className="sub">{a.currency} account</p>

              <div className="acct-actions">
                <Link className="btn btn-small" to={`/accounts/${a._id}`}>
                  About account
                </Link>
                {a.status === "ACTIVE" && (
                  <Link className="btn btn-outline btn-small" to="/send" state={{ from: a._id }}>
                    Send money
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
