
export interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline" | "error";
  currentTask: string | null;
  projectId: string | null;
  model: string;
  provider: string;
  uptime: string;
  tasksCompleted: number;
  lastSeen: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  progress: number;
  agents: string[];
  taskCount: number;
  completedTasks: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignedAgent: string | null;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  agentName: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "task" | "system" | "deploy" | "error" | "commit";
}

export const agents: Agent[] = [
  {
    id: "a1", name: "Hermes", status: "active",
    currentTask: "Building mission control dashboard",
    projectId: "p1", model: "claude-opus-4", provider: "Anthropic",
    uptime: "14d 6h", tasksCompleted: 247, lastSeen: "just now",
    avatar: "🪶"
  },
  {
    id: "a2", name: "CodeWeaver", status: "active",
    currentTask: "Refactoring auth middleware",
    projectId: "p2", model: "claude-sonnet-4", provider: "Anthropic",
    uptime: "3d 12h", tasksCompleted: 89, lastSeen: "2m ago",
    avatar: "🕸️"
  },
  {
    id: "a3", name: "ResearchBot", status: "idle",
    currentTask: null,
    projectId: null, model: "gpt-4.1", provider: "OpenAI",
    uptime: "7d 0h", tasksCompleted: 156, lastSeen: "15m ago",
    avatar: "🔬"
  },
  {
    id: "a4", name: "DeployAgent", status: "active",
    currentTask: "Rolling out v2.3.1 to staging",
    projectId: "p3", model: "claude-sonnet-4", provider: "Anthropic",
    uptime: "21d 8h", tasksCompleted: 312, lastSeen: "just now",
    avatar: "🚀"
  },
  {
    id: "a5", name: "DataMiner", status: "offline",
    currentTask: null,
    projectId: null, model: "llama-3.3-70b", provider: "Local",
    uptime: "0h", tasksCompleted: 45, lastSeen: "2h ago",
    avatar: "⛏️"
  },
  {
    id: "a6", name: "Guardian", status: "active",
    currentTask: "Security audit on payment module",
    projectId: "p2", model: "claude-opus-4", provider: "Anthropic",
    uptime: "10d 3h", tasksCompleted: 78, lastSeen: "just now",
    avatar: "🛡️"
  },
];

export const projects: Project[] = [
  {
    id: "p1", name: "Mission Control", description: "AI agent orchestration dashboard",
    status: "active", progress: 35, agents: ["a1"],
    taskCount: 24, completedTasks: 8, color: "#4f8fff"
  },
  {
    id: "p2", name: "E-Commerce Platform", description: "Full-stack marketplace with payments",
    status: "active", progress: 72, agents: ["a2", "a6"],
    taskCount: 48, completedTasks: 35, color: "#a855f7"
  },
  {
    id: "p3", name: "Infrastructure", description: "CI/CD pipelines and cloud infra",
    status: "active", progress: 88, agents: ["a4"],
    taskCount: 16, completedTasks: 14, color: "#22c55e"
  },
  {
    id: "p4", name: "Data Pipeline", description: "ETL pipeline for analytics warehouse",
    status: "paused", progress: 45, agents: [],
    taskCount: 32, completedTasks: 14, color: "#eab308"
  },
];

export const tasks: Task[] = [
  { id: "t1", title: "Design dashboard layout", projectId: "p1", assignedAgent: "a1", status: "done", priority: "high", createdAt: "2h ago" },
  { id: "t2", title: "Implement agent status panel", projectId: "p1", assignedAgent: "a1", status: "in_progress", priority: "high", createdAt: "1h ago" },
  { id: "t3", title: "Add real-time activity feed", projectId: "p1", assignedAgent: null, status: "backlog", priority: "medium", createdAt: "30m ago" },
  { id: "t4", title: "Create task board component", projectId: "p1", assignedAgent: null, status: "backlog", priority: "medium", createdAt: "30m ago" },
  { id: "t5", title: "Refactor auth middleware", projectId: "p2", assignedAgent: "a2", status: "in_progress", priority: "critical", createdAt: "4h ago" },
  { id: "t6", title: "Payment gateway integration", projectId: "p2", assignedAgent: "a6", status: "review", priority: "high", createdAt: "1d ago" },
  { id: "t7", title: "Deploy staging v2.3.1", projectId: "p3", assignedAgent: "a4", status: "in_progress", priority: "high", createdAt: "20m ago" },
  { id: "t8", title: "Update Kubernetes manifests", projectId: "p3", assignedAgent: "a4", status: "done", priority: "medium", createdAt: "3h ago" },
  { id: "t9", title: "Setup monitoring alerts", projectId: "p3", assignedAgent: null, status: "backlog", priority: "low", createdAt: "1d ago" },
  { id: "t10", title: "Security audit - payments", projectId: "p2", assignedAgent: "a6", status: "in_progress", priority: "critical", createdAt: "2h ago" },
];

export const activities: ActivityItem[] = [
  { id: "ac1", agentName: "Hermes", action: "completed", detail: "Design dashboard layout", timestamp: "just now", type: "task" },
  { id: "ac2", agentName: "DeployAgent", action: "started", detail: "Rolling out v2.3.1 to staging", timestamp: "2m ago", type: "deploy" },
  { id: "ac3", agentName: "Guardian", action: "flagged", detail: "SQL injection risk in /api/checkout", timestamp: "5m ago", type: "error" },
  { id: "ac4", agentName: "CodeWeaver", action: "pushed", detail: "feat: add JWT rotation to auth middleware", timestamp: "8m ago", type: "commit" },
  { id: "ac5", agentName: "Hermes", action: "started", detail: "Implement agent status panel", timestamp: "12m ago", type: "task" },
  { id: "ac6", agentName: "ResearchBot", action: "completed", detail: "Competitive analysis report for Q2", timestamp: "18m ago", type: "task" },
  { id: "ac7", agentName: "DeployAgent", action: "completed", detail: "Update Kubernetes manifests", timestamp: "25m ago", type: "task" },
  { id: "ac8", agentName: "System", action: "alert", detail: "DataMiner went offline - connection timeout", timestamp: "32m ago", type: "system" },
  { id: "ac9", agentName: "Guardian", action: "started", detail: "Security audit on payment module", timestamp: "45m ago", type: "task" },
  { id: "ac10", agentName: "CodeWeaver", action: "pushed", detail: "fix: race condition in session handler", timestamp: "1h ago", type: "commit" },
  { id: "ac11", agentName: "Hermes", action: "created", detail: "4 new tasks for Mission Control project", timestamp: "1h ago", type: "task" },
  { id: "ac12", agentName: "DeployAgent", action: "completed", detail: "SSL certificate renewal for *.prod.internal", timestamp: "2h ago", type: "deploy" },
];
