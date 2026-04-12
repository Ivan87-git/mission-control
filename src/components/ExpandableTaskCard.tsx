"use client";

import { Task, Agent } from "@/lib/types";
import { Flag } from "lucide-react";
import { TASK_LIFECYCLE_META } from "@/lib/task-meta";

const priorityBorderColors: Record<string, string> = {
  low: "#4b5563",
  medium: "#4f8fff",
  high: "#eab308",
  critical: "#ef4444",
};

const priorityTextColors: Record<string, string> = {
  low: "#6b7280",
  medium: "#4f8fff",
  high: "#eab308",
  critical: "#ef4444",
};

export default function ExpandableTaskCard({
  task,
  agent,
  onOpenTask,
}: {
  task: Task;
  agent?: Agent;
  onOpenTask?: (task: Task) => void;
}) {
  const lifecycle = TASK_LIFECYCLE_META.find((item) => item.id === task.lifecycle_status);

  return (
    <div
      className="group rounded-lg cursor-pointer select-none transition-all duration-150 hover:brightness-110"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${priorityBorderColors[task.priority]}`,
      }}
      onClick={() => onOpenTask?.(task)}
    >
      <div className="px-3 py-2.5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            {(task.flag || task.waiting_for_input) && (
              <span
                className="inline-block w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse"
                style={{ background: "#ef4444", boxShadow: "0 0 5px 1px rgba(239,68,68,0.5)" }}
                title="Waiting for user"
              />
            )}
            <span className="text-xs font-medium leading-relaxed line-clamp-2" style={{ color: "var(--text-primary)" }}>
              {task.title}
            </span>
          </div>

          {(task.last_error || task.unblock_condition) && (
            <div className="mt-2 space-y-1">
              {task.last_error && (
                <div className="text-[11px] line-clamp-2" style={{ color: task.status === "failed" ? "#fca5a5" : "#fdba74" }}>
                  Why blocked: {task.last_error}
                </div>
              )}
              {task.unblock_condition && (
                <div className="text-[11px] line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  Runs again when: {task.unblock_condition}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Flag size={9} style={{ color: priorityTextColors[task.priority] }} />
                <span className="text-[10px] capitalize" style={{ color: priorityTextColors[task.priority] }}>
                  {task.priority}
                </span>
              </div>
              {lifecycle && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: `${lifecycle.color}20`, color: lifecycle.color }}>
                  {lifecycle.label}
                </span>
              )}
            </div>
            {agent && (
              <span className="text-[11px] leading-none" title={agent.name} style={{ opacity: 0.7 }}>
                {agent.avatar}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
