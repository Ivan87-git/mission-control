import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { getDb } from "@/lib/db";
import { getMissionRuns } from "@/lib/runs";

const MISSION_RUNNER_ROOT = process.env.MC_MISSION_RUNNER_ROOT || "/home/ivan/mission-runner";
const STATE_DIR = path.join(MISSION_RUNNER_ROOT, "state");
const DISPATCHER_LOG = path.join(MISSION_RUNNER_ROOT, "logs", "dispatcher-loop.out");
const ACTIVE_BOARD_STATUSES = ["assigned", "in_progress", "review", "blocked", "failed"] as const;

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function processTable() {
  try {
    const out = execFileSync("ps", ["-eo", "pid,lstart,cmd"], { encoding: "utf8" });
    return out.split(/\r?\n/).slice(1).filter(Boolean);
  } catch {
    return [] as string[];
  }
}

function findDispatcher(lines: string[]) {
  const line = lines.find((row) => row.includes("python3 mission_orchestrator.py dispatch-ready --loop"));
  if (!line) return null;
  const match = line.trim().match(/^(\d+)\s+([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+\s+\d{4})\s+(.*)$/);
  if (!match) return { running: true, pid: null, started_at: null };
  return { running: true, pid: Number(match[1]), started_at: match[2] };
}

function lastLogLine() {
  try {
    const content = fs.readFileSync(DISPATCHER_LOG, "utf8").trim().split(/\r?\n/).filter(Boolean);
    return content.length ? content[content.length - 1] : null;
  } catch {
    return null;
  }
}

function getDispatcherStatus() {
  const lines = processTable();
  const dispatcher = findDispatcher(lines);
  const activeRuntimeTasks: { mission_id: string; task_id: string; title: string; status: string; started_at?: string | null; blocked_by_reason?: string | null; unblock_condition?: string | null; needs_user_input?: boolean }[] = [];
  const staleMissions: { mission_id: string; status: string; pid?: number | null; reason: string }[] = [];
  let activeMissions = 0;

  if (fs.existsSync(STATE_DIR)) {
    for (const name of fs.readdirSync(STATE_DIR)) {
      if (!name.endsWith(".json")) continue;
      const filePath = path.join(STATE_DIR, name);
      try {
        const state = readJson(filePath);
        const status = state.status;
        const pid = state.pid;
        const pidAlive = typeof pid === "number" && fs.existsSync(`/proc/${pid}`);
        if (["running", "waiting_on_blockers"].includes(status)) {
          activeMissions += 1;
          for (const task of state.tasks || []) {
            if (["running", "ready", "blocked", "review"].includes(task.status)) {
              activeRuntimeTasks.push({
                mission_id: state.mission_id,
                task_id: task.id,
                title: task.title,
                status: task.status,
                started_at: task.started_at || null,
                blocked_by_reason: task.blocked_by_reason || null,
                unblock_condition: task.unblock_condition || null,
                needs_user_input: Boolean(task.needs_user_input),
              });
            }
          }
        }
        if (status === "running" && !pidAlive) {
          staleMissions.push({ mission_id: state.mission_id, status, pid: pid || null, reason: "state says running but PID is not alive" });
        }
      } catch {
        continue;
      }
    }
  }

  return {
    dispatcher_running: Boolean(dispatcher),
    dispatcher_pid: dispatcher?.pid ?? null,
    dispatcher_started_at: dispatcher?.started_at ?? null,
    active_missions: activeMissions,
    active_runtime_tasks: activeRuntimeTasks,
    stale_missions: staleMissions,
    last_dispatch_log_line: lastLogLine(),
  };
}

export async function GET() {
  const db = getDb();
  const runs = getMissionRuns(25);
  const dispatcher = getDispatcherStatus();
  const now = new Date().toISOString();

  const placeholders = ACTIVE_BOARD_STATUSES.map(() => "?").join(", ");
  const activeTasks = db.prepare(`
    SELECT
      t.id,
      t.title,
      t.status,
      t.lifecycle_status,
      t.priority,
      t.run_id,
      t.last_error,
      t.unblock_condition,
      t.waiting_for_input,
      t.last_event_at,
      t.updated_at,
      e.event_type AS latest_event_type,
      e.actor AS latest_event_actor,
      e.note AS latest_event_note,
      e.created_at AS latest_event_created_at
    FROM tasks t
    LEFT JOIN task_events e ON e.id = (
      SELECT te.id FROM task_events te WHERE te.task_id = t.id ORDER BY te.created_at DESC LIMIT 1
    )
    WHERE t.run_id IS NOT NULL
      AND t.status IN (${placeholders})
    ORDER BY COALESCE(t.last_event_at, t.updated_at, t.created_at) DESC
    LIMIT 30
  `).all(...ACTIVE_BOARD_STATUSES);

  const recentActions = db.prepare(`
    SELECT
      e.id,
      e.task_id,
      t.title,
      t.run_id,
      t.status AS board_status,
      e.event_type,
      e.actor,
      e.note,
      e.created_at
    FROM task_events e
    JOIN tasks t ON t.id = e.task_id
    WHERE t.run_id IS NOT NULL
    ORDER BY e.created_at DESC
    LIMIT 40
  `).all();

  const currentRuns = runs
    .filter((run) => ["running", "waiting_on_blockers", "failed"].includes(run.status))
    .slice(0, 10)
    .map((run) => ({
      mission_id: run.mission_id,
      mission_name: run.mission_name,
      status: run.status,
      updated_at: run.updated_at,
      error: run.error,
      progress_label: `${run.completed_tasks}/${run.total_tasks}`,
      running_tasks: run.running_tasks,
      blocked_tasks: run.blocked_tasks,
      failed_tasks: run.failed_tasks,
    }));

  return NextResponse.json({
    snapshot_at: now,
    refresh_interval_seconds: 300,
    orchestrator: {
      active_runs: runs.filter((run) => ["running", "waiting_on_blockers"].includes(run.status)).length,
      blocked_runs: runs.filter((run) => run.status.includes("block") || run.blocked_tasks > 0).length,
      failed_runs: runs.filter((run) => run.status === "failed" || run.failed_tasks > 0).length,
      latest_run_update: runs[0]?.updated_at || null,
      current_runs: currentRuns,
    },
    dispatcher,
    active_tasks: activeTasks,
    recent_task_actions: recentActions,
  });
}
