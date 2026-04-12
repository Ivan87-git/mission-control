
const BASE = "";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patchJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getAgents: () => fetchJson<import("./types").Agent[]>("/api/agents"),
  getProjects: () => fetchJson<import("./types").Project[]>("/api/projects"),
  getProjectCanonical: (id: string) =>
    fetchJson<import("./types").ProjectCanonicalData>(`/api/projects/${id}/vault`),
  getTasks: (projectId?: string) =>
    fetchJson<import("./types").Task[]>(`/api/tasks${projectId ? `?project_id=${projectId}` : ""}`),
  getTask: (id: string) => fetchJson<import("./types").Task>(`/api/tasks/${id}`),
  getTaskResponses: (taskId: string) =>
    fetchJson<import("./types").TaskResponse[]>(`/api/tasks/${taskId}/responses`),
  getTaskEvents: (taskId: string, limit = 30) =>
    fetchJson<import("./types").TaskEvent[]>(`/api/task-events?task_id=${encodeURIComponent(taskId)}&limit=${limit}`),
  submitTaskResponse: (taskId: string, body: Record<string, unknown>) =>
    postJson<import("./types").TaskResponse>(`/api/tasks/${taskId}/responses`, body),
  createTaskEvent: (body: Record<string, unknown>) =>
    postJson<import("./types").TaskEvent>("/api/task-events", body),
  getActivity: (limit = 20) => fetchJson<import("./types").ActivityItem[]>(`/api/activity?limit=${limit}`),
  getStats: () => fetchJson<import("./types").Stats>("/api/stats"),
  getRuns: (projectId?: string, limit = 25) =>
    fetchJson<import("./types").RunSummary[]>(`/api/runs?limit=${limit}${projectId ? `&project_id=${encodeURIComponent(projectId)}` : ""}`),
  getDispatcherStatus: () =>
    fetchJson<import("./types").DispatcherStatus>("/api/dispatcher-status"),
  getLiveStatus: () =>
    fetchJson<import("./types").LiveStatusSnapshot>("/api/live-status"),
  updateTask: (id: string, body: Record<string, unknown>) =>
    patchJson<import("./types").Task>(`/api/tasks/${id}`, body),
  updateTaskResponse: (id: string, body: Record<string, unknown>) =>
    patchJson<import("./types").TaskResponse>(`/api/task-responses/${id}`, body),
};
