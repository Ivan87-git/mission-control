
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  seedIfEmpty();
  const db = getDb();
  const projectId = req.nextUrl.searchParams.get("project_id");

  let query = "SELECT * FROM tasks";
  const params: string[] = [];
  if (projectId) {
    query += " WHERE project_id = ?";
    params.push(projectId);
  }
  query += " ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC";

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = body.id || uuid();

  db.prepare(`INSERT INTO tasks (id, title, project_id, assigned_agent, status, priority) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, body.title, body.project_id || null, body.assigned_agent || null, body.status || "backlog", body.priority || "medium");

  return NextResponse.json({ id, success: true }, { status: 201 });
}
