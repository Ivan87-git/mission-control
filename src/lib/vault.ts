import fs from "fs";
import path from "path";

const VAULT_PATH = process.env.HERMES_MEMORY_VAULT_PATH || "/home/ivan/Documents/Obsidian/Hermes Memory Vault";
const PROJECTS_DIR = path.join(VAULT_PATH, "02 - Projects");

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

function readIfExists(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function parseFrontmatter(text: string): { meta: Record<string, string>; body: string } {
  if (!text.startsWith("---\n")) return { meta: {}, body: text };
  const rest = text.slice(4);
  const split = rest.indexOf("\n---\n");
  if (split === -1) return { meta: {}, body: text };
  const frontmatter = rest.slice(0, split);
  const body = rest.slice(split + 5);
  const meta: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    meta[key] = value;
  }
  return { meta, body };
}

function extractSection(text: string, heading: string): string {
  const lines = text.split(/\r?\n/);
  const target = `## ${heading}`.toLowerCase();
  let capture = false;
  const out: string[] = [];
  for (const line of lines) {
    if (line.toLowerCase().startsWith("## ")) {
      if (line.toLowerCase() === target) {
        capture = true;
        continue;
      }
      if (capture) break;
    }
    if (capture) out.push(line);
  }
  return out.join("\n").trim();
}

function extractBulletItems(sectionText: string): string[] {
  return sectionText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function extractManagedBulletItems(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .filter((line) => line.includes("[mc]"))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function stripMarkers(text: string): string {
  let body = text.trim();
  while (body.startsWith("[")) {
    const end = body.indexOf("]");
    if (end === -1) break;
    body = body.slice(end + 1).trim();
  }
  return body;
}

function cleanItems(items: string[]): string[] {
  return items
    .map((item) => stripMarkers(item))
    .map((item) => {
      const parts = item.split("::", 2);
      return parts[0].trim();
    })
    .filter((item) => Boolean(item))
    .filter((item) => !item.startsWith("`["))
    .filter((item) => !item.startsWith("Use `::`"))
    .filter((item) => !item.startsWith("Use ["))
    .filter((item) => !item.startsWith("Use `[") )
    .filter((item) => !item.startsWith("Legend:"));
}

export function getProjectCanonicalDataByMcId(mcProjectId: string): ProjectCanonicalData | null {
  if (!fs.existsSync(PROJECTS_DIR)) return null;
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const overviewPath = path.join(PROJECTS_DIR, slug, "overview.md");
    const currentStatePath = path.join(PROJECTS_DIR, slug, "current-state.md");
    const nextActionsPath = path.join(PROJECTS_DIR, slug, "next-actions.md");
    const openQuestionsPath = path.join(PROJECTS_DIR, slug, "open-questions.md");

    const overviewText = readIfExists(overviewPath);
    if (!overviewText) continue;
    const { meta, body } = parseFrontmatter(overviewText);
    const mappedMcId = meta.mc_project_id || meta.project_id || slug;
    if (mappedMcId !== mcProjectId) continue;

    const currentStateText = readIfExists(currentStatePath);
    const goal = extractSection(body, "Goal");
    const status = extractSection(currentStateText, "Status").split(/\r?\n/)[0]?.trim() || "";
    const summary = extractSection(currentStateText, "Summary");
    const nextActions = cleanItems(extractManagedBulletItems(readIfExists(nextActionsPath)));
    const openQuestions = cleanItems(extractManagedBulletItems(readIfExists(openQuestionsPath)));

    return {
      project_id: mcProjectId,
      vault_slug: slug,
      vault_overview_path: overviewPath,
      vault_current_state_path: currentStatePath,
      vault_next_actions_path: nextActionsPath,
      vault_open_questions_path: openQuestionsPath,
      goal,
      status,
      summary,
      next_actions: nextActions,
      open_questions: openQuestions,
    };
  }

  return null;
}
