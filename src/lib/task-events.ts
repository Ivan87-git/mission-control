import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import { inferLifecycleStatus } from "@/lib/task-meta";
import { Task, TaskBoardStatus, TaskEventType, TaskLifecycleStatus } from "@/lib/types";

type TaskRow = Pick<
  Task,
  | "id"
  | "status"
  | "lifecycle_status"
  | "flag"
  | "waiting_for_input"
  | "started_at"
  | "blocked_at"
  | "completed_at"
  | "waiting_for_input_at"
  | "last_event_at"
  | "run_id"
>;

export interface TaskPatchInput {
  status?: TaskBoardStatus;
  lifecycle_status?: TaskLifecycleStatus;
  flag?: string | null;
  run_id?: string | null;
}

export interface TaskEventInput {
  taskId: string;
  actor?: string | null;
  eventType: TaskEventType;
  note?: string | null;
  fromBoardStatus?: TaskBoardStatus | null;
  toBoardStatus?: TaskBoardStatus | null;
  fromLifecycleStatus?: TaskLifecycleStatus | null;
  toLifecycleStatus?: TaskLifecycleStatus | null;
  payload?: Record<string, unknown> | null;
}

export function buildTaskLifecyclePatch(current: TaskRow, updates: TaskPatchInput) {
  const now = new Date().toISOString();
  const nextBoardStatus = updates.status ?? current.status;
  const nextFlag = updates.flag === undefined ? current.flag : updates.flag;
  const nextLifecycleStatus = updates.lifecycle_status ?? inferLifecycleStatus(nextBoardStatus, nextFlag);
  const waitingForInput = nextLifecycleStatus === "waiting_user" || nextFlag === "red" ? 1 : 0;

  return {
    lifecycle_status: nextLifecycleStatus,
    waiting_for_input: waitingForInput,
    started_at:
      nextLifecycleStatus === "active"
        ? current.started_at || now
        : updates.lifecycle_status === "active"
          ? current.started_at || now
          : current.started_at,
    blocked_at:
      nextLifecycleStatus === "blocked" || nextLifecycleStatus === "waiting_user"
        ? current.blocked_at || now
        : null,
    waiting_for_input_at: waitingForInput ? current.waiting_for_input_at || now : null,
    completed_at: nextLifecycleStatus === "completed" ? current.completed_at || now : null,
    last_event_at: now,
    run_id: updates.run_id === undefined ? current.run_id : updates.run_id,
  };
}

export function recordTaskEvent(db: Database.Database, input: TaskEventInput) {
  db.prepare(
    `INSERT INTO task_events (
      id, task_id, actor, event_type, from_board_status, to_board_status,
      from_lifecycle_status, to_lifecycle_status, note, payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    uuid(),
    input.taskId,
    input.actor || null,
    input.eventType,
    input.fromBoardStatus || null,
    input.toBoardStatus || null,
    input.fromLifecycleStatus || null,
    input.toLifecycleStatus || null,
    input.note || null,
    input.payload ? JSON.stringify(input.payload) : null,
  );
}
