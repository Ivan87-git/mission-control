
import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/mock-data";

export default function ProjectsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Projects</h1>
        <button
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: "var(--accent-blue)", color: "white" }}
        >
          + New Project
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
