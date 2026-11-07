import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      setError(
        err.status === 422
          ? "That email is already registered. Sign in instead."
          : err.message
      );
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign up">
      <form className="panel" onSubmit={onSubmit}>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={form.password}
            onChange={onChange}
            required
          />
          <span className="hint">Use at least 6 characters.</span>
        </div>

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
