
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  seedIfEmpty();
  const db = getDb();
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  const items = db.prepare("SELECT * FROM activity ORDER BY created_at DESC LIMIT ?").all(limit);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();

  db.prepare(`INSERT INTO activity (id, agent_name, action, detail, type) VALUES (?, ?, ?, ?, ?)`)
    .run(id, body.agent_name, body.action, body.detail || "", body.type || "task");

  return NextResponse.json({ id, success: true }, { status: 201 });
}
