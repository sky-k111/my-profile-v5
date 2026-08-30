export default function ProjectMediaLoader({ projectTitle }: { projectTitle: string }) {
  return (
    <div
      className="projects-transition__project-loader"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${projectTitle} project media`}
    >
      <span className="projects-transition__project-loader-marquee" aria-hidden="true" />
    </div>
  );
}
