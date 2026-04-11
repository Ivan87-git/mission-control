"use client";

import { useCallback, useState } from "react";
import TaskBoard from "./TaskBoard";
import TaskDetailModal from "./TaskDetailModal";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { Task } from "@/lib/types";

export default function TasksView() {
  const { data: tasks, refresh: refreshTasks } = useData(useCallback(() => api.getTasks(), []), 10000);
  const { data: agents } = useData(useCallback(() => api.getAgents(), []), 10000);
  const { data: projects } = useData(useCallback(() => api.getProjects(), []), 10000);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!tasks || !agents || !projects)
    return (
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Loading...
      </div>
    );

  function handleTaskUpdated(_updated?: Task) {
    refreshTasks();
  }

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Task Board
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {tasks.length} tasks · board is derived from the vault · funnel items are not dispatch-ready yet
          </p>
        </div>
        <button
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--accent-blue)", color: "white" }}
        >
          Open Spec
        </button>
      </div>

      <TaskBoard tasks={tasks} agents={agents} projects={projects} onOpenTask={setSelectedTask} />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          agents={agents}
          projects={projects}
          onClose={() => setSelectedTask(null)}
          onSaved={() => handleTaskUpdated()}
        />
      )}
    </div>
  );
}
