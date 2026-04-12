
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { inferLifecycleStatus } from "@/lib/task-meta";
import { buildTaskLifecyclePatch, recordTaskEvent } from "@/lib/task-events";
import { Task } from "@/lib/types";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const db = getDb();
  const projectId = req.nextUrl.searchParams.get("project_id");

  let query = "SELECT * FROM tasks";
  const params: string[] = [];
  if (projectId) {
    query += " WHERE project_id = ?";
    params.push(projectId);
  }
  query += " ORDER BY CASE status WHEN 'in_progress' THEN 0 WHEN 'review' THEN 1 WHEN 'backlog' THEN 2 WHEN 'ideas' THEN 3 WHEN 'funnel' THEN 4 ELSE 5 END, CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, COALESCE(last_event_at, updated_at, created_at) DESC";

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = body.id || uuid();
  const status = (body.status || "backlog") as Task["status"];
  const flag = body.flag || null;
  const task = {
    id,
    status,
    lifecycle_status: (body.lifecycle_status || inferLifecycleStatus(status, flag)) as Task["lifecycle_status"],
    flag,
    waiting_for_input: flag === "red",
    started_at: null,
    blocked_at: null,
    waiting_for_input_at: null,
    completed_at: null,
    last_event_at: null,
    run_id: body.run_id || null,
    last_error: body.last_error || null,
    unblock_condition: body.unblock_condition || null,
  };
  const lifecyclePatch = buildTaskLifecyclePatch(task, {
    status,
    lifecycle_status: task.lifecycle_status,
    flag,
    run_id: body.run_id || null,
  });

  db.prepare(
    `INSERT INTO tasks (
      id, title, project_id, assigned_agent, status, lifecycle_status, priority,
      started_at, blocked_at, waiting_for_input_at, completed_at, last_event_at,
      waiting_for_input, run_id, source_task_id, last_error, unblock_condition, content, flag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    body.title,
    body.project_id || null,
    body.assigned_agent || null,
    status,
    lifecyclePatch.lifecycle_status,
    body.priority || "medium",
    lifecyclePatch.started_at,
    lifecyclePatch.blocked_at,
    lifecyclePatch.waiting_for_input_at,
    lifecyclePatch.completed_at,
    lifecyclePatch.last_event_at,
    lifecyclePatch.waiting_for_input,
    lifecyclePatch.run_id,
    body.source_task_id || null,
    body.last_error || null,
    body.unblock_condition || null,
    body.content || null,
    flag,
  );

  recordTaskEvent(db, {
    taskId: id,
    actor: typeof body.actor === "string" ? body.actor : "system",
    eventType: "created",
    note: typeof body.note === "string" ? body.note : "Task created",
    toBoardStatus: status,
    toLifecycleStatus: lifecyclePatch.lifecycle_status,
    payload: { title: body.title, project_id: body.project_id || null },
  });

  const inserted = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return NextResponse.json(inserted, { status: 201 });
}
