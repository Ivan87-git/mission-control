# 🎯 Mission Control

AI Agent Orchestration Dashboard — monitor projects, agents, tasks, and activity from one place.

Built as a lightweight, self-hosted alternative to commercial agent dashboards. Inspired by AgentCenter, tenacitOS, and builderz-labs/mission-control.

## Features

- **Dashboard** — Overview with stats, active agents, live activity feed, and project cards
- **Projects** — Track projects with progress bars, assigned agents, and task counts
- **Agents** — Monitor agent status (active/idle/offline), current tasks, uptime, model info
- **Task Board** — Vault-derived kanban board with funnel, ideas, backlog, in-progress, review, and done columns
- **Activity Feed** — Polling-based log of agent actions (tasks, commits, deploys, errors)
- **Dark theme** — Clean, modern UI with a space-command-center aesthetic

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v3
- `better-sqlite3@11`
- Lucide React icons

## Getting Started

```bash
git clone https://github.com/Ivan87-git/mission-control.git
cd mission-control
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Current shape

- SQLite-backed operational board
- Board is derived from canonical vault/project notes
- Explicit task lifecycle fields plus task event history for task truthfulness
- Polling refreshes every 10 seconds; no WebSockets yet by design
- Task detail modal supports review, answers, structured plan-control workflows, and lifecycle history
- Runs view reads mission-runner state snapshots directly from local JSON state files

## Roadmap

- [ ] Leasing / claim semantics for dispatch
- [ ] Run detail drill-down into logs/output files
- [ ] Richer structured spec editing and validation
- [ ] Optional worktree-backed execution

## License

MIT
