from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

stats_route = (ROOT / "src/app/api/stats/route.ts").read_text()
tasks_view = (ROOT / "src/components/TasksView.tsx").read_text()
readme = (ROOT / "README.md").read_text()

assert "total_completed: taskStats.done" in stats_route, "stats route should report total_completed from done tasks"
assert "+ New Task" not in tasks_view, "TasksView should not show a misleading '+ New Task' button"
assert "Open Spec" in tasks_view or "Open Plan" in tasks_view, "TasksView should offer a vault/spec-aligned action instead"
assert "Next.js 15" in readme, "README should document Next.js 15"
assert "Tailwind CSS v3" in readme, "README should document Tailwind CSS v3"
assert "better-sqlite3@11" in readme, "README should document better-sqlite3@11"

print("phase1 truthfulness checks passed")
