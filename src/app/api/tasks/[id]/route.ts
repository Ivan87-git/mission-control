
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { buildTaskLifecyclePatch, recordTaskEvent } from "@/lib/task-events";
import { Task, TaskLifecycleStatus } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const current = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
  if (!current) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const nextStatus = typeof body.status === "string" ? body.status : undefined;
  const nextLifecycle = typeof body.lifecycle_status === "string" ? body.lifecycle_status : undefined;
  const nextFlag = body.flag === null || typeof body.flag === "string" ? body.flag : undefined;
  const nextRunId = body.run_id === null || typeof body.run_id === "string" ? body.run_id : undefined;
  const lifecyclePatch = buildTaskLifecyclePatch(current, {
    status: nextStatus,
    lifecycle_status: nextLifecycle,
    flag: nextFlag,
    run_id: nextRunId,
  });

  const merged = {
    ...body,
    status: nextStatus || current.status,
    lifecycle_status: lifecyclePatch.lifecycle_status,
    waiting_for_input: lifecyclePatch.waiting_for_input,
    started_at: lifecyclePatch.started_at,
    blocked_at: lifecyclePatch.blocked_at,
    waiting_for_input_at: lifecyclePatch.waiting_for_input_at,
    completed_at: lifecyclePatch.completed_at,
    last_event_at: lifecyclePatch.last_event_at,
    run_id: lifecyclePatch.run_id,
  } as Record<string, unknown>;

  const allowedFields = [
    "title",
    "project_id",
    "assigned_agent",
    "status",
    "lifecycle_status",
    "priority",
    "started_at",
    "blocked_at",
    "waiting_for_input_at",
    "completed_at",
    "last_event_at",
    "waiting_for_input",
    "run_id",
    "source_task_id",
    "lease_owner",
    "lease_expires_at",
    "attempt_count",
    "last_error",
    "unblock_condition",
    "content",
    "flag",
  ];
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const key of allowedFields) {
    if (key in merged) {
      fields.push(`${key} = ?`);
      values.push(merged[key]);
    }
  }
  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const eventType =
    nextLifecycle && nextLifecycle !== current.lifecycle_status
      ? "lifecycle_changed"
      : nextStatus && nextStatus !== current.status
        ? "board_status_changed"
        : nextRunId !== undefined && nextRunId !== current.run_id
          ? "run_linked"
          : "updated";

  recordTaskEvent(db, {
    taskId: id,
    actor: typeof body.actor === "string" ? body.actor : "system",
    eventType,
    note: typeof body.note === "string" ? body.note : null,
    fromBoardStatus: current.status,
    toBoardStatus: (merged.status as Task["status"]) || current.status,
    fromLifecycleStatus: current.lifecycle_status,
    toLifecycleStatus: (merged.lifecycle_status as TaskLifecycleStatus) || current.lifecycle_status,
    payload: body.payload && typeof body.payload === "object" ? body.payload : null,
  });

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
