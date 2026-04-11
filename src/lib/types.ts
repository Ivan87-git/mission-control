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
  status: "active" | "funnel" | "completed";
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

export type TaskBoardStatus = "funnel" | "ideas" | "backlog" | "assigned" | "in_progress" | "review" | "blocked" | "failed" | "done";
export type TaskLifecycleStatus = "pending" | "ready" | "active" | "blocked" | "waiting_user" | "reviewing" | "completed" | "cancelled";
export type TaskEventType = "created" | "updated" | "board_status_changed" | "lifecycle_changed" | "response_submitted" | "run_linked" | "note";

export interface Task {
  id: string;
  title: string;
  project_id: string | null;
  assigned_agent: string | null;
  status: TaskBoardStatus;
  lifecycle_status: TaskLifecycleStatus;
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at?: string;
  started_at?: string | null;
  blocked_at?: string | null;
  waiting_for_input_at?: string | null;
  completed_at?: string | null;
  last_event_at?: string | null;
  waiting_for_input?: boolean;
  run_id?: string | null;
  source_task_id?: string | null;
  content?: string;
  flag?: string | null;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  actor?: string | null;
  event_type: TaskEventType;
  from_board_status?: TaskBoardStatus | null;
  to_board_status?: TaskBoardStatus | null;
  from_lifecycle_status?: TaskLifecycleStatus | null;
  to_lifecycle_status?: TaskLifecycleStatus | null;
  note?: string | null;
  payload?: string | null;
  created_at: string;
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

export interface RunTaskSummary {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  mc_task_id?: string | null;
  source_task_id?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  blocked_by_reason?: string | null;
  unblock_condition?: string | null;
  summary?: string | null;
}

export interface RunSummary {
  mission_id: string;
  mission_name: string;
  source_file?: string | null;
  project_id?: string | null;
  status: string;
  pid?: number | null;
  started_at?: string | null;
  updated_at: string;
  completed_at?: string | null;
  error?: string | null;
  provider?: string | null;
  model?: string | null;
  workdir?: string | null;
  total_tasks: number;
  completed_tasks: number;
  blocked_tasks: number;
  failed_tasks: number;
  running_tasks: number;
  ready_tasks: number;
  tasks: RunTaskSummary[];
}

export interface Stats {
  active_agents: number;
  total_agents: number;
  active_projects: number;
  in_progress_tasks: number;
  total_completed: number;
}
