"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, Agent, Project, ProjectCanonicalData, TaskResponse, TaskEvent } from "@/lib/types";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";
import { parseTaskContentMetadata, TASK_LIFECYCLE_META, TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/task-meta";
import { X, Flag, Layers, User, Calendar, AlignLeft, Tag, FolderTree, ListChecks, CircleHelp, FileText, MessageSquareReply, Workflow, History } from "lucide-react";
import SpecEditor from "./SpecEditor";

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
  const currentStatus = TASK_STATUS_META.find((s) => s.id === task.status)!;
  const currentPriority = TASK_PRIORITY_META.find((p) => p.id === task.priority)!;
  const currentLifecycle = TASK_LIFECYCLE_META.find((item) => item.id === task.lifecycle_status);
  const parsedContent = useMemo(() => parseTaskContentMetadata(task.content), [task.content]);
  const sourceLine = parsedContent.sourceLine;
  const noteBody = parsedContent.noteBody;
  const control = parsedContent.control;
  const isManagedTask = task.id.startsWith("vault-");
  const isPlanEditor = control === "plan-editor";
  const canSubmitAnswer = Boolean(task.flag || task.waiting_for_input || isPlanEditor);

  const fetchCanonical = useCallback(() => {
    if (!task.project_id) return Promise.resolve(null);
    return api.getProjectCanonical(task.project_id);
  }, [task.project_id]);
  const { data: canonical } = useData<ProjectCanonicalData | null>(fetchCanonical, 30000);

  const fetchResponses = useCallback(() => api.getTaskResponses(task.id), [task.id]);
  const { data: responses, refresh: refreshResponses } = useData<TaskResponse[]>(fetchResponses, 10000);

  const fetchEvents = useCallback(() => api.getTaskEvents(task.id, 20), [task.id]);
  const { data: events, refresh: refreshEvents } = useData<TaskEvent[]>(fetchEvents, 10000);

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
      await Promise.all([refreshResponses(), refreshEvents()]);
      onSaved(task);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  const answerIntro = isPlanEditor
    ? "Build a structured plan-editor command below. Mission Control still sends the generated command through the existing Hermes response processor."
    : "Submit a concise answer for this specific task only. Hermes writes it back to the matching canonical task line, clears the waiting flag, and continues from there.";

  const answerPlaceholder = isPlanEditor
    ? "Generated command appears here; you can still tweak it before submitting."
    : "Type your answer, decision, or clarification...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-6xl rounded-xl overflow-hidden flex flex-col" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", maxHeight: "88vh", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          {project && (
            <span className="text-xs font-medium px-2 py-1 rounded flex items-center gap-1.5 flex-shrink-0" style={{ background: `${project.color}20`, color: project.color }}>
              <Layers size={10} />
              {project.name}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>{task.title}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Board is derived from the vault{task.flag || task.waiting_for_input ? " · waiting for your input" : isPlanEditor ? " · plan editor control" : ""}
            </div>
          </div>
          <button className="p-1.5 rounded-lg transition-colors hover:brightness-125 flex-shrink-0" style={{ color: "var(--text-secondary)" }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_360px] gap-0 min-h-0 overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-6">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                <AlignLeft size={15} />
                Task context
              </div>
              <div className="rounded-xl p-4 text-sm whitespace-pre-wrap" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {noteBody || "No additional detail on the board. Check the canonical vault source for the full project context."}
              </div>
              {sourceLine && <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{sourceLine}</div>}
            </section>

            {canSubmitAnswer && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  <MessageSquareReply size={15} />
                  {isPlanEditor ? "Edit plan through Hermes" : "Answer to unblock Hermes"}
                </div>
                <div className="rounded-xl p-4 space-y-3" style={{ background: task.flag || task.waiting_for_input ? "rgba(239,68,68,0.06)" : "rgba(124,58,237,0.06)", border: `1px solid ${task.flag || task.waiting_for_input ? "rgba(239,68,68,0.22)" : "rgba(124,58,237,0.22)"}` }}>
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>{answerIntro}</div>
                  {isPlanEditor && <SpecEditor task={task} value={answer} onChange={setAnswer} />}
                  <textarea
                    className="w-full min-h-28 rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    placeholder={answerPlaceholder}
                    maxLength={2000}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {hasPendingResponse ? "A response is already pending pickup." : `${answer.length}/2000 chars`}
                    </div>
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ background: "var(--accent-blue)", color: "white" }}
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim() || hasPendingResponse}
                    >
                      {submitting ? "Submitting..." : isPlanEditor ? "Submit plan change" : "Submit answer"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                <History size={15} />
                Task lifecycle events
              </div>
              <div className="space-y-2">
                {(events || []).length === 0 ? (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    No lifecycle events recorded yet.
                  </div>
                ) : (
                  events!.map((event) => {
                    const lifecycle = TASK_LIFECYCLE_META.find((item) => item.id === event.to_lifecycle_status) || currentLifecycle;
                    return (
                      <div key={event.id} className="rounded-xl p-4 space-y-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{event.event_type.replaceAll("_", " ")}</div>
                          {lifecycle && <StatusPill label={lifecycle.label} color={lifecycle.color} />}
                        </div>
                        {(event.note || event.actor) && (
                          <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                            {event.note || "Status updated"}{event.actor ? ` · ${event.actor}` : ""}
                          </div>
                        )}
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {new Date(event.created_at).toLocaleString()}
                          {event.to_board_status && ` · board ${event.to_board_status}`}
                          {event.to_lifecycle_status && ` · lifecycle ${event.to_lifecycle_status}`}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                <FileText size={15} />
                Answer history
              </div>
              <div className="space-y-2">
                {(responses || []).length === 0 ? (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    No answers submitted yet.
                  </div>
                ) : (
                  responses!.map((response) => {
                    const color = response.status === "processed" ? "#22c55e" : response.status === "failed" ? "#ef4444" : "#eab308";
                    return (
                      <div key={response.id} className="rounded-xl p-4 space-y-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{response.created_by}</div>
                          <StatusPill label={response.status} color={color} />
                        </div>
                        <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{response.response_text}</div>
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

          <aside className="overflow-y-auto px-5 py-5 space-y-5" style={{ borderLeft: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
            <MetaSection label="Board status" icon={<Tag size={12} />}>
              <StatusPill label={currentStatus.label} color={currentStatus.color} />
            </MetaSection>

            {currentLifecycle && (
              <MetaSection label="Lifecycle" icon={<Workflow size={12} />}>
                <StatusPill label={currentLifecycle.label} color={currentLifecycle.color} />
              </MetaSection>
            )}

            <MetaSection label="Priority" icon={<Flag size={12} />}>
              <StatusPill label={currentPriority.label} color={currentPriority.color} />
            </MetaSection>

            <MetaSection label="Project" icon={<FolderTree size={12} />}>
              <div className="text-sm" style={{ color: "var(--text-primary)" }}>{project ? project.name : "No project"}</div>
            </MetaSection>

            <MetaSection label="Assigned agent" icon={<User size={12} />}>
              <div className="text-sm" style={{ color: "var(--text-primary)" }}>{agent ? `${agent.avatar || "🤖"} ${agent.name}` : "Unassigned"}</div>
            </MetaSection>

            <MetaSection label="Created" icon={<Calendar size={12} />}>
              <div className="text-sm" style={{ color: "var(--text-primary)" }}>{new Date(task.created_at).toLocaleString()}</div>
            </MetaSection>

            {task.started_at && (
              <MetaSection label="Started" icon={<Calendar size={12} />}>
                <div className="text-sm" style={{ color: "var(--text-primary)" }}>{new Date(task.started_at).toLocaleString()}</div>
              </MetaSection>
            )}

            {task.completed_at && (
              <MetaSection label="Completed" icon={<Calendar size={12} />}>
                <div className="text-sm" style={{ color: "var(--text-primary)" }}>{new Date(task.completed_at).toLocaleString()}</div>
              </MetaSection>
            )}

            {(task.last_error || task.unblock_condition) && (
              <MetaSection label={task.status === "failed" ? "Failure details" : "Blocker details"} icon={<Workflow size={12} />}>
                <div className="space-y-2 text-sm">
                  {task.last_error && <div style={{ color: task.status === "failed" ? "#fca5a5" : "#fdba74" }}><span className="font-medium">Why {task.status === "failed" ? "it failed" : "it is blocked"}:</span> {task.last_error}</div>}
                  {task.unblock_condition && <div style={{ color: "var(--text-primary)" }}><span className="font-medium">Runs again when:</span> {task.unblock_condition}</div>}
                  {task.waiting_for_input && <div style={{ color: "#f97316" }}>This task is explicitly waiting for a human answer or approval.</div>}
                </div>
              </MetaSection>
            )}

            {task.run_id && (
              <MetaSection label="Run linkage" icon={<Workflow size={12} />}>
                <div className="text-sm break-all" style={{ color: "var(--text-primary)" }}>{task.run_id}</div>
              </MetaSection>
            )}

            {isManagedTask && (
              <div className="rounded-xl p-4 text-xs space-y-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>Canonical board item</div>
                <div>This task is managed from the vault and may be overwritten by the next sync.</div>
                {isPlanEditor && <div>Plan editor control: use the structured editor to generate ADD / UPDATE / REMOVE commands without hand-typing the raw syntax.</div>}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function CanonicalSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
        {icon}
        <span>{title}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>None.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm" style={{ color: "var(--text-primary)" }}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
