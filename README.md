# 🎯 Mission Control

AI Agent Orchestration Dashboard — monitor projects, agents, tasks, and activity from one place.

Built as a lightweight, self-hosted alternative to commercial agent dashboards. Inspired by AgentCenter, tenacitOS, and builderz-labs/mission-control.

## Features

- **Dashboard** — Overview with stats, active agents, live activity feed, and project cards
- **Projects** — Track projects with progress bars, assigned agents, and task counts
- **Agents** — Monitor agent status (active/idle/offline), current tasks, uptime, model info
- **Task Board** — Kanban board with backlog, in-progress, review, and done columns
- **Activity Feed** — Real-time log of all agent actions (tasks, commits, deploys, errors)
- **Dark theme** — Clean, modern UI with a space-command-center aesthetic

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Lucide React icons

## Getting Started

```bash
git clone https://github.com/Ivan87-git/mission-control.git
cd mission-control
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Roadmap

- [ ] REST API for agents to report status
- [ ] WebSocket real-time updates
- [ ] Persistent storage (SQLite/Postgres)
- [ ] Agent heartbeat system
- [ ] Task assignment and drag-n-drop
- [ ] Integration with Hermes cron jobs and sessions
- [ ] Authentication

## License

MIT
