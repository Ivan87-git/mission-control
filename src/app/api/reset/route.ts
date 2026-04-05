
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Simple protection - require confirmation header
  const confirm = req.headers.get("x-confirm-reset");
  if (confirm !== "yes-delete-all") {
    return NextResponse.json({ error: "Must include x-confirm-reset: yes-delete-all header" }, { status: 400 });
  }

  const db = getDb();
  db.exec(`
    DELETE FROM activity;
    DELETE FROM tasks;
    DELETE FROM agent_projects;
    DELETE FROM agents;
    DELETE FROM projects;
  `);

  return NextResponse.json({ success: true, message: "All data cleared" });
}
