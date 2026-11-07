import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNamedAccounts, sendMoney } from "../api.js";
import { formatDate, formatMoney, groupId } from "../format.js";

// Your backend needs a unique idempotencyKey for every transfer. The same key
// sent twice is treated as the same transfer, which protects against double sends.
const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ID_PATTERN = /^[a-f0-9]{24}$/i;

// Accept numbers pasted with spaces, like "665f 1c2a b3d4 ...".
const cleanId = (value) => value.replace(/\s+/g, "");

export default function SendMoney() {
  const location = useLocation();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [form, setForm] = useState({
    fromAccount: location.state?.from || "",
    toAccount: "",
    amount: "",
  });
  const [key, setKey] = useState(newKey);
  const [step, setStep] = useState("form"); // form | review | sending | done
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    let active = true;
    getNamedAccounts()
      .then((list) => {
        if (!active) return;
        setAccounts(list);
        setForm((f) =>
          f.fromAccount
            ? f
            : { ...f, fromAccount: (list.find((a) => a.status === "ACTIVE") || list[0])?._id || "" }
        );
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoadingAccounts(false));
    return () => {
      active = false;
    };
  }, []);

  const from = accounts.find((a) => a._id === form.fromAccount);
  const toNumber = cleanId(form.toAccount);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // A changed transfer is a new transfer, so it gets a new key.
    // A retry without changes keeps the same key.
    setKey(newKey());
  }

  function validate() {
    if (!from) return "Choose an account to send from.";
    if (from.status !== "ACTIVE") return `${from.name} isn't active, so it can't send money.`;
    if (!ID_PATTERN.test(toNumber)) return "Enter the recipient's 24-character account number.";
    if (toNumber === from._id) return "Choose a different account to send to.";
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return "Enter an amount greater than zero.";
    return "";
  }

  function onReview(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setNotice("");
    setStep("review");
  }

  async function onConfirm() {
    setError("");
    setNotice("");
    setStep("sending");

    try {
      const data = await sendMoney({
        fromAccount: form.fromAccount,
        toAccount: toNumber,
        amount: Number(form.amount),
        idempotencyKey: key,
      });

      if (data.transaction) {
        setReceipt(data.transaction);
        setStep("done");
      } else {
        // e.g. "Transaction is still processing"
        setNotice(data.message || "Your transfer is still processing.");
        setStep("form");
      }
    } catch (err) {
      setError(
        /insufficient/i.test(err.message)
          ? "Your balance is too low for this transfer. Enter a smaller amount."
          : err.message
      );
      setStep("form");
    }
  }

  function sendAnother() {
    setForm((f) => ({ ...f, toAccount: "", amount: "" }));
    setKey(newKey());
    setReceipt(null);
    setNotice("");
    setError("");
    setStep("form");
  }

  if (step === "done" && receipt) {
    return (
      <div className="narrow">
        <h1>Money sent</h1>
        <p className="lead">Your transfer is complete.</p>
        <div className="panel">
          <dl className="details">
            <div className="row">
              <dt>Amount</dt>
              <dd className="figure">{formatMoney(receipt.amount, from?.currency)}</dd>
            </div>
            <div className="row">
              <dt>From</dt>
              <dd>{from?.name}</dd>
            </div>
            <div className="row">
              <dt>To account number</dt>
              <dd>{groupId(receipt.toAccount)}</dd>
            </div>
            <div className="row">
              <dt>Status</dt>
              <dd>{receipt.status}</dd>
            </div>
            <div className="row">
              <dt>Reference</dt>
              <dd>{receipt._id}</dd>
            </div>
            <div className="row">
              <dt>Date</dt>
              <dd>{formatDate(receipt.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="button-row">
          <button type="button" className="btn" onClick={sendAnother}>
            Send another
          </button>
          <Link className="btn btn-outline" to="/">
            Back to accounts
          </Link>
        </div>
      </div>
    );
  }

  if (step === "review" || step === "sending") {
    const sending = step === "sending";
    return (
      <div className="narrow">
        <h1>Review transfer</h1>
        <p className="lead">Check the details before you send.</p>
        <div className="panel">
          <dl className="details">
            <div className="row">
              <dt>From</dt>
              <dd>{from?.name}</dd>
            </div>
            <div className="row">
              <dt>To account number</dt>
              <dd>{groupId(toNumber)}</dd>
            </div>
            <div className="row">
              <dt>Amount</dt>
              <dd className="figure">{formatMoney(form.amount, from?.currency)}</dd>
            </div>
          </dl>
        </div>
        <div className="button-row">
          <button type="button" className="btn" onClick={onConfirm} disabled={sending}>
            {sending ? "Sending…" : "Confirm and send"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStep("form")}
            disabled={sending}
          >
            Edit
          </button>
        </div>
        {sending && (
          <p className="hint sending" role="status">
            This can take up to 15 seconds. Keep this page open.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="narrow">
      <h1>Send money</h1>
      <p className="lead">Transfer money from one of your accounts to any account number.</p>

      {loadingAccounts ? (
        <p role="status">Loading your accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="empty">
          You need an account before you can send money.{" "}
          <Link to="/">Open one on the Accounts page.</Link>
        </p>
      ) : (
        <form className="panel" onSubmit={onReview}>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}

          <div className="field">
            <label htmlFor="fromAccount">From account</label>
            <select id="fromAccount" name="fromAccount" value={form.fromAccount} onChange={onChange}>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="toAccount">To account number</label>
            <input
              id="toAccount"
              name="toAccount"
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={form.toAccount}
              onChange={onChange}
              required
            />
            <span className="hint">
              The recipient can copy their account number from About account.
            </span>
          </div>

          <div className="field">
            <label htmlFor="amount">Amount{from ? ` in ${from.currency}` : ""}</label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.amount}
              onChange={onChange}
              required
            />
          </div>

          <button className="btn btn-block" type="submit">
            Review transfer
          </button>
        </form>
      )}
    </div>
  );
}
