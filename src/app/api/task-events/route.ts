import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { buildTaskLifecyclePatch, recordTaskEvent } from "@/lib/task-events";
import { Task, TaskEventType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = getDb();
  const taskId = req.nextUrl.searchParams.get("task_id");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 200);

  if (taskId) {
    const rows = db.prepare("SELECT * FROM task_events WHERE task_id = ? ORDER BY created_at DESC LIMIT ?").all(taskId, limit);
    return NextResponse.json(rows);
  }

  const rows = db.prepare("SELECT * FROM task_events ORDER BY created_at DESC LIMIT ?").all(limit);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const taskId = String(body.task_id || "").trim();
  if (!taskId) {
    return NextResponse.json({ error: "task_id is required" }, { status: 400 });
  }

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as Task | undefined;
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const nextBoardStatus = typeof body.to_board_status === "string" ? body.to_board_status : undefined;
  const nextLifecycleStatus = typeof body.to_lifecycle_status === "string" ? body.to_lifecycle_status : undefined;
  const nextRunId = body.run_id === null || typeof body.run_id === "string" ? body.run_id : undefined;
  const nextFlag = body.flag === null || typeof body.flag === "string" ? body.flag : undefined;

  if (nextBoardStatus || nextLifecycleStatus || nextRunId !== undefined || nextFlag !== undefined) {
    const lifecyclePatch = buildTaskLifecyclePatch(task, {
      status: nextBoardStatus,
      lifecycle_status: nextLifecycleStatus,
      run_id: nextRunId,
      flag: nextFlag,
    });

    db.prepare(
      `UPDATE tasks SET
        status = ?,
        lifecycle_status = ?,
        run_id = ?,
        flag = ?,
        waiting_for_input = ?,
        started_at = ?,
        blocked_at = ?,
        waiting_for_input_at = ?,
        completed_at = ?,
        last_event_at = ?,
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(
      nextBoardStatus || task.status,
      lifecyclePatch.lifecycle_status,
      lifecyclePatch.run_id,
      nextFlag === undefined ? task.flag : nextFlag,
      lifecyclePatch.waiting_for_input,
      lifecyclePatch.started_at,
      lifecyclePatch.blocked_at,
      lifecyclePatch.waiting_for_input_at,
      lifecyclePatch.completed_at,
      lifecyclePatch.last_event_at,
      taskId,
    );
  }

  recordTaskEvent(db, {
    taskId,
    actor: typeof body.actor === "string" ? body.actor : null,
    eventType: (body.event_type || "note") as TaskEventType,
    note: typeof body.note === "string" ? body.note : null,
    fromBoardStatus: task.status,
    toBoardStatus: (nextBoardStatus || task.status) as Task["status"],
    fromLifecycleStatus: task.lifecycle_status,
    toLifecycleStatus: (nextLifecycleStatus || buildTaskLifecyclePatch(task, { status: nextBoardStatus, lifecycle_status: nextLifecycleStatus, flag: nextFlag }).lifecycle_status) as Task["lifecycle_status"],
    payload: body.payload && typeof body.payload === "object" ? body.payload : null,
  });

  const inserted = db.prepare("SELECT * FROM task_events WHERE task_id = ? ORDER BY created_at DESC LIMIT 1").get(taskId);
  return NextResponse.json(inserted, { status: 201 });
}
