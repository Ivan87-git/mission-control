"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task, Agent, Project } from "@/lib/types";
import EpicGroup from "./EpicGroup";
import ExpandableTaskCard from "./ExpandableTaskCard";
import { api } from "@/lib/api";

const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

// ── Droppable column shell ────────────────────────────────────────────────────

function DroppableColumn({
  colId,
  color,
  isOver,
  isEmpty,
  children,
}: {
  colId: string;
  color: string;
  isOver: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex-1 rounded-xl transition-all duration-150"
      style={{
        background: isOver ? `${color}08` : "var(--bg-secondary)",
        border: isOver ? `1px dashed ${color}60` : "1px solid var(--border)",
        minHeight: "120px",
        padding: "10px",
      }}
    >
      {isEmpty && !isOver ? (
        <div
          className="flex items-center justify-center h-16 rounded-lg text-xs"
          style={{
            border: "1px dashed var(--border)",
            color: "var(--text-secondary)",
            opacity: 0.5,
          }}
        >
          Drop here
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

// ── Draggable task card ───────────────────────────────────────────────────────

function DraggableCard({
  task,
  agents,
  onOpenTask,
}: {
  task: Task;
  agents: Agent[];
  onOpenTask: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0 : 1, // hide original — DragOverlay shows the copy
  };

  const agent = agents.find((a) => a.id === task.assigned_agent);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ExpandableTaskCard task={task} agent={agent} onOpenTask={onOpenTask} />
    </div>
  );
}

// ── Column with droppable zone ────────────────────────────────────────────────

function KanbanColumn({
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
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  // group by project
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
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: col.color }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
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

      {/* Droppable area */}
      <div ref={setNodeRef} className="flex-1">
        <DroppableColumn
          colId={col.id}
          color={col.color}
          isOver={isOver}
          isEmpty={tasks.length === 0}
        >
          {sortedGroups.map(([projectId, groupTasks]) => {
            const project = projectId ? projects.find((p) => p.id === projectId) : null;

            if (!project) {
              return groupTasks.map((task) => (
                <DraggableCard
                  key={task.id}
                  task={task}
                  agents={agents}
                  onOpenTask={onOpenTask}
                />
              ));
            }

            return (
              <div
                key={projectId}
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                {/* Epic header (non-interactive for DnD purposes, collapse handled inside) */}
                <EpicGroupHeader project={project} count={groupTasks.length} />

                <div className="p-1.5 space-y-1.5">
                  {groupTasks.map((task) => (
                    <DraggableCard
                      key={task.id}
                      task={task}
                      agents={agents}
                      onOpenTask={onOpenTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </DroppableColumn>
      </div>
    </div>
  );
}

// Simple non-collapsible epic header for DnD board (collapse would break DnD)
function EpicGroupHeader({ project, count }: { project: Project; count: number }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2"
      style={{
        background: `${project.color}10`,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="w-2 h-2 rounded-sm flex-shrink-0"
        style={{ background: project.color }}
      />
      <span
        className="text-[11px] font-semibold truncate"
        style={{ color: project.color }}
      >
        {project.name}
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0"
        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
      >
        {count}
      </span>
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function TaskBoard({
  tasks: initialTasks,
  agents,
  projects,
  onOpenTask,
  onTaskUpdated,
}: {
  tasks: Task[];
  agents: Agent[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync if parent refreshes
  // (useEffect-free: parent passes new tasks on each render; local state overrides)
  // For DnD we need local state for optimistic updates.
  // Keep local tasks in sync with prop when not mid-drag.
  const [dragging, setDragging] = useState(false);
  const syncedTasks = dragging ? tasks : initialTasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // must move 8px before drag starts → clicks still work
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = initialTasks.find((t) => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
        setDragging(true);
      }
    },
    [initialTasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      setDragging(false);

      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as Task["status"];
      const task = initialTasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      // Optimistic update
      const updated = { ...task, status: newStatus };
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

      try {
        const saved = await api.updateTask(taskId, { status: newStatus });
        onTaskUpdated(saved);
      } catch (e) {
        console.error("Failed to update task status", e);
        // revert
        setTasks(initialTasks);
      }
    },
    [initialTasks, onTaskUpdated]
  );

  const activeAgent = activeTask
    ? agents.find((a) => a.id === activeTask.assigned_agent)
    : undefined;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = syncedTasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              col={col}
              tasks={colTasks}
              agents={agents}
              projects={projects}
              onOpenTask={onOpenTask}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTask ? (
          <div style={{ width: "240px", pointerEvents: "none", opacity: 0.95 }}>
            <ExpandableTaskCard
              task={activeTask}
              agent={activeAgent}
              onOpenTask={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
