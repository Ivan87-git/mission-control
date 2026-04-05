
import { Agent } from "@/lib/types";
import { Cpu, Clock, CheckCircle2 } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "#22c55e",
  idle: "#eab308",
  offline: "#6b7280",
  error: "#ef4444",
};

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      className="rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${agent.status === "active" ? "rgba(79, 143, 255, 0.3)" : "var(--border)"}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{agent.avatar}</div>
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {agent.name}
            </div>
            <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <Cpu size={11} />
              {agent.model}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${agent.status === "active" ? "pulse-dot" : ""}`}
            style={{ background: statusColors[agent.status] || "#6b7280" }}
          />
          <span className="text-xs capitalize" style={{ color: statusColors[agent.status] || "#6b7280" }}>
            {agent.status}
          </span>
        </div>
      </div>

      {agent.current_task && (
        <div
          className="text-xs px-2.5 py-1.5 rounded-md mb-3 truncate"
          style={{ background: "rgba(79, 143, 255, 0.1)", color: "var(--accent-blue)" }}
        >
          ▸ {agent.current_task}
        </div>
      )}

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {agent.uptime}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} /> {agent.tasks_completed} done
        </span>
        <span>{formatTimeAgo(agent.last_seen)}</span>
      </div>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
