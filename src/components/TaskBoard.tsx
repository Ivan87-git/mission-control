
import { tasks as allTasks, agents as allAgents } from "@/lib/mock-data";
import { Flag } from "lucide-react";

const columns = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

const priorityColors = {
  low: "#6b7280",
  medium: "#4f8fff",
  high: "#eab308",
  critical: "#ef4444",
};

export default function TaskBoard({ projectFilter }: { projectFilter?: string }) {
  const filtered = projectFilter
    ? allTasks.filter((t) => t.projectId === projectFilter)
    : allTasks;

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map((col) => {
        const colTasks = filtered.filter((t) => t.status === col.id);
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
                const agent = allAgents.find((a) => a.id === task.assignedAgent);
                return (
                  <div
                    key={task.id}
                    className="rounded-lg p-3 cursor-pointer hover:scale-[1.02] transition-all"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="text-xs font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                      {task.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Flag size={10} style={{ color: priorityColors[task.priority] }} />
                        <span className="text-[10px] capitalize" style={{ color: priorityColors[task.priority] }}>
                          {task.priority}
                        </span>
                      </div>
                      {agent && (
                        <span className="text-xs" title={agent.name}>
                          {agent.avatar}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
