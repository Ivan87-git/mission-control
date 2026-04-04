
import { ActivityItem } from "@/lib/mock-data";
import { CheckCircle2, GitCommit, Rocket, AlertTriangle, Server } from "lucide-react";

const typeConfig = {
  task: { icon: CheckCircle2, color: "#4f8fff" },
  commit: { icon: GitCommit, color: "#a855f7" },
  deploy: { icon: Rocket, color: "#22c55e" },
  error: { icon: AlertTriangle, color: "#ef4444" },
  system: { icon: Server, color: "#eab308" },
};

export default function ActivityFeed({ items, compact = false }: { items: ActivityItem[]; compact?: boolean }) {
  const displayItems = compact ? items.slice(0, 8) : items;

  return (
    <div className="space-y-1">
      {displayItems.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/3 transition-all"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${config.color}20` }}
            >
              <Icon size={13} style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs">
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {item.agentName}
                </span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>{item.action}</span>{" "}
                <span style={{ color: "var(--text-primary)" }} className="truncate">
                  {item.detail}
                </span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {item.timestamp}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
