
"use client";
import { useState } from "react";
import {
  LayoutDashboard, FolderKanban, Bot, Activity, ListTodo,
  Settings, ChevronLeft, ChevronRight, Zap
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "tasks", label: "Task Board", icon: ListTodo },
  { id: "activity", label: "Activity", icon: Activity },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #4f8fff, #a855f7)" }}>
          <Zap size={18} color="white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>
            MISSION CONTROL
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive ? "glow-blue" : "hover:bg-white/5"
              }`}
              style={{
                background: isActive ? "rgba(79, 143, 255, 0.15)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
              }}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-all"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/5 transition-all"
          style={{ color: "var(--text-secondary)" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
