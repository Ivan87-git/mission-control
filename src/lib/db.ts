
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.MC_DB_PATH || path.join(process.cwd(), "data", "mission-control.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
    runMigrations(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline',
      current_task TEXT,
      project_id TEXT,
      model TEXT,
      provider TEXT,
      uptime TEXT DEFAULT '0h',
      tasks_completed INTEGER DEFAULT 0,
      last_seen TEXT,
      avatar TEXT DEFAULT '🤖',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      color TEXT DEFAULT '#4f8fff',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      project_id TEXT,
      assigned_agent TEXT,
      status TEXT NOT NULL DEFAULT 'backlog',
      lifecycle_status TEXT NOT NULL DEFAULT 'ready',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      started_at TEXT,
      blocked_at TEXT,
      waiting_for_input_at TEXT,
      completed_at TEXT,
      last_event_at TEXT,
      waiting_for_input INTEGER NOT NULL DEFAULT 0,
      run_id TEXT,
      source_task_id TEXT,
      lease_owner TEXT,
      lease_expires_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      content TEXT,
      flag TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assigned_agent) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      type TEXT NOT NULL DEFAULT 'task',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_projects (
      agent_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      PRIMARY KEY (agent_id, project_id),
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS task_responses (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      response_text TEXT NOT NULL,
      created_by TEXT NOT NULL DEFAULT 'Ivan',
      status TEXT NOT NULL DEFAULT 'pending',
      processing_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS task_events (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      actor TEXT,
      event_type TEXT NOT NULL,
      from_board_status TEXT,
      to_board_status TEXT,
      from_lifecycle_status TEXT,
      to_lifecycle_status TEXT,
      note TEXT,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_task_responses_task_id ON task_responses(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_responses_status ON task_responses(status);
    CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_events_created_at ON task_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_lifecycle_status ON tasks(lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_tasks_run_id ON tasks(run_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_lease_expires_at ON tasks(lease_expires_at);
  `);
}

function runMigrations(db: Database.Database) {
  const cols = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
  const colNames = cols.map((c) => c.name);

  const addColumn = (name: string, sql: string) => {
    if (!colNames.includes(name)) db.exec(sql);
  };

  addColumn("content", "ALTER TABLE tasks ADD COLUMN content TEXT");
  addColumn("flag", "ALTER TABLE tasks ADD COLUMN flag TEXT");
  addColumn("lifecycle_status", "ALTER TABLE tasks ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'ready'");
  addColumn("started_at", "ALTER TABLE tasks ADD COLUMN started_at TEXT");
  addColumn("blocked_at", "ALTER TABLE tasks ADD COLUMN blocked_at TEXT");
  addColumn("waiting_for_input_at", "ALTER TABLE tasks ADD COLUMN waiting_for_input_at TEXT");
  addColumn("completed_at", "ALTER TABLE tasks ADD COLUMN completed_at TEXT");
  addColumn("last_event_at", "ALTER TABLE tasks ADD COLUMN last_event_at TEXT");
  addColumn("waiting_for_input", "ALTER TABLE tasks ADD COLUMN waiting_for_input INTEGER NOT NULL DEFAULT 0");
  addColumn("run_id", "ALTER TABLE tasks ADD COLUMN run_id TEXT");
  addColumn("source_task_id", "ALTER TABLE tasks ADD COLUMN source_task_id TEXT");
  addColumn("lease_owner", "ALTER TABLE tasks ADD COLUMN lease_owner TEXT");
  addColumn("lease_expires_at", "ALTER TABLE tasks ADD COLUMN lease_expires_at TEXT");
  addColumn("attempt_count", "ALTER TABLE tasks ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0");
  addColumn("last_error", "ALTER TABLE tasks ADD COLUMN last_error TEXT");

  db.exec(`
    CREATE TABLE IF NOT EXISTS task_events (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      actor TEXT,
      event_type TEXT NOT NULL,
      from_board_status TEXT,
      to_board_status TEXT,
      from_lifecycle_status TEXT,
      to_lifecycle_status TEXT,
      note TEXT,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_events_created_at ON task_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_lifecycle_status ON tasks(lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_tasks_run_id ON tasks(run_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_lease_expires_at ON tasks(lease_expires_at);
  `);

  db.exec(`
    UPDATE tasks
    SET lifecycle_status = CASE
      WHEN flag = 'red' THEN 'waiting_user'
      WHEN status = 'done' THEN 'completed'
      WHEN status = 'review' THEN 'reviewing'
      WHEN status = 'in_progress' THEN 'active'
      WHEN status = 'backlog' THEN 'ready'
      ELSE 'pending'
    END
    WHERE lifecycle_status IS NULL OR lifecycle_status = '' OR lifecycle_status = 'ready';

    UPDATE tasks
    SET waiting_for_input = CASE WHEN flag = 'red' OR lifecycle_status = 'waiting_user' THEN 1 ELSE 0 END;
  `);
}
