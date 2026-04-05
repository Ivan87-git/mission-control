
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { v4 as uuid } from "uuid";

export async function GET() {
  seedIfEmpty();
  const db = getDb();

  const projects = db.prepare(`
    SELECT p.*,
      GROUP_CONCAT(DISTINCT ap.agent_id) as agent_ids,
      COUNT(DISTINCT t.id) as task_count,
      COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
    FROM projects p
    LEFT JOIN agent_projects ap ON p.id = ap.project_id
    LEFT JOIN tasks t ON p.id = t.project_id
    GROUP BY p.id
    ORDER BY p.status = 'active' DESC, p.name
  `).all();

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = body.id || uuid();

  db.prepare(`INSERT INTO projects (id, name, description, status, progress, color) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, body.name, body.description || "", body.status || "active", body.progress || 0, body.color || "#4f8fff");

  return NextResponse.json({ id, success: true }, { status: 201 });
}
