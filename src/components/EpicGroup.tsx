"use client";

import { useState } from "react";
import { Task, Agent, Project } from "@/lib/types";
import { ChevronRight, Layers } from "lucide-react";
import ExpandableTaskCard from "./ExpandableTaskCard";

export default function EpicGroup({
  project,
  tasks,
  agents,
  onOpenTask,
}: {
  project: Project | null;
  tasks: Task[];
  agents: Agent[];
  onOpenTask?: (task: Task) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasFlag = tasks.some((t) => t.flag);

  // Ungrouped tasks (no project) — render flat, no epic header
  if (!project) {
    return (
      <div className="space-y-2">
        {tasks.map((task) => {
          const agent = agents.find((a) => a.id === task.assigned_agent);
          return (
            <ExpandableTaskCard
              key={task.id}
              task={task}
              agent={agent}
              onOpenTask={onOpenTask}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      {/* Epic header */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 cursor-pointer select-none hover:brightness-110 transition-all"
        style={{
          background: `${project.color}12`,
          borderBottom: collapsed ? "none" : "1px solid var(--border)",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <ChevronRight
          size={11}
          className="transition-transform duration-200 flex-shrink-0"
          style={{
            color: project.color,
            transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
          }}
        />
        <Layers size={10} style={{ color: project.color }} className="flex-shrink-0" />
        <span
          className="text-[11px] font-semibold truncate"
          style={{ color: project.color }}
        >
          {project.name}
        </span>
        {hasFlag && (
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{
              background: "#ef4444",
              boxShadow: "0 0 4px 1px rgba(239,68,68,0.4)",
            }}
          />
        )}
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks inside epic */}
      {!collapsed && (
        <div className="p-1.5 space-y-1.5">
          {tasks.map((task) => {
            const agent = agents.find((a) => a.id === task.assigned_agent);
            return (
              <ExpandableTaskCard
                key={task.id}
                task={task}
                agent={agent}
                onOpenTask={onOpenTask}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
