
import { getDb } from "./db";
import { v4 as uuid } from "uuid";

export function seedIfEmpty() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as c FROM agents").get() as { c: number };
  if (count.c > 0) return; // already seeded

  // Agents
  const agents = [
    { id: "a1", name: "Hermes", status: "active", current_task: "Building mission control dashboard", project_id: "p1", model: "claude-opus-4", provider: "Anthropic", uptime: "14d 6h", tasks_completed: 247, last_seen: new Date().toISOString(), avatar: "🪶" },
    { id: "a2", name: "CodeWeaver", status: "active", current_task: "Refactoring auth middleware", project_id: "p2", model: "claude-sonnet-4", provider: "Anthropic", uptime: "3d 12h", tasks_completed: 89, last_seen: new Date().toISOString(), avatar: "🕸️" },
    { id: "a3", name: "ResearchBot", status: "idle", current_task: null, project_id: null, model: "gpt-4.1", provider: "OpenAI", uptime: "7d 0h", tasks_completed: 156, last_seen: new Date().toISOString(), avatar: "🔬" },
    { id: "a4", name: "DeployAgent", status: "active", current_task: "Rolling out v2.3.1 to staging", project_id: "p3", model: "claude-sonnet-4", provider: "Anthropic", uptime: "21d 8h", tasks_completed: 312, last_seen: new Date().toISOString(), avatar: "🚀" },
    { id: "a5", name: "DataMiner", status: "offline", current_task: null, project_id: null, model: "llama-3.3-70b", provider: "Local", uptime: "0h", tasks_completed: 45, last_seen: new Date(Date.now() - 7200000).toISOString(), avatar: "⛏️" },
    { id: "a6", name: "Guardian", status: "active", current_task: "Security audit on payment module", project_id: "p2", model: "claude-opus-4", provider: "Anthropic", uptime: "10d 3h", tasks_completed: 78, last_seen: new Date().toISOString(), avatar: "🛡️" },
  ];

  const insertAgent = db.prepare(`INSERT INTO agents (id, name, status, current_task, project_id, model, provider, uptime, tasks_completed, last_seen, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const a of agents) {
    insertAgent.run(a.id, a.name, a.status, a.current_task, a.project_id, a.model, a.provider, a.uptime, a.tasks_completed, a.last_seen, a.avatar);
  }

  // Projects
  const projects = [
    { id: "p1", name: "Mission Control", description: "AI agent orchestration dashboard", status: "active", progress: 35, color: "#4f8fff" },
    { id: "p2", name: "E-Commerce Platform", description: "Full-stack marketplace with payments", status: "active", progress: 72, color: "#a855f7" },
    { id: "p3", name: "Infrastructure", description: "CI/CD pipelines and cloud infra", status: "active", progress: 88, color: "#22c55e" },
    { id: "p4", name: "Data Pipeline", description: "ETL pipeline for analytics warehouse", status: "paused", progress: 45, color: "#eab308" },
  ];

  const insertProject = db.prepare(`INSERT INTO projects (id, name, description, status, progress, color) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const p of projects) {
    insertProject.run(p.id, p.name, p.description, p.status, p.progress, p.color);
  }

  // Agent-project associations
  const insertAP = db.prepare(`INSERT INTO agent_projects (agent_id, project_id) VALUES (?, ?)`);
  insertAP.run("a1", "p1");
  insertAP.run("a2", "p2");
  insertAP.run("a6", "p2");
  insertAP.run("a4", "p3");

  // Tasks
  const tasks = [
    { id: "t1", title: "Design dashboard layout", project_id: "p1", assigned_agent: "a1", status: "done", priority: "high" },
    { id: "t2", title: "Implement agent status panel", project_id: "p1", assigned_agent: "a1", status: "in_progress", priority: "high" },
    { id: "t3", title: "Add real-time activity feed", project_id: "p1", assigned_agent: null, status: "backlog", priority: "medium" },
    { id: "t4", title: "Create task board component", project_id: "p1", assigned_agent: null, status: "backlog", priority: "medium" },
    { id: "t5", title: "Refactor auth middleware", project_id: "p2", assigned_agent: "a2", status: "in_progress", priority: "critical" },
    { id: "t6", title: "Payment gateway integration", project_id: "p2", assigned_agent: "a6", status: "review", priority: "high" },
    { id: "t7", title: "Deploy staging v2.3.1", project_id: "p3", assigned_agent: "a4", status: "in_progress", priority: "high" },
    { id: "t8", title: "Update Kubernetes manifests", project_id: "p3", assigned_agent: "a4", status: "done", priority: "medium" },
    { id: "t9", title: "Setup monitoring alerts", project_id: "p3", assigned_agent: null, status: "backlog", priority: "low" },
    { id: "t10", title: "Security audit - payments", project_id: "p2", assigned_agent: "a6", status: "in_progress", priority: "critical" },
  ];

  const insertTask = db.prepare(`INSERT INTO tasks (id, title, project_id, assigned_agent, status, priority) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const t of tasks) {
    insertTask.run(t.id, t.title, t.project_id, t.assigned_agent, t.status, t.priority);
  }

  // Activity
  const activities = [
    { agent_name: "Hermes", action: "completed", detail: "Design dashboard layout", type: "task" },
    { agent_name: "DeployAgent", action: "started", detail: "Rolling out v2.3.1 to staging", type: "deploy" },
    { agent_name: "Guardian", action: "flagged", detail: "SQL injection risk in /api/checkout", type: "error" },
    { agent_name: "CodeWeaver", action: "pushed", detail: "feat: add JWT rotation to auth middleware", type: "commit" },
    { agent_name: "Hermes", action: "started", detail: "Implement agent status panel", type: "task" },
    { agent_name: "ResearchBot", action: "completed", detail: "Competitive analysis report for Q2", type: "task" },
    { agent_name: "DeployAgent", action: "completed", detail: "Update Kubernetes manifests", type: "task" },
    { agent_name: "System", action: "alert", detail: "DataMiner went offline - connection timeout", type: "system" },
    { agent_name: "Guardian", action: "started", detail: "Security audit on payment module", type: "task" },
    { agent_name: "CodeWeaver", action: "pushed", detail: "fix: race condition in session handler", type: "commit" },
  ];

  const insertActivity = db.prepare(`INSERT INTO activity (id, agent_name, action, detail, type) VALUES (?, ?, ?, ?, ?)`);
  for (const a of activities) {
    insertActivity.run(uuid(), a.agent_name, a.action, a.detail, a.type);
  }
}
