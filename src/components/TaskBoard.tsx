"use client";

import { Task, Agent, Project } from "@/lib/types";
import ExpandableTaskCard from "./ExpandableTaskCard";

const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "funnel", label: "Funnel", color: "#7c3aed" },
  { id: "ideas", label: "Ideas", color: "#a855f7" },
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

function Column({
  col,
  tasks,
  agents,
  projects,
  onOpenTask,
}: {
  col: (typeof COLUMNS)[number];
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
}) {
  const projectGroups = new Map<string | null, Task[]>();
  for (const task of tasks) {
    const pid = task.project_id || null;
    if (!projectGroups.has(pid)) projectGroups.set(pid, []);
    projectGroups.get(pid)!.push(task);
  }

  const sortedGroups = Array.from(projectGroups.entries()).sort(([a], [b]) => {
    if (!a) return 1;
    if (!b) return -1;
    const pA = projects.find((p) => p.id === a);
    const pB = projects.find((p) => p.id === b);
    return (pA?.name || a).localeCompare(pB?.name || b);
  });

  return (
    <div className="flex flex-col min-w-[280px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          {col.label}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
          style={{
            background: tasks.length > 0 ? `${col.color}20` : "var(--bg-tertiary)",
            color: tasks.length > 0 ? col.color : "var(--text-secondary)",
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        className="flex-1 rounded-xl"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          minHeight: "120px",
          padding: "10px",
        }}
      >
        {tasks.length === 0 ? (
          <div
            className="flex items-center justify-center h-16 rounded-lg text-xs"
            style={{
              border: "1px dashed var(--border)",
              color: "var(--text-secondary)",
              opacity: 0.5,
            }}
          >
            No tasks
          </div>
        ) : (
          <div className="space-y-2">
            {sortedGroups.map(([projectId, groupTasks]) => {
              const project = projectId ? projects.find((p) => p.id === projectId) : null;
              if (!project) {
                return groupTasks.map((task) => {
                  const agent = agents.find((a) => a.id === task.assigned_agent);
                  return <ExpandableTaskCard key={task.id} task={task} agent={agent} onOpenTask={onOpenTask} />;
                });
              }

              return (
                <div
                  key={projectId}
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <div
                    className="flex items-center gap-2 px-2.5 py-2"
                    style={{ background: `${project.color}10`, borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: project.color }} />
                    <span className="text-[11px] font-semibold truncate" style={{ color: project.color }}>
                      {project.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                    >
                      {groupTasks.length}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1.5">
                    {groupTasks.map((task) => {
                      const agent = agents.find((a) => a.id === task.assigned_agent);
                      return <ExpandableTaskCard key={task.id} task={task} agent={agent} onOpenTask={onOpenTask} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard({
  tasks,
  agents,
  projects,
  onOpenTask,
}: {
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(280px, 1fr))` }}
      >
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            col={col}
            tasks={tasks.filter((task) => task.status === col.id)}
            agents={agents}
            projects={projects}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
    </div>
  );
}
