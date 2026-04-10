
import { Project, Agent } from "@/lib/types";
import { Users, ListTodo } from "lucide-react";

export default function ProjectCard({ project, agents, onOpen }: { project: Project; agents?: Agent[]; onOpen?: (project: Project) => void }) {
  const agentIds = Array.isArray(project.agent_ids) ? project.agent_ids : [];
  const projectAgents = agents ? agents.filter((a) => agentIds.includes(a.id)) : [];

  const statusBadge: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" },
    paused: { bg: "rgba(234, 179, 8, 0.15)", color: "#eab308" },
    completed: { bg: "rgba(79, 143, 255, 0.15)", color: "#4f8fff" },
  };

  const badge = statusBadge[project.status] || statusBadge.active;

  return (
    <div
      className="rounded-xl p-5 transition-all hover:scale-[1.01] cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${project.color}`,
      }}
      onClick={() => onOpen?.(project)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {project.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {project.description}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize"
          style={{ background: badge.bg, color: badge.color }}
        >
          {project.status}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-primary)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${project.progress}%`, background: project.color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
        <div className="flex items-center gap-1">
          <Users size={12} />
          <div className="flex -space-x-1">
            {projectAgents.map((a) => (
              <span key={a.id} title={a.name}>{a.avatar}</span>
            ))}
            {projectAgents.length === 0 && <span>No agents</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ListTodo size={12} />
          {project.completed_tasks}/{project.task_count} tasks
        </div>
      </div>
    </div>
  );
}
