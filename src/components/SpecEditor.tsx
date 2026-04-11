"use client";

import { useEffect, useMemo, useState } from "react";
import { Task, TaskBoardStatus } from "@/lib/types";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/task-meta";

type ActionType = "ADD" | "UPDATE" | "REMOVE";

function joinCommand(parts: Array<[string, string | null | undefined]>) {
  return parts
    .filter(([, value]) => typeof value === "string" && value.trim())
    .map(([key, value]) => (key ? `${key}=${value!.trim()}` : value!.trim()))
    .join(" | ");
}

export default function SpecEditor({
  task,
  value,
  onChange,
}: {
  task: Task;
  value: string;
  onChange: (command: string) => void;
}) {
  const [action, setAction] = useState<ActionType>("ADD");
  const [match, setMatch] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState<TaskBoardStatus>("backlog");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [tags, setTags] = useState("dispatch");

  const command = useMemo(() => {
    if (action === "ADD") {
      return joinCommand([
        ["", "ADD"],
        ["status", status],
        ["priority", priority],
        ["tags", tags],
        ["title", title],
        ["detail", detail],
      ]);
    }
    if (action === "UPDATE") {
      return joinCommand([
        ["", "UPDATE"],
        ["match", match],
        ["status", status],
        ["priority", priority],
        ["tags", tags],
        ["title", title],
        ["detail", detail],
      ]);
    }
    return joinCommand([
      ["", "REMOVE"],
      ["match", match],
    ]);
  }, [action, detail, match, priority, status, tags, title]);

  useEffect(() => {
    if (!value.trim() || value === command || value.startsWith("ADD |") || value.startsWith("UPDATE |") || value.startsWith("REMOVE |")) {
      onChange(command);
    }
  }, [command, onChange, value]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Field label="Action">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionType)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={fieldStyle}
          >
            <option value="ADD">ADD</option>
            <option value="UPDATE">UPDATE</option>
            <option value="REMOVE">REMOVE</option>
          </select>
        </Field>

        {action !== "ADD" && (
          <Field label="Match existing task">
            <input value={match} onChange={(e) => setMatch(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle} placeholder="task title fragment" />
          </Field>
        )}

        {action !== "REMOVE" && (
          <>
            <Field label="Board status">
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskBoardStatus)} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle}>
                {TASK_STATUS_META.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle}>
                {TASK_PRIORITY_META.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </Field>
          </>
        )}
      </div>

      {action !== "REMOVE" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <Field label={action === "ADD" ? "Title" : "Replacement title (optional)"}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle} placeholder={action === "ADD" ? "New plan item" : "Leave blank to keep title"} />
          </Field>
          <Field label="Tags">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle} placeholder="dispatch, backend" />
          </Field>
        </div>
      )}

      {action !== "REMOVE" && (
        <Field label="Detail">
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full min-h-20 rounded-lg px-3 py-2 text-sm resize-y" style={fieldStyle} placeholder="Short implementation detail or acceptance cue" />
        </Field>
      )}

      <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div style={{ color: "var(--text-secondary)" }}>Generated command for {task.title}</div>
        <div className="font-mono break-all" style={{ color: "var(--text-primary)" }}>{command || "Fill in the form to generate a command"}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {children}
    </label>
  );
}

const fieldStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
} as const;
