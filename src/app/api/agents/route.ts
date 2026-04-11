
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const agents = db.prepare(`
    SELECT a.*, GROUP_CONCAT(ap.project_id) as project_ids
    FROM agents a
    LEFT JOIN agent_projects ap ON a.id = ap.agent_id
    GROUP BY a.id
    ORDER BY a.status = 'active' DESC, a.name
  `).all();

  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = body.id || uuid();

  db.prepare(`
    INSERT INTO agents (id, name, status, current_task, project_id, model, provider, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.name, body.status || "offline", body.current_task || null, body.project_id || null, body.model || "unknown", body.provider || "unknown", body.avatar || "🤖");

  return NextResponse.json({ id, success: true }, { status: 201 });
}
