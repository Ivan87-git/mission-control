
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = getDb();

  // Update agent status and last_seen
  const updates: string[] = ["last_seen = datetime('now')", "updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (body.status) { updates.push("status = ?"); values.push(body.status); }
  if (body.current_task !== undefined) { updates.push("current_task = ?"); values.push(body.current_task); }
  if (body.tasks_completed !== undefined) { updates.push("tasks_completed = ?"); values.push(body.tasks_completed); }

  values.push(id);
  db.prepare(`UPDATE agents SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  // Log activity if there's a message
  if (body.activity) {
    db.prepare(`INSERT INTO activity (id, agent_name, action, detail, type) VALUES (?, ?, ?, ?, ?)`)
      .run(uuid(), body.agent_name || id, body.activity.action || "heartbeat", body.activity.detail || "", body.activity.type || "system");
  }

  return NextResponse.json({ ok: true });
}
