import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/api";
import Layout from "../components/Layout";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await auth.requestPasswordReset(passwordResetEmail);
      setMessage("If that email is registered, a temporary password was sent.");
      setPasswordResetEmail("");
    } catch (err) {
      setError(err.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await auth.updatePassword(newPassword);
      setMessage("Password updated. You can use it next time you sign in.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1>Profile</h1>

      {user && (
        <div className="profile-card">
          <p><strong>Email</strong> {user.email}</p>
          <p><strong>Login</strong> {user.provider === "google" ? "Google" : "Email & password"}</p>
        </div>
      )}

      <section className="profile-section">
        <h2>Update password</h2>
        <p className="muted">Set a new password for email sign-in. (Google users can set a password to use both.)</p>
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleUpdatePassword}>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Forgot password?</h2>
        <p className="muted">Request a temporary password by email. You’ll need to change it after signing in.</p>
        <form onSubmit={handleRequestReset}>
          <label>
            Email
            <input
              type="email"
              value={passwordResetEmail}
              onChange={(e) => setPasswordResetEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <button type="submit" className="btn ghost" disabled={loading}>
            Send temporary password
          </button>
        </form>
      </section>
    </Layout>
  );
}
