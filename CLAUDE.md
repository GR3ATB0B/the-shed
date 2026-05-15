# whatthenash-redesign — project context for Claude

## Project goal
Redesign whatthenash.com as a 3D explorable shed portfolio. Henry Heffernan vibe, Poly Pizza low-poly aesthetic. Built locally first; will replace the current site at github.com/GR3ATB0B/whatthenash (`~/code/whatthenash`) only after Nash approves it.

**Do NOT push this repo to GitHub yet.** Local-only until Nash says otherwise.

## Source of truth
Full spec: `~/Downloads/HANDOFF.md` — read it before making non-trivial decisions. 18-section design doc with phases, object inventory, animation strategy, etc.

## Phase status as of 2026-05-13 night

- [x] **Phase 0** — Vite + React + R3F + drei + GSAP + Zustand + Howler scaffolded, dev server runs
- [x] **Phase 1** — Empty shed room shell with atmosphere across all 4 time-of-day moods
- [x] **Phase 2** — First cluster (Electronics) built end-to-end with hover/click/overlay/back loop
- [ ] **Phase 3** — Entrance sequence (cinematic intro through doors)
- [ ] **Phase 4** — Remaining 9 clusters
- [ ] **Phase 5** — Audio, mobile fallback, loading screen, SEO

## How to run
```bash
cd ~/code/whatthenash-redesign
NPM_CONFIG_CACHE=/tmp/npm-cache npm run dev
```
Opens at `http://localhost:5173/`. HUD top-left shows brand; top-right has time-of-day selector and mute toggle.

Double-click canvas toggles between cinematic camera and free OrbitControls (debug helper).

## Architecture as built

- `src/store.js` — Zustand store. State: `introPlaying`, `hoveredCluster`, `selectedCluster`, `muted`, `timeOfDay`. `timeOfDay` auto-detects from `new Date().getHours()` on load.
- `src/components/Scene.jsx` — root R3F Canvas. ACES filmic tone mapping. Background+fog color shifts with TOD. Mounts Shed, Bench, Window, EdisonBulb, Electronics, Lighting, CameraRig, PostProcessing.
- `src/components/Shed.jsx` — procedural plank walls/floor/rafters. Window cutout is on **left wall** (x = -W/2). `W=10, D=8, H=4.8`.
- `src/components/Bench.jsx` — loads `desk.glb`, auto-fits to 4.0m wide, positions back face at `-D/2 + 0.18` so it sits flush to back wall without clipping. StrictMode-safe via `fittedRef` guard.
- `src/components/Window.jsx` — emissive sky plane + frame mullions on left wall + directional sun light + additive light shaft. Per-TOD intensities.
- `src/components/EdisonBulb.jsx` — loads `ceiling-lamp.glb`, sets emissive on bulb child mesh (detected by name regex or bright base color), flickering pointLight. `toneMapped=false` on bulb so bloom catches it.
- `src/components/Lighting.jsx` — ambient + hemisphere per TOD.
- `src/components/CameraRig.jsx` — fixed cinematic camera at `REST_POS=(2.6, 1.7, 3.2)` looking at `REST_LOOK=(-0.9, 1.35, -2.0)`. Mouse parallax + breathing sway. On `selectedCluster` change, GSAP tween to `CLUSTER_VIEWS[id]` and back.
- `src/components/PostProcessing.jsx` — Bloom (mipmap blur, luminanceThreshold 0.75) + HueSaturation + BrightnessContrast + Vignette. Per-TOD tune.
- `src/components/clusters/ClusterBase.jsx` — `useClusterInteraction(id)` hook returns `{ ref, handlers, isHovered, isSelected, dimOthers }`. Hover scales 1.06 via GSAP. `useEmissivePulse(matRef, opts)` for animated emissive.
- `src/components/clusters/Electronics.jsx` — Electronics cluster. Uses `arduino-uno.glb` + `circuit-board-1.glb` + `multimeter.glb` (no soldering-iron GLB available yet — see "Open" below). Includes 2 small red LED chips with pulse, hover ring (`HoverGlow`).
- `src/components/ui/HUD.jsx` — top bar with brand + TOD selector + mute toggle.
- `src/components/ui/ClusterOverlay.jsx` — slide-in panel keyed by `selectedCluster`. Content map `CLUSTER_CONTENT` per cluster. ESC and backdrop click both close.
- `src/main.jsx` — exposes `window.__store` in dev for test access (only when `import.meta.env.DEV`).

