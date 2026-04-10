
"use client";
import { useCallback, useState } from "react";
import StatsBar from "./StatsBar";
import AgentCard from "./AgentCard";
import ProjectCard from "./ProjectCard";
import ProjectDetailModal from "./ProjectDetailModal";
import ActivityFeed from "./ActivityFeed";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { Project } from "@/lib/types";

export default function DashboardView() {
  const { data: stats } = useData(useCallback(() => api.getStats(), []), 10000);
  const { data: agents } = useData(useCallback(() => api.getAgents(), []), 10000);
  const { data: projects } = useData(useCallback(() => api.getProjects(), []), 10000);
  const { data: activities } = useData(useCallback(() => api.getActivity(10), []), 5000);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!stats || !agents || !projects || !activities) {
    return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;
  }

  const activeAgents = agents.filter((a) => a.status === "active");

  return (
    <div className="space-y-6">
      <StatsBar stats={stats} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Active Agents
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full pulse-dot" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
              {activeAgents.length} online
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Live Activity
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
              <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>LIVE</span>
            </div>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <ActivityFeed items={activities} compact />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
          Projects
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} agents={agents} onOpen={setSelectedProject} />
          ))}
        </div>
      </div>
      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
