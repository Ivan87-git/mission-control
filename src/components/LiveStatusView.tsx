"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, PauseCircle, RefreshCcw, Route, ScrollText, Server, Workflow } from "lucide-react";
import { LiveStatusSnapshot } from "@/lib/types";

function relativeTime(iso?: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function statusColor(status: string) {
  if (status === "completed") return "#22c55e";
  if (status === "running" || status === "in_progress") return "#4f8fff";
  if (status.includes("block") || status === "failed") return "#f97316";
  return "#94a3b8";
}

export default function LiveStatusView() {
  const { data, loading, error, refresh } = useData<LiveStatusSnapshot>(useCallback(() => api.getLiveStatus(), []), 300000);

  if (loading && !data) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading live status…</div>;
  if (error && !data) return <div className="text-sm" style={{ color: "#fca5a5" }}>Failed to load live status: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Live Status</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Snapshot view refreshed every 5 minutes. Shows dispatcher/orchestrator truth plus the latest trace per active task.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Last refresh {relativeTime(data.snapshot_at)}
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <RefreshCcw size={13} /> Refresh now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <Workflow size={15} /> Orchestrator status
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Active runs" value={data.orchestrator.active_runs} color="#4f8fff" />
            <Metric label="Blocked runs" value={data.orchestrator.blocked_runs} color="#f97316" />
            <Metric label="Failed runs" value={data.orchestrator.failed_runs} color="#ef4444" />
            <Metric label="Latest update" value={relativeTime(data.orchestrator.latest_run_update)} color="var(--text-primary)" />
          </div>
          <div className="space-y-2">
            {data.orchestrator.current_runs.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>No active or recently failing orchestrator runs.</div>
            ) : data.orchestrator.current_runs.map((run) => (
              <div key={run.mission_id} className="rounded-lg p-3 space-y-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${statusColor(run.status)}20`, color: statusColor(run.status) }}>
                    {run.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{run.mission_name}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Progress {run.progress_label} · running {run.running_tasks} · blocked {run.blocked_tasks} · failed {run.failed_tasks} · updated {relativeTime(run.updated_at)}
                </div>
                {run.error && <div className="text-xs" style={{ color: "#fca5a5" }}>{run.error}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <Server size={15} /> Dispatcher status
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Dispatcher" value={data.dispatcher.dispatcher_running ? "running" : "stopped"} color={data.dispatcher.dispatcher_running ? "#22c55e" : "#ef4444"} />
            <Metric label="PID" value={data.dispatcher.dispatcher_pid ?? "—"} color="var(--text-primary)" />
            <Metric label="Active missions" value={data.dispatcher.active_missions} color="#4f8fff" />
            <Metric label="Stale missions" value={data.dispatcher.stale_missions.length} color={data.dispatcher.stale_missions.length ? "#f97316" : "#22c55e"} />
          </div>
          <div className="rounded-lg p-3 text-xs" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Last dispatcher log: {data.dispatcher.last_dispatch_log_line || "—"}
          </div>
          <div className="space-y-2">
            {data.dispatcher.active_runtime_tasks.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>No active runtime tasks.</div>
            ) : data.dispatcher.active_runtime_tasks.map((task) => (
              <div key={`${task.mission_id}:${task.task_id}`} className="rounded-lg p-3 space-y-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {task.status === "running" ? <LoaderCircle size={14} className="animate-spin" /> : task.status === "blocked" ? <PauseCircle size={14} /> : <Clock3 size={14} />}
                  {task.title}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{task.mission_id}</div>
                {task.blocked_by_reason && <div className="text-xs" style={{ color: "#fdba74" }}>Why blocked: {task.blocked_by_reason}</div>}
                {task.unblock_condition && <div className="text-xs" style={{ color: "#fca5a5" }}>Runs again when: {task.unblock_condition}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          <Route size={15} /> Active task progress
        </div>
        {data.active_tasks.length === 0 ? (
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>No active board-side runtime tasks right now.</div>
        ) : (
          <div className="space-y-3">
            {data.active_tasks.map((task) => (
              <div key={task.id} className="rounded-lg p-4 space-y-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{task.title}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {task.run_id || "No run linked"} · board {task.status} · lifecycle {task.lifecycle_status}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${statusColor(task.status)}20`, color: statusColor(task.status) }}>
                    {task.status.replaceAll("_", " ")}
                  </span>
                </div>
                {task.latest_event_note && (
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Last action: {task.latest_event_note}
                  </div>
                )}
                {!task.latest_event_note && task.latest_event_type && (
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Last action: {task.latest_event_type.replaceAll("_", " ")}
                  </div>
                )}
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Updated {relativeTime(task.last_event_at || task.updated_at)}{task.latest_event_created_at ? ` · event ${relativeTime(task.latest_event_created_at)}` : ""}{task.latest_event_actor ? ` · ${task.latest_event_actor}` : ""}
                </div>
                {task.last_error && <div className="text-xs" style={{ color: "#fdba74" }}>Why blocked: {task.last_error}</div>}
                {task.unblock_condition && <div className="text-xs" style={{ color: "#fca5a5" }}>Runs again when: {task.unblock_condition}</div>}
                {task.waiting_for_input ? <div className="text-xs" style={{ color: "#f97316" }}>Waiting for human input</div> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          <ScrollText size={15} /> Recent task trace
        </div>
        <div className="space-y-2">
          {data.recent_task_actions.map((action) => (
            <div key={action.id} className="rounded-lg p-3 flex items-start gap-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="pt-0.5" style={{ color: statusColor(action.board_status) }}>
                {action.board_status === "done" ? <CheckCircle2 size={14} /> : action.board_status === "failed" ? <AlertTriangle size={14} /> : <Clock3 size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                  <span className="font-medium">{action.title}</span>
                  <span style={{ color: "var(--text-secondary)" }}> · {action.event_type.replaceAll("_", " ")}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {action.run_id || "No run"} · {action.actor || "system"} · {relativeTime(action.created_at)}
                </div>
                {action.note && <div className="text-xs mt-1" style={{ color: "var(--text-primary)" }}>{action.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg px-3 py-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</div>
      <div className="text-base font-semibold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}
