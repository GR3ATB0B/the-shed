# Handoff → Opus: Backbone Pass

Branch: `3d-workshop-audit` (local-only, do not push). Full raw findings in `AUDIT.md`. This doc is your scope: structural fixes, missing core features, infra, accessibility/perf foundations. Fable 5 will do the detail/polish pass after you land this — don't touch CSS nitpicks, don't rename things for style, don't chase code-quality dedup here unless it blocks a fix below.

Goal: make the site *actually work* (deploys correctly, offline-safe, keyboard/screen-reader reachable, performant) and implement the one missing feature that defines the whole concept (hover highlight). Leave the finishing/polish for Fable 5.

## P0 — site is broken/non-functional today
1. **Fix GLB path bug for prod deploy.** `vite.config.js` sets `base:'/the-shed/'`; `InsideModel.jsx` and `WorldModel.jsx` load `useGLTF('/models/...')` as root-absolute. Use `import.meta.env.BASE_URL` (or equivalent) so it resolves under the base path. Verify with an actual `npm run build && npm run preview` under the `/the-shed/` base, not just dev server.
2. **Self-host the Draco decoder.** No `DRACOLoader`/`setDecoderPath` exists; drei is silently pulling from a Google CDN. Vendor the decoder into `public/draco/` and wire `useGLTF.setDecoderPath` (or drei's loader extension) so model load works offline/without third-party CDN.
3. **Stop depending on pmndrs CDN for HDR environments.** `Environment preset="apartment"/"park"` fetch at runtime. Either bundle local HDR assets in `public/` or replace with a lighting rig that doesn't need network fetch.
4. **Add an error boundary** around the Canvas/model tree. If any GLB/decoder/HDR fails, users currently get a permanent black screen. Show a real fallback message + retry.
5. **Resolve the `GoldBar_Cube` conflict.** It's claimed by both the `forging` cluster and `DECORATION_PREFIXES`; decoration check wins today, silently killing its interactivity even though overlay copy references it. Decide which it is and fix `clusters.js`.
6. **Clean dead build artifacts:** remove committed `dist/models/*` duplicates and all `.DS_Store` files tracked despite `.gitignore` listing them (`git rm --cached`).
7. **Decide on Howler:** either wire real audio (dirs are empty scaffolding) or remove the dependency and the dead `public/audio/`, `public/textures/` folders and the no-op mute button.
8. **Remove unused assets:** `src/assets/hero.png`, `vite.svg` — no imports reference them.

## P1 — the missing signature feature
9. **Implement cluster hover highlighting.** This is the core interaction the whole concept rests on and it currently does nothing beyond a pointer cursor change. `hoveredCluster` is set in state but nothing reads it to affect materials. Build: emissive boost and/or outline pass (EffectComposer outline, or per-mesh emissive lerp) applied to every mesh belonging to the hovered cluster group. `clusterMeshes`/`areaMeshes` registries already exist in the store for this — they're currently dead, wire them up.
10. **Fix `HoverLabel`.** It never reads `hoveredCluster` and is hardcoded always-visible with dead CSS transition states. Make it actually reflect the hovered object, or cut it and build the real thing.
11. **Add a real loading screen.** `Suspense fallback={null}` = black void during the 3.86MB decode + HDR fetch. Use drei's `<Loader/>`/`useProgress` (or custom) with actual progress feedback.
12. **Fix corkboard's dual identity.** It's routed to a camera view *and* marked fullscreen — the camera move is wasted since the fullscreen sheet immediately covers it. Pick one behavior.
13. **Gate/remove debug OrbitControls from reachable UX.** Double-clicking the canvas currently drops any user into a broken free-fly camera with no visible way back. Either require a dev-only flag, or add a visible on-screen toggle/indicator with an obvious return path.
14. **Wire or remove dead store nav methods.** `cycleView`/arrow-key cycling is documented in HANDOFF but never bound to anything; `goHome` is barely used. Either implement the documented arrow-key nav or delete dead methods — don't leave both.

## P2 — accessibility and mobile foundations (structural, not visual polish)
15. **Add an accessible content mirror.** All portfolio content is currently only reachable via canvas raycasting — screen readers and crawlers get nothing. Add an off-screen (visually hidden, not `display:none`) DOM structure mirroring `CLUSTER_CONTENT`, with real headings/landmarks, OR commit to a documented alternate path (e.g. a `/content` fallback page). This is a structural decision, make it and implement the skeleton.
16. **Keyboard-reachable clusters.** Canvas interaction is currently mouse-only, failing WCAG 2.1.1. Add a way to Tab through clusters and activate with Enter/Space (can piggyback on the same registries used for hover highlighting).
17. **Respect `prefers-reduced-motion`.** Gate GSAP camera dives, breathing sway, parallax, and welcome/intro animations behind a media-query check — swap to instant transitions when set.
18. **Basic mobile viability pass.** Zero `@media` queries exist today. At minimum: cap `dpr={[1,2]}` on Canvas, ensure overlay panel doesn't break at small widths, ensure touch tap works as click-equivalent for cluster activation (may already work via pointer events — verify), prevent bottom-rail/subnav overlap. Full mobile redesign is out of scope here — just make it not broken.
19. **Verify cluster mesh-name mapping is robust to re-export.** String-prefix matching against Blender names (with existing typos like "circut", "dumbbellwight") has no guard. Add either a startup sanity check that logs/warns on unmatched clusters, or a small mapping test.

## P3 — perf and SEO structural fixes
20. **Fix eager preload timing.** `useGLTF.preload('/models/inside.glb')` fires 3.86MB download immediately on import, competing with the intro sequence. Defer preload until after intro starts/finishes.
21. **Shadow cost pass.** Two 2048×2048 shadow maps, `castShadow`+`receiveShadow` on every mesh in both scenes. Cut resolution, disable shadows on small/decorative meshes, set `shadow.autoUpdate=false` for the static scene.
22. **Remove redundant AA.** `EffectComposer multisampling={4}` stacked on canvas `antialias:true` — pick one.
23. **Fix per-frame allocations in CameraRig's `useFrame`** — reuse `Vector3` refs instead of allocating new ones every frame.
24. **Add real SEO meta:** description, Open Graph (title/description/image/url/type), Twitter Card, canonical, robots, a real page title with a descriptor. Given #15's accessible content mirror, this also gives crawlers something to index.
25. **Update `CLAUDE.md`** to describe the actual current architecture (GLB/Blender pivot) — it currently documents a deleted codebase and will mislead anyone (or any agent) who trusts it. Do this last, once the above changes land, so it documents the real end state.

Do not touch: font loading, CSS spacing/contrast/typography nits, code-dedup refactors (LinkList component, renderBody split), naming-convention unification, sticky-card rotation math, first-letter styling. Those are Fable 5's pass — listed in `HANDOFF-FABLE.md`.
