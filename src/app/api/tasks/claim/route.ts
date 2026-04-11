import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { buildTaskLifecyclePatch, recordTaskEvent } from "@/lib/task-events";
import { Task } from "@/lib/types";

const DEFAULT_LEASE_SECONDS = 900;

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const maxTasks = Math.max(1, Math.min(Number(body.max_tasks || 1), 20));
  const leaseOwner = String(body.lease_owner || body.owner || "mission-orchestrator").trim();
  const projectId = typeof body.project_id === "string" ? body.project_id : null;
  const leaseSeconds = Math.max(60, Math.min(Number(body.lease_seconds || DEFAULT_LEASE_SECONDS), 86400));

  const tasks = db.transaction(() => {
    db.prepare(`
      UPDATE tasks
      SET status = 'backlog', lifecycle_status = 'ready', updated_at = datetime('now')
      WHERE status = 'assigned' AND lease_expires_at IS NOT NULL AND datetime(lease_expires_at) <= datetime('now')
    `).run();

    let sql = `
      SELECT * FROM tasks
      WHERE status = 'backlog'
        AND (flag IS NULL OR flag != 'red')
    `;
    const params: unknown[] = [];
    if (projectId) {
      sql += " AND project_id = ?";
      params.push(projectId);
    }
    sql += ` ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at ASC LIMIT ?`;
    params.push(maxTasks);

    const selected = db.prepare(sql).all(...params) as Task[];
    for (const task of selected) {
      const patch = buildTaskLifecyclePatch(task, {
        status: 'assigned',
        lifecycle_status: 'active',
      });
      db.prepare(`
        UPDATE tasks
        SET status = 'assigned',
            lifecycle_status = ?,
            lease_owner = ?,
            lease_expires_at = datetime('now', ?),
            waiting_for_input = ?,
            started_at = COALESCE(started_at, ?),
            blocked_at = ?,
            waiting_for_input_at = ?,
            completed_at = ?,
            last_event_at = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        patch.lifecycle_status,
        leaseOwner,
        `+${leaseSeconds} seconds`,
        patch.waiting_for_input,
        patch.started_at,
        patch.blocked_at,
        patch.waiting_for_input_at,
        patch.completed_at,
        patch.last_event_at,
        task.id,
      );
      recordTaskEvent(db, {
        taskId: task.id,
        actor: leaseOwner,
        eventType: 'lifecycle_changed',
        fromBoardStatus: task.status,
        toBoardStatus: 'assigned',
        fromLifecycleStatus: task.lifecycle_status,
        toLifecycleStatus: patch.lifecycle_status,
        note: `Task claimed by ${leaseOwner}`,
        payload: { lease_seconds: leaseSeconds },
      });
    }

    if (selected.length === 0) return [];
    const placeholders = selected.map(() => '?').join(',');
    return db.prepare(`SELECT * FROM tasks WHERE id IN (${placeholders}) ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at ASC`).all(...selected.map((task) => task.id));
  })();

  return NextResponse.json({ tasks });
}
