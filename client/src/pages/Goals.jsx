import { useState, useEffect } from "react";
import { goals as goalsApi } from "../lib/api";
import Layout from "../components/Layout";
import GoalForm from "../components/GoalForm";

const STATUS_LABELS = { not_started: "Not started", in_progress: "In progress", completed: "Completed" };

export default function Goals() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await goalsApi.list();
      setList(data);
    } catch (err) {
      setError(err.data?.message || err.message || "Could not load goals");
      if (err.status === 403) setError("Please update your password first (Profile → Update password).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this goal?")) return;
    try {
      await goalsApi.delete(id);
      setList((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(err.data?.message || err.message);
    }
  }

  function openEdit(goal) {
    setEditing(goal);
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  async function handleSave(payload) {
    try {
      if (editing) {
        const updated = await goalsApi.update(editing._id, payload);
        setList((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      } else {
        const created = await goalsApi.create(payload);
        setList((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      throw err;
    }
  }

  return (
    <Layout>
      <div className="goals-header">
        <h1>Goals</h1>
        <button type="button" className="btn primary" onClick={() => setShowForm(true)}>
          Add goal
        </button>
      </div>

      {error && (
        <div className="message error" onAnimationEnd={() => setError("")}>
          {error}
        </div>
      )}

      {showForm && (
        <GoalForm
          goal={editing}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <p className="muted">Loading goals…</p>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <p>No goals yet.</p>
          <button type="button" className="btn primary" onClick={() => setShowForm(true)}>
            Add your first goal
          </button>
        </div>
      ) : (
        <ul className="goal-list">
          {list.map((goal) => (
            <li key={goal._id} className="goal-card">
              <div className="goal-main">
                <h3>{goal.title}</h3>
                {goal.description && <p className="goal-desc">{goal.description}</p>}
                <div className="goal-meta">
                  <span className="badge">{STATUS_LABELS[goal.status] || goal.status}</span>
                  <span className="muted">Due {new Date(goal.targetDate).toLocaleDateString()}</span>
                  {goal.progress != null && goal.progress > 0 && (
                    <span className="progress-text">{goal.progress}%</span>
                  )}
                </div>
              </div>
              <div className="goal-actions">
                <button type="button" className="btn ghost" onClick={() => openEdit(goal)}>
                  Edit
                </button>
                <button type="button" className="btn ghost danger" onClick={() => handleDelete(goal._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
