
"use client";
import { useCallback } from "react";
import ActivityFeed from "./ActivityFeed";
import { api } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function ActivityView() {
  const { data: activities } = useData(useCallback(() => api.getActivity(50), []), 5000);

  if (!activities) return <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Activity Log</h1>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>LIVE</span>
        </div>
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <ActivityFeed items={activities} />
      </div>
    </div>
  );
}
