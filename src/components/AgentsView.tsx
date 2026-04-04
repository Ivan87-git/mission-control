
import AgentCard from "./AgentCard";
import { agents } from "@/lib/mock-data";

export default function AgentsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Agents</h1>
        <div className="flex items-center gap-2">
          {["all", "active", "idle", "offline"].map((f) => (
            <button
              key={f}
              className="text-xs px-3 py-1.5 rounded-lg capitalize"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
