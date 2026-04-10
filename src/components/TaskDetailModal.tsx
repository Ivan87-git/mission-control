"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Agent, Project, ProjectCanonicalData } from "@/lib/types";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { X, Flag, Layers, User, Calendar, AlignLeft, Tag, FolderTree, ListChecks, CircleHelp, FileText } from "lucide-react";

const STATUSES: { id: Task["status"]; label: string; color: string }[] = [
  { id: "ideas", label: "Ideas", color: "#a855f7" },
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

const PRIORITIES: { id: Task["priority"]; label: string; color: string }[] = [
  { id: "low", label: "Low", color: "#6b7280" },
  { id: "medium", label: "Medium", color: "#4f8fff" },
  { id: "high", label: "High", color: "#eab308" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

export default function TaskDetailModal({
  task,
  agents,
  projects,
  onClose,
  onSaved,
}: {
  task: Task;
  agents: Agent[];
  projects: Project[];
  onClose: () => void;
  onSaved: (updated: Task) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content ?? "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [flagged, setFlagged] = useState(!!task.flag);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const project = projects.find((p) => p.id === task.project_id);
  const agent = agents.find((a) => a.id === task.assigned_agent);
  const currentStatus = STATUSES.find((s) => s.id === status)!;
  const currentPriority = PRIORITIES.find((p) => p.id === priority)!;
  const fetchCanonical = useCallback(() => {
    if (!task.project_id) throw new Error("No project");
    return api.getProjectCanonical(task.project_id);
  }, [task.project_id]);
  const { data: canonical } = useData<ProjectCanonicalData>(fetchCanonical, 30000);
  const sourceLine = (task.content || "").split("\n").find((line) => line.startsWith("Source: ")) || null;

  // mark dirty on any change
  useEffect(() => {
    const changed =
      title !== task.title ||
      content !== (task.content ?? "") ||
      status !== task.status ||
      priority !== task.priority ||
      flagged !== !!task.flag;
    setDirty(changed);
  }, [title, content, status, priority, flagged, task]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.updateTask(task.id, {
        title,
        content,
        status,
        priority,
        flag: flagged ? "red" : null,
      });
      onSaved(updated);
      setDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          maxHeight: "85vh",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {project && (
            <span
              className="text-xs font-medium px-2 py-1 rounded flex items-center gap-1.5 flex-shrink-0"
              style={{ background: `${project.color}20`, color: project.color }}
            >
              <Layers size={10} />
              {project.name}
            </span>
          )}
          <input
            className="flex-1 bg-transparent text-base font-semibold outline-none placeholder:opacity-40"
            style={{ color: "var(--text-primary)" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
          />
          <button
            className="p-1.5 rounded-lg transition-colors hover:brightness-125 flex-shrink-0"
            style={{ color: "var(--text-secondary)" }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: content area */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ minWidth: 0 }}>
            <div
              className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              <AlignLeft size={12} />
              Notes
            </div>
            <textarea
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:opacity-30"
              style={{
                color: "var(--text-primary)",
                minHeight: "220px",
                fontFamily: "inherit",
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add notes, steps, or context…"
            />

            {(sourceLine || canonical) && (
              <div className="mt-5 space-y-3">
                {sourceLine && (
                  <CanonicalBox icon={<FileText size={12} />} title="Source Note">
                    <div className="text-xs" style={{ color: "var(--text-primary)" }}>{sourceLine.replace(/^Source:\s*/, "")}</div>
                  </CanonicalBox>
                )}
                {canonical?.summary && (
                  <CanonicalBox icon={<FolderTree size={12} />} title="Canonical Summary">
                    <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{canonical.summary}</div>
                  </CanonicalBox>
                )}
                {canonical?.next_actions?.length ? (
                  <CanonicalListBox icon={<ListChecks size={12} />} title="Canonical Next Actions" items={canonical.next_actions.slice(0, 3)} />
                ) : null}
                {canonical?.open_questions?.length ? (
                  <CanonicalListBox icon={<CircleHelp size={12} />} title="Canonical Open Questions" items={canonical.open_questions.slice(0, 2)} />
                ) : null}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: "1px", background: "var(--border)", flexShrink: 0 }} />

          {/* Right: metadata */}
          <div
            className="flex flex-col gap-1 p-5 overflow-y-auto"
            style={{ width: "220px", flexShrink: 0 }}
          >
            {/* Status */}
            <MetaSection label="Status" icon={<Tag size={11} />}>
              <div className="flex flex-col gap-1 mt-1">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all"
                    style={{
                      background: status === s.id ? `${s.color}20` : "transparent",
                      color: status === s.id ? s.color : "var(--text-secondary)",
                      border: status === s.id ? `1px solid ${s.color}40` : "1px solid transparent",
                    }}
                    onClick={() => setStatus(s.id)}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </button>
                ))}
              </div>
            </MetaSection>

            <div style={{ height: "1px", background: "var(--border)", margin: "6px 0" }} />

            {/* Priority */}
            <MetaSection label="Priority" icon={<Flag size={11} />}>
              <div className="flex flex-col gap-1 mt-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all"
                    style={{
                      background: priority === p.id ? `${p.color}20` : "transparent",
                      color: priority === p.id ? p.color : "var(--text-secondary)",
                      border: priority === p.id ? `1px solid ${p.color}40` : "1px solid transparent",
                    }}
                    onClick={() => setPriority(p.id)}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: p.color }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </MetaSection>

            <div style={{ height: "1px", background: "var(--border)", margin: "6px 0" }} />

            {/* Agent */}
            {agent && (
              <MetaSection label="Assigned To" icon={<User size={11} />}>
                <div
                  className="flex items-center gap-2 mt-1 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                >
                  <span>{agent.avatar}</span>
                  <span>{agent.name}</span>
                </div>
              </MetaSection>
            )}

            {/* Created */}
            <MetaSection label="Created" icon={<Calendar size={11} />}>
              <span className="text-xs mt-1 block" style={{ color: "var(--text-secondary)" }}>
                {new Date(task.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </MetaSection>

            <div style={{ height: "1px", background: "var(--border)", margin: "6px 0" }} />

            {/* Flag */}
            <button
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all"
              style={{
                background: flagged ? "rgba(239,68,68,0.12)" : "var(--bg-tertiary)",
                color: flagged ? "#ef4444" : "var(--text-secondary)",
                border: flagged ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
              }}
              onClick={() => setFlagged((f) => !f)}
            >
              {flagged && (
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: "#ef4444" }}
                />
              )}
              {!flagged && <Flag size={11} className="flex-shrink-0" />}
              {flagged ? "Waiting for user" : "Flag for user"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: currentStatus.color }}
            />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {currentStatus.label}
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span className="text-xs capitalize" style={{ color: currentPriority.color }}>
              {currentPriority.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: "var(--text-secondary)" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
              style={{
                background: dirty ? "var(--accent-blue)" : "var(--bg-tertiary)",
                color: dirty ? "white" : "var(--text-secondary)",
              }}
              disabled={!dirty || saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function CanonicalBox({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function CanonicalListBox({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <CanonicalBox icon={icon} title={title}>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm" style={{ color: "var(--text-primary)" }}>• {item}</li>
        ))}
      </ul>
    </CanonicalBox>
  );
}
