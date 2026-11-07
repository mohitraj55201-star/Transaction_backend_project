import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBalance, getNamedAccounts } from "../api.js";
import { formatDate, formatMoney, groupId, statusLabel } from "../format.js";

export default function AccountDetails() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing | error
  const [error, setError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setBalance(null);
    setBalanceError("");
    try {
      const accounts = await getNamedAccounts();
      const found = accounts.find((a) => a._id === id);
      if (!found) {
        setState("missing");
        return;
      }
      setAccount(found);
      setState("ready");

      // The balance is fetched here, and only here, when the user opens About account.
      try {
        setBalance((await getBalance(id)).balance);
      } catch (err) {
        setBalanceError(err.message);
      }
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyNumber() {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(account._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Couldn't copy the number. Select it and copy it by hand.");
    }
  }

  if (state === "loading") {
    return <p role="status">Loading account…</p>;
  }

  if (state === "error") {
    return (
      <>
        <p className="notice error" role="alert">
          {error}
        </p>
        <button type="button" className="btn" onClick={load}>
          Try again
        </button>
      </>
    );
  }

  if (state === "missing") {
    return (
      <>
        <h1>Account not found</h1>
        <p className="lead">This account doesn't exist, or it isn't yours.</p>
        <Link className="btn" to="/">
          Back to accounts
        </Link>
      </>
    );
  }

  return (
    <>
      <Link className="back" to="/">
        Back to accounts
      </Link>

      <div className="page-head">
        <div>
          <h1>{account.name}</h1>
          <p className="lead">
            <span className={`status status-${account.status.toLowerCase()}`}>
              {statusLabel(account.status)}
            </span>
          </p>
        </div>
        {account.status === "ACTIVE" && (
          <Link className="btn" to="/send" state={{ from: account._id }}>
            Send money
          </Link>
        )}
      </div>

      <section className="panel balance-panel" aria-labelledby="balance-label">
        <p className="label" id="balance-label">
          Available balance
        </p>
        {balanceError ? (
          <>
            <p className="notice error" role="alert">
              {balanceError}
            </p>
            <button type="button" className="btn btn-outline btn-small" onClick={load}>
              Try again
            </button>
          </>
        ) : balance === null ? (
          <p className="balance" role="status">
            Loading…
          </p>
        ) : (
          <p className="balance">{formatMoney(balance, account.currency)}</p>
        )}
      </section>

      <section className="panel" aria-label="Account information">
        {copyError && (
          <p className="notice error" role="alert">
            {copyError}
          </p>
        )}
        <dl className="details">
          <div className="row">
            <dt>Account number</dt>
            <dd className="number-cell">
              <span className="acct-number">{groupId(account._id)}</span>
              <button type="button" className="btn btn-outline btn-small" onClick={copyNumber}>
                {copied ? "Copied" : "Copy number"}
              </button>
            </dd>
          </div>
          <div className="row">
            <dt>Currency</dt>
            <dd>{account.currency}</dd>
          </div>
          <div className="row">
            <dt>Opened on</dt>
            <dd>{formatDate(account.createdAt)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
