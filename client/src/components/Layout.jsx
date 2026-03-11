import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="header">
        <Link to="/goals" className="logo">Goals</Link>
        <nav>
          <Link to="/goals">Goals</Link>
          <Link to="/profile">Profile</Link>
          <span className="user-email">{user?.email}</span>
          <button type="button" className="btn ghost" onClick={handleLogout}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </>
  );
}
