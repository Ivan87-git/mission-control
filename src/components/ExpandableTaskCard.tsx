"use client";

import { Task, Agent } from "@/lib/types";
import { Flag, GripVertical } from "lucide-react";

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
  isDragging = false,
}: {
  task: Task;
  agent?: Agent;
  onOpenTask?: (task: Task) => void;
  isDragging?: boolean;
}) {
  return (
    <div
      className="group rounded-lg cursor-pointer select-none transition-all duration-150"
      style={{
        background: isDragging ? "var(--bg-tertiary)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${priorityBorderColors[task.priority]}`,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? "none" : undefined,
      }}
      onClick={() => onOpenTask?.(task)}
    >
      <div className="px-3 py-2.5 flex items-start gap-2">
        {/* drag handle — visible on hover */}
        <div
          className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab"
          style={{ color: "var(--text-secondary)" }}
        >
          <GripVertical size={12} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-1.5">
            {task.flag && (
              <span
                className="inline-block w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse"
                style={{
                  background: "#ef4444",
                  boxShadow: "0 0 5px 1px rgba(239,68,68,0.5)",
                }}
                title="Waiting for user"
              />
            )}
            <span
              className="text-xs font-medium leading-relaxed line-clamp-2"
              style={{ color: "var(--text-primary)" }}
            >
              {task.title}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Flag size={9} style={{ color: priorityTextColors[task.priority] }} />
              <span
                className="text-[10px] capitalize"
                style={{ color: priorityTextColors[task.priority] }}
              >
                {task.priority}
              </span>
            </div>
            {agent && (
              <span
                className="text-[11px] leading-none"
                title={agent.name}
                style={{ opacity: 0.7 }}
              >
                {agent.avatar}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
