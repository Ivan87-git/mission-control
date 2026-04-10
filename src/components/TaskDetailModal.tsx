"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, Agent, Project, ProjectCanonicalData, TaskResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { X, Flag, Layers, User, Calendar, AlignLeft, Tag, FolderTree, ListChecks, CircleHelp, FileText, MessageSquareReply } from "lucide-react";

const STATUS_META: { id: Task["status"]; label: string; color: string }[] = [
  { id: "ideas", label: "Ideas", color: "#a855f7" },
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", color: "#4f8fff" },
  { id: "review", label: "Review", color: "#eab308" },
  { id: "done", label: "Done", color: "#22c55e" },
];

const PRIORITY_META: { id: Task["priority"]; label: string; color: string }[] = [
  { id: "low", label: "Low", color: "#6b7280" },
  { id: "medium", label: "Medium", color: "#4f8fff" },
  { id: "high", label: "High", color: "#eab308" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

function MetaSection({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: `${color}20`, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

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
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const project = projects.find((p) => p.id === task.project_id);
  const agent = agents.find((a) => a.id === task.assigned_agent);
  const currentStatus = STATUS_META.find((s) => s.id === task.status)!;
  const currentPriority = PRIORITY_META.find((p) => p.id === task.priority)!;
  const sourceLine = (task.content || "").split("\n").find((line) => line.startsWith("Source: ")) || null;
  const noteBody = useMemo(() => {
    return (task.content || "")
      .split("\n")
      .filter((line) => !line.startsWith("Source: "))
      .join("\n")
      .trim();
  }, [task.content]);
  const isManagedTask = task.id.startsWith("vault-");

  const fetchCanonical = useCallback(() => {
    if (!task.project_id) return Promise.resolve(null);
    return api.getProjectCanonical(task.project_id);
  }, [task.project_id]);
  const { data: canonical } = useData<ProjectCanonicalData | null>(fetchCanonical, 30000);

  const fetchResponses = useCallback(() => api.getTaskResponses(task.id), [task.id]);
  const { data: responses, refresh: refreshResponses } = useData<TaskResponse[]>(fetchResponses, 10000);

  const hasPendingResponse = (responses || []).some((response) => response.status === "pending");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmitAnswer() {
    const trimmed = answer.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await api.submitTaskResponse(task.id, { response_text: trimmed, created_by: "Ivan" });
      setAnswer("");
      await refreshResponses();
      onSaved(task);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-5xl rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          maxHeight: "88vh",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          {project && (
            <span
              className="text-xs font-medium px-2 py-1 rounded flex items-center gap-1.5 flex-shrink-0"
              style={{ background: `${project.color}20`, color: project.color }}
            >
              <Layers size={10} />
              {project.name}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {task.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Board is derived from the vault{task.flag ? " · waiting for your input" : ""}
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg transition-colors hover:brightness-125 flex-shrink-0"
            style={{ color: "var(--text-secondary)" }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_340px] gap-0 min-h-0 overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-6">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                <AlignLeft size={15} />
                Task context
              </div>
              <div
                className="rounded-xl p-4 text-sm whitespace-pre-wrap"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                {noteBody || "No additional detail on the board. Check the canonical vault source for the full project context."}
              </div>
              {sourceLine && (
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {sourceLine}
                </div>
              )}
            </section>

            {task.flag && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  <MessageSquareReply size={15} />
                  Answer to unblock Hermes
                </div>
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)" }}
                >
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Submit a concise answer for this specific task only. Hermes treats it as plain text, writes it back to the matching canonical task line, clears the waiting flag, and continues from there.
                  </div>
                  <textarea
                    className="w-full min-h-28 rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    placeholder="Type your answer, decision, or clarification..."
                    maxLength={1000}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {hasPendingResponse ? "An answer is already pending pickup." : `${answer.length}/1000 chars · scoped to this task only.`}
                    </div>
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ background: "var(--accent-blue)", color: "white" }}
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                    >
                      {submitting ? "Submitting..." : "Submit answer"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                <FileText size={15} />
                Answer history
              </div>
              <div className="space-y-2">
                {(responses || []).length === 0 ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    No answers submitted yet.
                  </div>
                ) : (
                  responses!.map((response) => {
                    const color = response.status === "processed" ? "#22c55e" : response.status === "failed" ? "#ef4444" : "#eab308";
                    return (
                      <div
                        key={response.id}
                        className="rounded-xl p-4 space-y-2"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {response.created_by}
                          </div>
                          <StatusPill label={response.status} color={color} />
                        </div>
                        <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                          {response.response_text}
                        </div>
                        <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                          <div>Submitted: {new Date(response.created_at).toLocaleString()}</div>
                          {response.processed_at && <div>Processed: {new Date(response.processed_at).toLocaleString()}</div>}
                          {response.processing_note && <div>{response.processing_note}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {canonical && task.project_id && (
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CanonicalSection title="Next actions" icon={<ListChecks size={14} />} items={canonical.next_actions} />
                <CanonicalSection title="Open questions" icon={<CircleHelp size={14} />} items={canonical.open_questions} />
              </section>
            )}
          </div>

          <div className="overflow-y-auto px-5 py-5 space-y-4" style={{ borderLeft: "1px solid var(--border)" }}>
            <MetaSection label="Status" icon={<Tag size={11} />}>
              <StatusPill label={currentStatus.label} color={currentStatus.color} />
            </MetaSection>

            <MetaSection label="Priority" icon={<Flag size={11} />}>
              <StatusPill label={currentPriority.label} color={currentPriority.color} />
            </MetaSection>

            <MetaSection label="Assignment" icon={<User size={11} />}>
              <div className="text-xs px-2.5 py-2 rounded-lg" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                {agent ? `${agent.avatar} ${agent.name}` : "Unassigned"}
              </div>
            </MetaSection>

            <MetaSection label="Created" icon={<Calendar size={11} />}>
              <div className="text-xs px-2.5 py-2 rounded-lg" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                {new Date(task.created_at).toLocaleString()}
              </div>
            </MetaSection>

            <MetaSection label="Source of truth" icon={<FolderTree size={11} />}>
              <div className="text-xs px-2.5 py-2 rounded-lg whitespace-pre-wrap" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                {isManagedTask
                  ? "Vault-managed task. Edit the canonical note in the vault; use this modal only to answer flagged tasks."
                  : "Manual board task. Board editing is intentionally disabled to keep workflow vault-first."}
              </div>
            </MetaSection>

            {sourceLine && (
              <MetaSection label="Canonical source" icon={<FileText size={11} />}>
                <div className="text-xs px-2.5 py-2 rounded-lg whitespace-pre-wrap break-words" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
                  {sourceLine.replace(/^Source:\s*/, "")}
                </div>
              </MetaSection>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ color: "var(--text-secondary)" }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CanonicalSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          None
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="text-sm" style={{ color: "var(--text-primary)" }}>
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
