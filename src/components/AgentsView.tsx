
"use client";
import { useState, useCallback } from "react";
import AgentCard from "./AgentCard";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function AgentsView() {
  const { data: agents } = useData(useCallback(() => api.getAgents(), []), 10000);
  const [filter, setFilter] = useState("all");

  if (!agents) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  const filtered = filter === "all" ? agents : agents.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Agents</h1>
        <div className="flex items-center gap-2">
          {["all", "active", "idle", "offline"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
              style={{
                background: filter === f ? "rgba(79, 143, 255, 0.15)" : "var(--bg-tertiary)",
                color: filter === f ? "var(--accent-blue)" : "var(--text-secondary)",
                border: `1px solid ${filter === f ? "rgba(79, 143, 255, 0.3)" : "var(--border)"}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
