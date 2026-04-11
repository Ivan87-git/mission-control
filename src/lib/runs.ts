import fs from "fs";
import path from "path";
import { RunSummary, RunTaskSummary } from "@/lib/types";

const STATE_DIR = process.env.MC_MISSION_RUNNER_STATE_DIR || "/home/ivan/mission-runner/state";

function toIsoOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function summarizeTask(task: Record<string, unknown>): RunTaskSummary {
  const result = (task.result && typeof task.result === "object" ? task.result : {}) as Record<string, unknown>;
  return {
    id: String(task.id || ""),
    title: String(task.title || "Untitled task"),
    status: String(task.status || "unknown"),
    priority: typeof task.priority === "string" ? task.priority : null,
    mc_task_id: typeof task.mc_task_id === "string" ? task.mc_task_id : null,
    source_task_id: typeof task.source_task_id === "string" ? task.source_task_id : null,
    started_at: toIsoOrNull(task.started_at),
    completed_at: toIsoOrNull(task.completed_at),
    blocked_by_reason: typeof task.blocked_by_reason === "string" ? task.blocked_by_reason : null,
    unblock_condition: typeof task.unblock_condition === "string" ? task.unblock_condition : null,
    summary: typeof result.summary === "string" ? result.summary : null,
  };
}

export function getMissionRuns(limit = 25, projectId?: string | null): RunSummary[] {
  if (!fs.existsSync(STATE_DIR)) return [];

  const files = fs
    .readdirSync(STATE_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(STATE_DIR, name));

  const runs: RunSummary[] = [];
  for (const filePath of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
      const runProjectId = typeof raw.project_id === "string" ? raw.project_id : null;
      if (projectId && runProjectId !== projectId) continue;
      const controller = (raw.controller && typeof raw.controller === "object" ? raw.controller : {}) as Record<string, unknown>;
      const summary = (raw.summary && typeof raw.summary === "object" ? raw.summary : {}) as Record<string, unknown>;
      const tasks = Array.isArray(raw.tasks) ? raw.tasks.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object") : [];
      const updatedAt = toIsoOrNull(raw.updated_at) || toIsoOrNull(raw.started_at) || new Date(0).toISOString();

      runs.push({
        mission_id: String(raw.mission_id || path.basename(filePath, ".json")),
        mission_name: String(raw.mission_name || raw.mission_id || path.basename(filePath, ".json")),
        source_file: typeof raw.source_file === "string" ? raw.source_file : null,
        project_id: runProjectId,
        status: String(raw.status || "unknown"),
        pid: typeof raw.pid === "number" ? raw.pid : null,
        started_at: toIsoOrNull(raw.started_at),
        updated_at: updatedAt,
        completed_at: toIsoOrNull(raw.completed_at),
        error: typeof raw.error === "string" ? raw.error : null,
        provider: typeof controller.provider === "string" ? controller.provider : null,
        model: typeof controller.model === "string" ? controller.model : null,
        workdir: typeof controller.workdir === "string" ? controller.workdir : null,
        total_tasks: safeNumber(summary.total_tasks),
        completed_tasks: safeNumber(summary.completed_tasks),
        blocked_tasks: safeNumber(summary.blocked_tasks),
        failed_tasks: safeNumber(summary.failed_tasks),
        running_tasks: safeNumber(summary.running_tasks),
        ready_tasks: safeNumber(summary.ready_tasks),
        tasks: tasks.map(summarizeTask),
      });
    } catch {
      continue;
    }
  }

  return runs.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, limit);
}
