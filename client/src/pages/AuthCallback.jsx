import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      return;
    }
    let cancelled = false;
    login(token)
      .then(() => !cancelled && navigate("/goals", { replace: true }))
      .catch(() => !cancelled && setError("Sign-in failed"));
    return () => { cancelled = true; };
  }, [token, login, navigate]);

  if (error) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <p className="message error">{error}</p>
          <a href="/login">Back to sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <p>Completing sign-in…</p>
      </div>
    </div>
  );
}
