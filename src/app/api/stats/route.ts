
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const agentStats = db.prepare(`
    SELECT
      COUNT(*) as total_agents,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_agents,
      SUM(tasks_completed) as total_completed
    FROM agents
  `).get() as { total_agents: number; active_agents: number; total_completed: number };

  const projectStats = db.prepare(`
    SELECT COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects
    FROM projects
  `).get() as { total_projects: number; active_projects: number };

  const taskStats = db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
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
