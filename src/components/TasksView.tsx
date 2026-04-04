
import TaskBoard from "./TaskBoard";

export default function TasksView() {
  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Task Board</h1>
        <button
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: "var(--accent-blue)", color: "white" }}
        >
          + New Task
        </button>
      </div>
      <TaskBoard />
    </div>
  );
}
