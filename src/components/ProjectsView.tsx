
"use client";
import { useCallback } from "react";
import ProjectCard from "./ProjectCard";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function ProjectsView() {
  const { data: projects } = useData(useCallback(() => api.getProjects(), []), 10000);
  const { data: agents } = useData(useCallback(() => api.getAgents(), []), 10000);

  if (!projects) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Projects</h1>
        <button className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "var(--accent-blue)", color: "white" }}>
          + New Project
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} agents={agents || []} />
        ))}
      </div>
    </div>
  );
}
