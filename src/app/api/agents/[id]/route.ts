
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedIfEmpty();
  const { id } = await params;
  const db = getDb();
  const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    const col = key.replace(/([A-Z])/g, "_$1").toLowerCase(); // camelCase to snake_case
    fields.push(`${col} = ?`);
    values.push(value);
  }

  fields.push("updated_at = datetime('now')");
  fields.push("last_seen = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE agents SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json({ success: true });
}
