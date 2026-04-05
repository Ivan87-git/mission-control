
"use client";
import { useCallback } from "react";
import TaskBoard from "./TaskBoard";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function TasksView() {
  const { data: tasks } = useData(useCallback(() => api.getTasks(), []), 10000);
  const { data: agents } = useData(useCallback(() => api.getAgents(), []), 10000);

  if (!tasks || !agents) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Task Board</h1>
        <button className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "var(--accent-blue)", color: "white" }}>
          + New Task
        </button>
      </div>
      <TaskBoard tasks={tasks} agents={agents} />
    </div>
  );
}
