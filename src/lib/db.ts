
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "mission-control.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data dir exists
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
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
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

    CREATE INDEX IF NOT EXISTS idx_task_responses_task_id ON task_responses(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_responses_status ON task_responses(status);
  `);
}

function runMigrations(db: Database.Database) {
  const cols = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
  const colNames = cols.map((c) => c.name);

  if (!colNames.includes("content")) {
    db.exec("ALTER TABLE tasks ADD COLUMN content TEXT");
  }
  if (!colNames.includes("flag")) {
    db.exec("ALTER TABLE tasks ADD COLUMN flag TEXT");
  }

  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_task_responses_task_id ON task_responses(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_responses_status ON task_responses(status);
  `);
}
