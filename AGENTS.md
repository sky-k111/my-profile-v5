# Repository guidance

## Purpose

This is Yikai Chen's single-page React portfolio. `src/components/Hero.tsx` owns the opening portrait experience; `src/about/AboutSection.tsx` owns the scroll-driven bilingual photo essay.

## Architecture

- `src/components/` contains the Hero and its focused visual primitives.
- `src/about/` contains About content, rendering, cursor behavior, and the single GSAP/ScrollTrigger timeline.
- `src/lib/` contains pure helpers shared with Node tests.
- `public/` contains shipped photographs, portrait sources, and local fonts. Do not replace a photograph unless the user identifies the target.
- `tests/*.test.mjs` are source and pure-function regression tests run by Node's test runner.

## Interaction constraints

- Keep the custom circular cursor scoped to About; Hero uses the native pointer.
- Do not add another continuous pointer or scroll animation loop to About.
- Pause Hero animation work while Hero is offscreen.
- Preserve `prefers-reduced-motion` fallbacks and the semantic content order.
- Update bilingual copy in `src/about/about-content.ts`; keep photo IDs stable because the motion timeline targets them.

## Commands

- `npm run dev` — start Vite development mode.
- `npm run test` — run the regression suite.
- `npm run typecheck` — run strict TypeScript checks.
- `npm run build` — create the production build.
- `npm run check` — run all required verification.

Generated directories such as `dist/`, `output/`, `.playwright-cli/`, `.superpowers/`, and `.worktrees/` are not source and may be regenerated or removed.
