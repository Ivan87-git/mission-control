
import { agents, projects, tasks } from "@/lib/mock-data";
import { Bot, FolderKanban, ListTodo, Zap } from "lucide-react";

export default function StatsBar() {
  const activeAgents = agents.filter((a) => a.status === "active").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const totalCompleted = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  const stats = [
    { label: "Active Agents", value: `${activeAgents}/${agents.length}`, icon: Bot, color: "#22c55e" },
    { label: "Projects", value: activeProjects.toString(), icon: FolderKanban, color: "#4f8fff" },
    { label: "In Progress", value: inProgressTasks.toString(), icon: ListTodo, color: "#eab308" },
    { label: "Total Completed", value: totalCompleted.toLocaleString(), icon: Zap, color: "#a855f7" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${stat.color}15` }}
          >
            <stat.icon size={18} style={{ color: stat.color }} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
