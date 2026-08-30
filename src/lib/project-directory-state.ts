export type ProjectNameEmphasis = 'featured' | 'active' | 'muted';

export function resolveProjectNameEmphasis(projectId: string, hoveredProjectId: string | null): ProjectNameEmphasis {
  if (hoveredProjectId === null) return 'featured';
  return projectId === hoveredProjectId ? 'active' : 'muted';
}

export const PROJECT_SWITCH_LOADING_MS = 2_000;
export const PROJECT_MEDIA_REVEAL_MS = 520;

export function shouldStartProjectSwitch(activeProjectId: string, nextProjectId: string): boolean {
  return activeProjectId !== nextProjectId;
}
