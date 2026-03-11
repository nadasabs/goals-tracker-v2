import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      await login(data.token);
      navigate("/goals", { replace: true });
    } catch (err) {
      const msg = err.message || (Array.isArray(err.data?.message) ? err.data.message.join(" ") : err.data?.message) || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-sub">Use your email or Google to continue.</p>

        {urlError === "google_failed" && (
          <div className="message error">Google sign-in failed. Try again or use email.</div>
        )}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <a href={auth.googleUrl()} className="btn-google">
          Continue with Google
        </a>

        <p className="auth-footer">
          No account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
