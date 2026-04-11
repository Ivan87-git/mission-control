import { Task, TaskBoardStatus, TaskLifecycleStatus } from "@/lib/types";

export const TASK_STATUS_META: { id: TaskBoardStatus; label: string; color: string }[] = [
  { id: "funnel", label: "Funnel", color: "#7c3aed" },
  { id: "ideas", label: "Ideas", color: "#a855f7" },
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "assigned", label: "Assigned", color: "#38bdf8" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "blocked", label: "Blocked", color: "#f97316" },
  { id: "failed", label: "Failed", color: "#ef4444" },
  { id: "done", label: "Done", color: "#22c55e" },
];

export const TASK_LIFECYCLE_META: { id: TaskLifecycleStatus; label: string; color: string }[] = [
  { id: "pending", label: "Pending", color: "#7c3aed" },
  { id: "ready", label: "Ready", color: "#94a3b8" },
  { id: "active", label: "Active", color: "#4f8fff" },
  { id: "blocked", label: "Blocked", color: "#ef4444" },
  { id: "waiting_user", label: "Waiting User", color: "#f97316" },
  { id: "reviewing", label: "Reviewing", color: "#eab308" },
  { id: "completed", label: "Completed", color: "#22c55e" },
  { id: "cancelled", label: "Cancelled", color: "#6b7280" },
];

export const TASK_PRIORITY_META: { id: Task["priority"]; label: string; color: string }[] = [
  { id: "low", label: "Low", color: "#6b7280" },
  { id: "medium", label: "Medium", color: "#4f8fff" },
  { id: "high", label: "High", color: "#eab308" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

export function inferLifecycleStatus(status: TaskBoardStatus, flag?: string | null): TaskLifecycleStatus {
  if (flag === "red") return "waiting_user";
  switch (status) {
    case "funnel":
    case "ideas":
      return "pending";
    case "backlog":
      return "ready";
    case "assigned":
    case "in_progress":
      return "active";
    case "review":
      return "reviewing";
    case "blocked":
      return flag == "red" ? "waiting_user" : "blocked";
    case "failed":
      return "blocked";
    case "done":
      return "completed";
    default:
      return "pending";
  }
}

export function parseTaskContentMetadata(content?: string) {
  const metadata: { sourceLine: string | null; control: string | null } = { sourceLine: null, control: null };
  const noteLines: string[] = [];
  for (const line of (content || "").split("\n")) {
    if (line.startsWith("Source: ")) {
      metadata.sourceLine = line;
    } else if (line.startsWith("Control: ")) {
      metadata.control = line.split("Control: ", 2)[1]?.trim() || null;
    } else {
      noteLines.push(line);
    }
  }
  return { ...metadata, noteBody: noteLines.join("\n").trim() };
}
