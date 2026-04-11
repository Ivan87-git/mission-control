"use client";

import { useCallback, useMemo, useState } from "react";
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

  const planEditorTask = useMemo(
    () => tasks?.find((task) => task.content?.includes("Control: plan-editor")) || null,
    [tasks],
  );

  if (!tasks || !agents || !projects) {
    return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;
  }

  function handleTaskUpdated() {
    refreshTasks();
  }

  const waitingCount = tasks.filter((task) => task.lifecycle_status === "waiting_user" || task.waiting_for_input).length;
  const activeCount = tasks.filter((task) => task.lifecycle_status === "active").length;

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Task Board
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {tasks.length} tasks · {activeCount} active · {waitingCount} waiting for input · board is derived from the vault
          </p>
        </div>
        <button
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--accent-blue)", color: "white" }}
          onClick={() => planEditorTask && setSelectedTask(planEditorTask)}
          disabled={!planEditorTask}
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
