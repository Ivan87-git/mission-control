
import { Task, Agent } from "@/lib/types";
import ExpandableTaskCard from "./ExpandableTaskCard";

const columns = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

export default function TaskBoard({ tasks, agents }: { tasks: Task[]; agents: Agent[] }) {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {col.label}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                {colTasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              {colTasks.map((task) => {
                const agent = agents.find((a) => a.id === task.assigned_agent);
                return <ExpandableTaskCard key={task.id} task={task} agent={agent} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
