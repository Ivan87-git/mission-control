
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const status = req.nextUrl.searchParams.get("status");
  const taskId = req.nextUrl.searchParams.get("task_id");

  let query = "SELECT * FROM task_responses";
  const clauses: string[] = [];
  const params: string[] = [];

  if (status) {
    clauses.push("status = ?");
    params.push(status);
  }
  if (taskId) {
    clauses.push("task_id = ?");
    params.push(taskId);
  }
  if (clauses.length > 0) {
    query += ` WHERE ${clauses.join(" AND ")}`;
  }
  query += " ORDER BY created_at DESC";

  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}
