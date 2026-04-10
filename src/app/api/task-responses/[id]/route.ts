
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (body.status && body.status !== "pending" && !body.processed_at) {
    fields.push("processed_at = datetime('now')");
  }

  values.push(id);
  db.prepare(`UPDATE task_responses SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM task_responses WHERE id = ?").get(id);
  return NextResponse.json(updated);
}
