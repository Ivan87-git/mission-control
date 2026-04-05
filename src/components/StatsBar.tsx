
import { Stats } from "@/lib/types";
import { Bot, FolderKanban, ListTodo, Zap } from "lucide-react";

export default function StatsBar({ stats }: { stats: Stats }) {
  const items = [
    { label: "Active Agents", value: `${stats.active_agents}/${stats.total_agents}`, icon: Bot, color: "#22c55e" },
    { label: "Projects", value: stats.active_projects.toString(), icon: FolderKanban, color: "#4f8fff" },
    { label: "In Progress", value: stats.in_progress_tasks.toString(), icon: ListTodo, color: "#eab308" },
    { label: "Total Completed", value: (stats.total_completed || 0).toLocaleString(), icon: Zap, color: "#a855f7" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((stat) => (
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
