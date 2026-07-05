# Handoff → Fable 5: Cleanup/Polish Pass

Branch: `3d-workshop-audit`. Full raw findings in `AUDIT.md`. **Run this pass only after Opus's backbone work (see `HANDOFF-OPUS.md`) has landed** — several items here depend on structures Opus is adding (hover-highlight registries, accessible content mirror, etc). If Opus hasn't finished a dependency, skip that item and note it, don't block on it or re-implement the backbone yourself.

Goal: this is the detail pass. Small, contained, low-risk fixes — visual polish, dead code cleanup, naming consistency, accessibility fit-and-finish, code dedup. Don't add new features, don't change architecture, don't touch anything listed as Opus's scope.

## Visual polish
1. **Load the actual fonts.** App.css references IBM Plex Serif/Mono ~30 times but nothing ever loads them — no `@font-face`, no Google Fonts link, no bundled file. Add a Google Fonts `<link>` (or self-hosted `@font-face` if preferred for privacy/offline) in `index.html`. This alone fixes the biggest silent visual miss on the site — the whole "paper aesthetic" typography is currently invisible.
2. **Fix `::first-letter` bold rule** — currently applies to every `<p>` in overlay bodies including mid-thought second paragraphs. Scope it to only the first paragraph of a body block (e.g. `p:first-of-type::first-letter`).
3. **Fix sticky-card hover rotation.** `.sticky:hover{transform...!important}` currently snaps cards to 0deg instantly instead of easing from their random tilt. Remove the `!important`, compose the hover transform with the existing per-card inline rotation (e.g. via a CSS variable) so it eases instead of snapping.
4. **Remove dead `pickCard` random-selection code** in `ClusterOverlay.jsx` — it's guarded to only run in a branch that never executes given corkboard is always fullscreen. Delete it.
5. **Unify close-button wording/iconography.** Currently `← back`, `← back to the shed`, `skip`, `Got it` — pick one consistent pattern (e.g. always `←` glyph + short label) across cluster overlay, corkboard, and welcome banner.
6. **Match post-processing between scenes.** `Scene.jsx` has vignette/hue/brightness; `WorldScene.jsx` has none — causes a visible color-grade pop during the intro→interior transition. Add matching (or intentionally different-but-blended) grading to `WorldScene`.

## Interaction detail
7. **Fix stale `currentView` after intro replay.** `↻ intro` resets to aerial but doesn't reset `currentView`, leaving stale state on re-entry. Reset it alongside the other intro-reset logic.
8. **Improve backdrop click affordance on cluster overlay.** The dim center 35% is clickable but looks inert — add a visible hint (cursor change, subtle hover shift) so it reads as dismissible.
9. **Add backdrop or dimming behind the welcome banner** so it's clear the 3D scene behind it isn't interactive yet.
10. **Reduce parallax computation when overlay is open** — pointermove listener runs and math executes every frame even while damped to near-zero. Early-return in the handler when an overlay is open, don't just damp the output.
11. **Add visible feedback for clicking non-interactive set dressing** — even a subtle "nothing here" cue (brief cursor change or no-op animation) so users can tell interactive from decorative once hover-highlight (Opus's work) exists to contrast against.
12. **Decouple intro fade timing from the camera tween's magic numbers** — currently `App.jsx`'s fade delay (5.9s/0.9s) and `WorldScene.jsx`'s GSAP timeline (4.6s+3.4s-1.2s overlap=6.8s) must be hand-kept in sync. Derive the fade trigger from the same timeline object/callback instead of a hardcoded duplicate number.

## Accessibility fit-and-finish
13. **Add `:focus-visible` styles** for all interactive chips/buttons, especially the rotated paper-chip elements where the default outline will render clipped/rotated oddly. Give them a branded focus ring.
14. **Fix contrast issues:** `--ink-faint: rgba(42,31,18,0.3)` on cream background is well under 4.5:1 (used on close-button border, welcome skip text) — darken it. Check `.cork-full__tagline`'s `rgba(255,230,180,0.7)` on the brown cork gradient too.
15. **Add missing `aria-label`s** to icon-only buttons (e.g. `skip →` in `IntroOverlay.jsx` currently has none while others do) — be consistent.
16. **Add `aria-live` announcement** when overlays open/close, once Opus's accessible content mirror exists to announce from.

## Code quality / dedup
17. **Consolidate the three near-identical `<a target rel>` link blocks** in `ClusterOverlay.jsx` (card links, content links, sticky links) into one shared `<LinkList>` component.
18. **Split `renderBody`'s three unrelated render modes** (panel / corkboard / fullscreen) into separate components (`ClusterPanel`, `CorkboardSheet`, etc.) instead of one large nested function with big branches.
19. **Remove dead variables:** `paused` prop and `lookRef` in `WorldScene.jsx` (unused); fix typo `dovingRef` → `divingRef`.
20. **Simplify `resolveTargets`** — it walks the parent chain on every pointer event even though `clusterId` is already stamped onto ancestors at load time. Read `e.object.userData` directly where possible.
21. **Comment or remove the `HIDE_TOPLEVEL_NAMES = new Set(['Sphere002'])` magic value** — add a one-line comment explaining what it is (stray Blender debug sphere?) so it doesn't look like an unexplained hack.
22. **Unify naming conventions** where practical without breaking Blender mesh-name matching: pick one convention for view/cluster ids (currently mixed kebab/camelCase/lowercase) and apply consistently in code-owned identifiers (leave Blender-sourced names like `GoldBar_Cube` alone since those must match the GLB).
23. **Fix the README's "InsideScene is Scene.jsx" indirection** — either rename the doc reference or leave a one-line note; don't let docs and code disagree on the component's name.
24. **Add a lint step to CI** (`deploy.yml` currently only builds) so react-refresh warnings (mixed component/non-component exports in `store.js`, `clusters.js`) actually surface.

Do not touch: production path/base-URL bugs, Draco/HDR CDN dependencies, error boundaries, hover-highlight core feature, loading screen, mobile media queries, keyboard cluster activation, shadow/perf tuning, SEO meta tags, CLAUDE.md rewrite. Those are Opus's scope in `HANDOFF-OPUS.md` — if you find one still broken when you get here, flag it back rather than fixing it yourself, since Opus's fix may involve a different structural approach than a quick patch.
