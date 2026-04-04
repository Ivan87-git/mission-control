
import { Agent } from "@/lib/mock-data";
import { Cpu, Clock, CheckCircle2 } from "lucide-react";

const statusColors = {
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
            style={{ background: statusColors[agent.status] }}
          />
          <span className="text-xs capitalize" style={{ color: statusColors[agent.status] }}>
            {agent.status}
          </span>
        </div>
      </div>

      {agent.currentTask && (
        <div
          className="text-xs px-2.5 py-1.5 rounded-md mb-3 truncate"
          style={{ background: "rgba(79, 143, 255, 0.1)", color: "var(--accent-blue)" }}
        >
          ▸ {agent.currentTask}
        </div>
      )}

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {agent.uptime}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} /> {agent.tasksCompleted} done
        </span>
        <span>{agent.lastSeen}</span>
      </div>
    </div>
  );
}
