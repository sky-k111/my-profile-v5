export type SiteNavItem = {
  id: string;
  label: string;
};

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export function resolveSectionNavigationUrl(id: string, pathname: string, search: string) {
  const baseUrl = `${pathname}${search}`;
  return id === 'home' ? baseUrl : `${baseUrl}#${id}`;
}

export function resolveInitialSectionId(hash: string, items: SiteNavItem[]) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  return items.some(item => item.id === id) ? id : null;
}
