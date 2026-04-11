
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const agentStats = db.prepare(`
    SELECT
      COUNT(*) as total_agents,
      COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active_agents,
      COALESCE(SUM(tasks_completed), 0) as total_completed
    FROM agents
  `).get() as { total_agents: number; active_agents: number; total_completed: number };

  const projectStats = db.prepare(`
    SELECT COUNT(*) as total_projects,
      COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active_projects
    FROM projects
  `).get() as { total_projects: number; active_projects: number };

  const taskStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN status IN ('assigned', 'in_progress', 'review') THEN 1 ELSE 0 END), 0) as in_progress,
      COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0) as done
    FROM tasks
  `).get() as { in_progress: number; done: number };

  return NextResponse.json({
    active_agents: agentStats.active_agents,
    total_agents: agentStats.total_agents,
    active_projects: projectStats.active_projects,
    in_progress_tasks: taskStats.in_progress,
    total_completed: taskStats.done,
  });
}
