"use client";

import { useState } from "react";
import { Task, Agent } from "@/lib/types";
import { Flag, ChevronDown } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "#6b7280",
  medium: "#4f8fff",
  high: "#eab308",
  critical: "#ef4444",
};

export default function ExpandableTaskCard({ task, agent }: { task: Task; agent?: Agent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg cursor-pointer hover:scale-[1.02] transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="p-3">
        <div className="flex items-start gap-1.5">
          {task.flag && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 animate-pulse"
              style={{ background: "#ef4444", boxShadow: "0 0 6px 1px rgba(239,68,68,0.5)" }}
              title="Waiting for user action"
            />
          )}
          <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            {task.title}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Flag size={10} style={{ color: priorityColors[task.priority] }} />
            <span className="text-[10px] capitalize" style={{ color: priorityColors[task.priority] }}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {task.content && (
              <ChevronDown
                size={12}
                className="transition-transform duration-200"
                style={{
                  color: "var(--text-secondary)",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            )}
            {agent && (
              <span className="text-xs" title={agent.name}>
                {agent.avatar}
              </span>
            )}
          </div>
        </div>
      </div>
      {expanded && task.content && (
        <div
          className="px-3 pb-3 text-[11px] leading-relaxed overflow-hidden animate-in fade-in"
          style={{
            color: "var(--text-secondary)",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-tertiary)",
            borderRadius: "0 0 0.5rem 0.5rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            paddingTop: "0.5rem",
          }}
        >
          {task.content}
        </div>
      )}
    </div>
  );
}
