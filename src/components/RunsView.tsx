"use client";

import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { RunSummary } from "@/lib/types";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Clock3, LoaderCircle, PauseCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  completed: "#22c55e",
  running: "#4f8fff",
  waiting_on_blockers: "#f97316",
  blocked: "#ef4444",
  failed: "#ef4444",
};

export default function RunsView() {
  const { data: runs } = useData(useCallback(() => api.getRuns(undefined, 30), []), 15000);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const totals = useMemo(() => {
    const items = runs || [];
    return {
      total: items.length,
      active: items.filter((run) => run.status === "running").length,
      blocked: items.filter((run) => run.blocked_tasks > 0 || run.status.includes("block")).length,
      completed: items.filter((run) => run.status === "completed").length,
    };
  }, [runs]);

  if (!runs) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Mission Runs</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Snapshot view of mission-runner state files. No realtime sockets, no auth, just the latest run truth.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <StatPill label="Runs" value={totals.total} color="#94a3b8" />
          <StatPill label="Active" value={totals.active} color="#4f8fff" />
          <StatPill label="Blocked" value={totals.blocked} color="#f97316" />
          <StatPill label="Completed" value={totals.completed} color="#22c55e" />
        </div>
      </div>

      <div className="space-y-3">
        {runs.map((run) => {
          const expanded = expandedRun === run.mission_id;
          const color = statusColors[run.status] || "#94a3b8";
          return (
            <div key={run.mission_id} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <button
                onClick={() => setExpandedRun(expanded ? null : run.mission_id)}
                className="w-full px-4 py-4 text-left flex items-start gap-3 hover:bg-white/5 transition-colors"
              >
                <div className="pt-0.5" style={{ color }}>
                  {run.status === "completed" ? <CheckCircle2 size={16} /> : run.status === "running" ? <LoaderCircle size={16} className="animate-spin" /> : run.status.includes("block") ? <PauseCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{run.mission_name}</div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${color}20`, color }}>{run.status.replaceAll("_", " ")}</span>
                    {run.project_id && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{run.project_id}</span>}
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-6 gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div>Total {run.total_tasks}</div>
                    <div>Done {run.completed_tasks}</div>
                    <div>Blocked {run.blocked_tasks}</div>
                    <div>Running {run.running_tasks}</div>
                    <div>Ready {run.ready_tasks}</div>
                    <div>Failed {run.failed_tasks}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1"><Clock3 size={12} /> Updated {new Date(run.updated_at).toLocaleString()}</span>
                    {run.model && <span>{run.provider || "runner"} · {run.model}</span>}
                    {run.workdir && <span className="truncate">{run.workdir}</span>}
                  </div>
                  {run.error && <div className="text-xs" style={{ color: "#fca5a5" }}>{run.error}</div>}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {run.source_file && <div className="text-xs pt-3" style={{ color: "var(--text-secondary)" }}>Source: {run.source_file}</div>}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {run.tasks.map((task) => {
                      const taskColor = statusColors[task.status] || "#94a3b8";
                      return (
                        <div key={`${run.mission_id}-${task.id}`} className="rounded-lg p-3 space-y-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{task.title}</div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${taskColor}20`, color: taskColor }}>{task.status.replaceAll("_", " ")}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                            {task.priority && <span>Priority {task.priority}</span>}
                            {task.mc_task_id && <span>MC {task.mc_task_id}</span>}
                            {task.source_task_id && <span>Source {task.source_task_id}</span>}
                          </div>
                          {task.summary && <div className="text-sm" style={{ color: "var(--text-primary)" }}>{task.summary}</div>}
                          {task.blocked_by_reason && <div className="text-xs" style={{ color: "#fca5a5" }}>Blocked: {task.blocked_by_reason}</div>}
                          {task.unblock_condition && <div className="text-xs" style={{ color: "#fdba74" }}>Unblock: {task.unblock_condition}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="px-3 py-1.5 rounded-lg" style={{ background: `${color}18`, color }}>{label} {value}</div>;
}
