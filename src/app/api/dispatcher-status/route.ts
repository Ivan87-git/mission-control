import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const MISSION_RUNNER_ROOT = process.env.MC_MISSION_RUNNER_ROOT || "/home/ivan/mission-runner";
const STATE_DIR = path.join(MISSION_RUNNER_ROOT, "state");
const DISPATCHER_LOG = path.join(MISSION_RUNNER_ROOT, "logs", "dispatcher-loop.out");

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

export async function GET() {
  const lines = processTable();
  const dispatcher = findDispatcher(lines);
  const activeRuntimeTasks: { mission_id: string; task_id: string; title: string; status: string; started_at?: string | null; blocked_by_reason?: string | null }[] = [];
  const staleMissions: { mission_id: string; status: string; pid?: number | null; reason: string }[] = [];
  let activeMissions = 0;

  if (fs.existsSync(STATE_DIR)) {
    for (const name of fs.readdirSync(STATE_DIR)) {
      if (!name.endsWith('.json')) continue;
      const filePath = path.join(STATE_DIR, name);
      try {
        const state = readJson(filePath);
        const status = state.status;
        const pid = state.pid;
        const pidAlive = typeof pid === 'number' && fs.existsSync(`/proc/${pid}`);
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
              });
            }
          }
        }
        if (status === 'running' && !pidAlive) {
          staleMissions.push({ mission_id: state.mission_id, status, pid: pid || null, reason: 'state says running but PID is not alive' });
        }
      } catch {
        continue;
      }
    }
  }

  return NextResponse.json({
    dispatcher_running: Boolean(dispatcher),
    dispatcher_pid: dispatcher?.pid ?? null,
    dispatcher_started_at: dispatcher?.started_at ?? null,
    active_missions: activeMissions,
    active_runtime_tasks: activeRuntimeTasks,
    stale_missions: staleMissions,
    last_dispatch_log_line: lastLogLine(),
  });
}
