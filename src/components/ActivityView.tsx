
import ActivityFeed from "./ActivityFeed";
import { activities } from "@/lib/mock-data";

export default function ActivityView() {
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
