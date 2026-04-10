"use client";

import { useEffect, useCallback } from "react";
import { X, FileText, ListChecks, CircleHelp, FolderTree } from "lucide-react";
import { Project, ProjectCanonicalData } from "@/lib/types";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const fetchCanonical = useCallback(() => api.getProjectCanonical(project.id), [project.id]);
  const { data, error, loading } = useData<ProjectCanonicalData>(fetchCanonical, 30000);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          maxHeight: "88vh",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-start justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${project.color}20`, color: project.color }}>
                {project.status}
              </span>
              {data && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  Canonical vault view
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{project.name}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
          </div>
          <button className="p-1.5 rounded-lg transition-colors hover:brightness-125" style={{ color: "var(--text-secondary)" }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {loading && <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading canonical vault content…</div>}
          {!loading && error && (
            <div className="text-sm rounded-lg px-4 py-3" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              No canonical vault sections found for this project yet.
            </div>
          )}
          {data && (
            <>
              <Section icon={<FileText size={14} />} title="Summary" content={data.summary || "No summary yet."} />
              <Section icon={<FolderTree size={14} />} title="Goal" content={data.goal || "No goal captured yet."} />
              <SectionList icon={<ListChecks size={14} />} title="Next Actions" items={data.next_actions} empty="No canonical next actions yet." />
              <SectionList icon={<CircleHelp size={14} />} title="Open Questions" items={data.open_questions} empty="No canonical open questions yet." />
              <div className="rounded-lg px-4 py-3 text-xs" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <div>Vault slug: <span style={{ color: "var(--text-primary)" }}>{data.vault_slug}</span></div>
                <div className="mt-1">Overview: <span style={{ color: "var(--text-primary)" }}>{data.vault_overview_path}</span></div>
                <div className="mt-1">Current state: <span style={{ color: "var(--text-primary)" }}>{data.vault_current_state_path}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="rounded-lg px-4 py-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {icon}
        {title}
      </div>
      <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{content}</div>
    </div>
  );
}

function SectionList({ icon, title, items, empty }: { icon: React.ReactNode; title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-lg px-4 py-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{empty}</div>
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
