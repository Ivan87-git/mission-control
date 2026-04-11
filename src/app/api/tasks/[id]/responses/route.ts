
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { getDb } from "@/lib/db";
import { recordTaskEvent } from "@/lib/task-events";
import { parseTaskContentMetadata } from "@/lib/task-meta";
import { v4 as uuid } from "uuid";

const MC_RESPONSE_PROCESSOR = process.env.MC_RESPONSE_PROCESSOR || "/home/ivan/.hermes/scripts/process_mc_task_responses.py";
const MC_RESPONSE_PYTHON = process.env.MC_RESPONSE_PYTHON || "/usr/bin/python3";
const MAX_RESPONSE_LENGTH = 1000;

function normalizeResponseText(value: unknown): string {
  return String(value || "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\r\n/g, "\n")
    .trim();
}

function triggerResponseProcessor() {
  try {
    const child = spawn(MC_RESPONSE_PYTHON, [MC_RESPONSE_PROCESSOR], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
  } catch (error) {
    console.error("Failed to trigger MC response processor", error);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM task_responses WHERE task_id = ? ORDER BY created_at DESC")
    .all(id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const body = await req.json();
  const db = getDb();

  const task = db.prepare("SELECT id, title, flag, content FROM tasks WHERE id = ?").get(taskId) as
    | { id: string; title: string; flag: string | null; content: string | null }
    | undefined;
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (!String(task.id).startsWith("vault-")) {
    return NextResponse.json({ error: "Answers are only allowed for vault-managed tasks" }, { status: 400 });
  }

  const { control } = parseTaskContentMetadata(task.content || undefined);
  const isPlanEditor = control === "plan-editor";
  const canSubmit = task.flag === "red" || isPlanEditor;
  if (!canSubmit) {
    return NextResponse.json({ error: "Answers are only allowed for waiting-user or plan-editor tasks" }, { status: 400 });
  }

  const responseText = normalizeResponseText(body.response_text);
  if (!responseText) {
    return NextResponse.json({ error: "response_text is required" }, { status: 400 });
  }
  if (responseText.length > MAX_RESPONSE_LENGTH) {
    return NextResponse.json({ error: `response_text must be <= ${MAX_RESPONSE_LENGTH} characters` }, { status: 400 });
  }

  const existingPending = db.prepare("SELECT id FROM task_responses WHERE task_id = ? AND status = 'pending' LIMIT 1").get(taskId) as { id: string } | undefined;
  if (existingPending) {
    return NextResponse.json({ error: "A response is already pending processing for this task" }, { status: 409 });
  }

  const id = uuid();
  const createdBy = String(body.created_by || "Ivan");

  db.prepare(
    `INSERT INTO task_responses (id, task_id, response_text, created_by, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).run(id, taskId, responseText, createdBy);

  db.prepare(`INSERT INTO activity (id, agent_name, action, detail, type) VALUES (?, ?, ?, ?, ?)`)
    .run(uuid(), createdBy, isPlanEditor ? "edited plan" : "answered", `Replied on task: ${task.title}`, "task");

  recordTaskEvent(db, {
    taskId,
    actor: createdBy,
    eventType: "response_submitted",
    note: isPlanEditor ? "Submitted plan-editor command" : "Submitted answer",
    payload: { response_id: id, response_preview: responseText.slice(0, 140) },
  });

  const inserted = db.prepare("SELECT * FROM task_responses WHERE id = ?").get(id);
  triggerResponseProcessor();
  return NextResponse.json(inserted, { status: 201 });
}
