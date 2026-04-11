"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import ProjectsView from "@/components/ProjectsView";
import AgentsView from "@/components/AgentsView";
import TasksView from "@/components/TasksView";
import ActivityView from "@/components/ActivityView";
import RunsView from "@/components/RunsView";

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  projects: ProjectsView,
  agents: AgentsView,
  tasks: TasksView,
  runs: RunsView,
  activity: ActivityView,
};

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");
  const ViewComponent = views[activeView] || DashboardView;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="ml-56 p-6">
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 className="text-lg font-bold capitalize" style={{ color: "var(--text-primary)" }}>
              {activeView === "runs" ? "Mission runs" : activeView}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>System Online</span>
            </div>
          </div>
        </div>

        <ViewComponent />
      </main>
    </div>
  );
}
