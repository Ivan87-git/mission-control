"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, PauseCircle } from "lucide-react";
import { DispatcherStatus } from "@/lib/types";

export default function DispatcherStatusPanel() {
  const { data } = useData<DispatcherStatus>(useCallback(() => api.getDispatcherStatus(), []), 10000);
  if (!data) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading dispatcher status...</div>;

  return (
    <div className="rounded-xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Dispatcher / Orchestrator Status</div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Live runtime view from mission-runner state and processes.</div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full" style={{ background: data.dispatcher_running ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: data.dispatcher_running ? '#22c55e' : '#ef4444' }}>
          {data.dispatcher_running ? 'dispatcher running' : 'dispatcher stopped'}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
        <Stat label="Dispatcher PID" value={data.dispatcher_pid ?? '—'} />
        <Stat label="Active missions" value={data.active_missions} />
        <Stat label="Active tasks" value={data.active_runtime_tasks.length} />
        <Stat label="Stale missions" value={data.stale_missions.length} tone={data.stale_missions.length ? 'warn' : 'ok'} />
      </div>

      {data.last_dispatch_log_line && (
        <div className="text-xs rounded-lg px-3 py-2" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          Last dispatcher log: {data.last_dispatch_log_line}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Active runtime tasks</div>
        {data.active_runtime_tasks.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active runtime tasks right now.</div>
        ) : data.active_runtime_tasks.map((task) => (
          <div key={`${task.mission_id}:${task.task_id}`} className="rounded-lg px-3 py-3 space-y-1" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              {task.status === 'running' ? <LoaderCircle size={14} className="animate-spin" /> : task.status === 'blocked' ? <PauseCircle size={14} /> : <Clock3 size={14} />}
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{task.status}</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.mission_id}</div>
            {task.blocked_by_reason && <div className="text-xs" style={{ color: '#fdba74' }}>Blocker: {task.blocked_by_reason}</div>}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Stale mission detector</div>
        {data.stale_missions.length === 0 ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}><CheckCircle2 size={14} /> No stale running missions detected.</div>
        ) : data.stale_missions.map((item) => (
          <div key={item.mission_id} className="flex items-start gap-2 text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(249,115,22,0.12)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.28)' }}>
            <AlertTriangle size={14} className="mt-0.5" />
            <div>
              <div className="font-medium">{item.mission_id}</div>
              <div className="text-xs">{item.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'ok' | 'warn' }) {
  const color = tone === 'warn' ? '#f97316' : tone === 'ok' ? '#22c55e' : 'var(--text-primary)';
  return <div className="rounded-lg px-3 py-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}><div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</div><div className="text-base font-semibold mt-1" style={{ color }}>{value}</div></div>;
}
