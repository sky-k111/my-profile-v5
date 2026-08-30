const LONG_JUMP_VIEWPORT_RATIO = 0.75;
const PROJECTS_INTRO_READY_TIME = 1.02;

export function resolveNavigationScrollBehavior(
  distance: number,
  viewportHeight: number,
  reducedMotion: boolean,
): ScrollBehavior {
  if (reducedMotion || viewportHeight <= 0) return 'auto';
  return distance < viewportHeight * LONG_JUMP_VIEWPORT_RATIO ? 'smooth' : 'auto';
}

export function resolveProjectsNavigationTimelineTime(id: string) {
  return id === 'projects' ? PROJECTS_INTRO_READY_TIME : 0;
}
