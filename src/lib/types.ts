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
  lease_owner?: string | null;
  lease_expires_at?: string | null;
  attempt_count?: number;
  last_error?: string | null;
  unblock_condition?: string | null;
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


export interface ActiveRuntimeTask {
  mission_id: string;
  task_id: string;
  title: string;
  status: string;
  started_at?: string | null;
  blocked_by_reason?: string | null;
  unblock_condition?: string | null;
  needs_user_input?: boolean;
}

export interface DispatcherStatus {
  dispatcher_running: boolean;
  dispatcher_pid?: number | null;
  dispatcher_started_at?: string | null;
  active_missions: number;
  active_runtime_tasks: ActiveRuntimeTask[];
  stale_missions: { mission_id: string; status: string; pid?: number | null; reason: string }[];
  last_dispatch_log_line?: string | null;
}

export interface LiveStatusTask {
  id: string;
  title: string;
  status: TaskBoardStatus;
  lifecycle_status: TaskLifecycleStatus;
  priority?: string | null;
  run_id?: string | null;
  last_error?: string | null;
  unblock_condition?: string | null;
  waiting_for_input?: boolean;
  last_event_at?: string | null;
  updated_at?: string | null;
  latest_event_type?: string | null;
  latest_event_actor?: string | null;
  latest_event_note?: string | null;
  latest_event_created_at?: string | null;
}

export interface LiveStatusAction {
  id: string;
  task_id: string;
  title: string;
  run_id?: string | null;
  board_status: TaskBoardStatus;
  event_type: string;
  actor?: string | null;
  note?: string | null;
  created_at: string;
}

export interface LiveStatusSnapshot {
  snapshot_at: string;
  refresh_interval_seconds: number;
  orchestrator: {
    active_runs: number;
    blocked_runs: number;
    failed_runs: number;
    latest_run_update?: string | null;
    current_runs: Array<{
      mission_id: string;
      mission_name: string;
      status: string;
      updated_at: string;
      error?: string | null;
      progress_label: string;
      running_tasks: number;
      blocked_tasks: number;
      failed_tasks: number;
    }>;
  };
  dispatcher: DispatcherStatus;
  active_tasks: LiveStatusTask[];
  recent_task_actions: LiveStatusAction[];
}