## Models
58 GLBs from Poly Pizza copied + renamed to kebab-case in `public/models/`. Apostrophe stripped from `top-hat.glb`. Not yet Draco-compressed (handoff section 11 mandates this before launch; defer until Phase 4 to avoid stalling iteration).

Models currently in use:
- `desk.glb` — workbench (Bench.jsx)
- `ceiling-lamp.glb` — Edison bulb (EdisonBulb.jsx)
- `arduino-uno.glb`, `circuit-board-1.glb`, `multimeter.glb` — Electronics cluster

## Key decisions made
- **Window on LEFT wall (not right)** — handoff said "high on the side wall" without specifying which. Left was chosen because camera angle (`2.6, 1.7, 3.2` looking left-back) sees left wall, so window is visible from rest pose. If switching cameras later, reconsider.
- **Camera angle: 3/4 from front-right** — not Henry Heffernan's straight-on, slight angle for spatial depth. Nash approved framing after iter (back-wall bench centered, window on left edge, bulb top, rafters peeking).
- **Phase 2 cluster: Electronics with Arduino+circuit board+multimeter** — handoff specified soldering iron + ESP32 but no soldering iron GLB available. Same cluster ID, swap models when Nash grabs soldering iron from Poly Pizza.
- **`CLUSTER_VIEWS.electronics`** in CameraRig — close-up pos `(0.95, 1.35, -1.5)` looking at `(0.6, 1.05, -3.6)`. Tune per cluster when adding more.

## Known gotchas
- **StrictMode double-effect can double-scale GLBs.** All fitting useLayoutEffects in Bench.jsx and Electronics.jsx GLB component use a `fittedRef` guard. Don't remove without replacing.
- **THREE.WebGLShadowMap PCFSoftShadowMap deprecation warning** — comes from internal drei/postprocessing usage. Non-blocking.
- **Multiple THREE instances warning** — fixed via `resolve.dedupe: ['three']` in vite.config.js, but still occasionally surfaces during dep optimization. Harmless.
- **Synthetic DOM PointerEvents don't trigger R3F raycaster.** Tested click/hover via `window.__store.getState().selectCluster('electronics')` instead. Real mouse works fine in browser.
- **Backdrop click closes overlay** — `.cluster-overlay.open .cluster-overlay__backdrop` has `pointer-events: auto`. Intended.

## Open questions for Nash
- Laptop or CRT for Code & AI cluster? (handoff section 18)
- Single door or double door at entrance? (handoff section 18)
- Soldering iron GLB — search Poly Pizza or accept the Arduino+circuit board substitute permanently?
- Should rest camera angle stay 3/4 from right, or try a more straight-on Henry Heffernan framing for cluster 4 (Code & AI)?

## Where we left off (2026-05-13 ~10:25 PM EDT)
Phase 2 verified working. Nash going to bed. Next session resumes either:
1. **Tighten Phase 2 hover state** (hover ring visibility, LED pulse intensity, scale feel) once tested with live mouse
2. **Start Phase 3 — entrance sequence** (camera path through doors, bulb-click-on moment, skip-intro button, localStorage flag)
3. **Build next cluster** (Photography is recommended next per handoff section 4 priority — `camera.glb` is in `public/models/`)

Recommended next: option 2 (Phase 3 entrance) because it's the wow-moment per handoff section 8, and it can be built without finishing more clusters first. Phase 4 clusters can be built one-by-one after.

## Don't do
- Don't push to GitHub.
- Don't add markdown docs/README — Nash explicitly avoids them in default flow.
- Don't add comments explaining what code does (project follows the global "no comments unless WHY is non-obvious" rule).
- Don't backfill clusters out of priority order — handoff section 8 has the priority list.
- Don't replace placeholder mouse hover testing with real Puppeteer/Playwright mouse moves unless Nash asks; visual hover validation can be done live by Nash.
