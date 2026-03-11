import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function GoalForm({ goal, onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState("not_started");
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || "");
      setDescription(goal.description || "");
      setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "");
      setStatus(goal.status || "not_started");
      setProgress(goal.progress ?? 0);
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setTargetDate(d.toISOString().slice(0, 10));
    }
  }, [goal]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        targetDate: new Date(targetDate).toISOString(),
        status,
        progress: Number(progress) || 0,
      });
    } catch (err) {
      setError(err.data?.message || (Array.isArray(err.data?.message) ? err.data.message.join(" ") : err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{goal ? "Edit goal" : "New goal"}</h2>
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Title *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run a 5k"
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              rows={2}
            />
          </label>
          <label>
            Target date *
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            Progress (0–100)
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving…" : goal ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
