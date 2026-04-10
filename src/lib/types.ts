export interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline";
  current_task?: string;
  project_id?: string;
  model?: string;
  provider?: string;
  uptime?: string;
  tasks_completed?: number;
  last_seen?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed";
  progress: number;
  color: string;
  created_at: string;
  updated_at: string;
  agent_ids?: string[] | null;
  task_count?: number;
  completed_tasks?: number;
}

export interface ProjectCanonicalData {
  project_id: string;
  vault_slug: string;
  vault_overview_path: string;
  vault_current_state_path: string;
  vault_next_actions_path: string;
  vault_open_questions_path: string;
  goal: string;
  status: string;
  summary: string;
  next_actions: string[];
  open_questions: string[];
}

export interface Task {
  id: string;
  title: string;
  project_id: string | null;
  assigned_agent: string | null;
  status: "ideas" | "backlog" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at?: string;
  content?: string;
  flag?: string | null;
}

export interface TaskResponse {
  id: string;
  task_id: string;
  response_text: string;
  created_by: string;
  status: "pending" | "processed" | "failed";
  processing_note?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface ActivityItem {
  id: string;
  agent_name: string;
  action: string;
  detail: string;
  created_at: string;
  type: "task" | "system" | "deploy" | "error" | "commit";
}

export interface Stats {
  active_agents: number;
  total_agents: number;
  active_projects: number;
  in_progress_tasks: number;
  total_completed: number;
}
