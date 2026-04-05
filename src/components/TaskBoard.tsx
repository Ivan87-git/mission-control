
import { Task, Agent, Project } from "@/lib/types";
import EpicGroup from "./EpicGroup";

const columns = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

export default function TaskBoard({
  tasks,
  agents,
  projects,
}: {
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
}) {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        // Group tasks by project
        const projectGroups = new Map<string | null, Task[]>();
        for (const task of colTasks) {
          const pid = task.project_id || null;
          if (!projectGroups.has(pid)) projectGroups.set(pid, []);
          projectGroups.get(pid)!.push(task);
        }

        // Sort: projects with tasks first (alphabetical), ungrouped last
        const sortedGroups = Array.from(projectGroups.entries()).sort(
          ([a], [b]) => {
            if (!a) return 1;
            if (!b) return -1;
            const pA = projects.find((p) => p.id === a);
            const pB = projects.find((p) => p.id === b);
            return (pA?.name || a).localeCompare(pB?.name || b);
          }
        );

        return (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: col.color }}
              />
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                {col.label}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                {colTasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {sortedGroups.map(([projectId, groupTasks]) => {
                const project = projectId
                  ? projects.find((p) => p.id === projectId)
                  : null;
                return (
                  <EpicGroup
                    key={projectId || "__ungrouped"}
                    project={project || null}
                    tasks={groupTasks}
                    agents={agents}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
