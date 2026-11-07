import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.status === 401 ? "Email or password is incorrect." : err.message);
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign in">
      <form className="panel" onSubmit={onSubmit}>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}

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
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Sign up</Link>
      </p>
    </AuthShell>
  );
}
