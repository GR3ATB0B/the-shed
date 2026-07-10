# Full Apple-bar Audit — whatthenash-redesign (branch: 3d-workshop-audit)

Full raw findings from Opus review agent, 2026-07-04. Kept as source of truth; split into HANDOFF-OPUS.md (backbone) and HANDOFF-FABLE.md (polish) for actual work.

## Architecture / Structural Issues
1. CLAUDE.md entirely stale — describes deleted pre-pivot architecture (Shed.jsx, Bench.jsx, Electronics.jsx, TOD selector, 58 GLBs). Real code is the Blender-GLB pivot in HANDOFF.md/README.md.
2. **Production is broken**: `vite.config.js` sets `base:'/the-shed/'` but `InsideModel.jsx` / `WorldModel.jsx` load `useGLTF('/models/inside.glb')` / `'/models/world.glb'` with root-absolute paths → 404 on GitHub Pages. Must use `import.meta.env.BASE_URL`.
3. No `DRACOLoader`/`setDecoderPath` anywhere — drei's `useGLTF` silently fetches Draco decoder from Google CDN. Fails offline/privacy-blocked. Should self-host in `public/draco/`.
4. `Environment preset="apartment"/"park"` fetches HDRIs from pmndrs CDN at runtime — undeclared network dep, breaks lighting if unreachable.
5. `GoldBar_Cube` listed both as `forging` cluster member and in `DECORATION_PREFIXES` — decoration check runs first, gold bar silently dropped from interactivity. Forging overlay copy references it anyway (dead reference).
6. `public/audio/` and `public/textures/` empty; `howler` is a dependency but never imported anywhere. Dead dep + dead dirs.
7. Two GLBs duplicated into committed `dist/models/` (dist is gitignored but stale artifacts present on disk, doubling repo weight).
8. `src/assets/hero.png` and `vite.svg` unused — dead assets.
9. No error boundary anywhere — any GLB load failure (see #2) = permanent black screen, no message, no retry.
10. `.DS_Store` committed in `public/models/`, `dist/models/`, repo root despite being gitignored.

## Visual / Design Polish Issues
11. IBM Plex Serif/Mono referenced ~30x in App.css but never loaded (no `@font-face`, no Google Fonts link, no bundled font). Entire typographic design intent silently degrades to Georgia fallback.
12. **Core "hover highlights whole cluster" interaction is not implemented.** `onPointerOver` only sets state; nothing reads it to alter materials/outline. Marquee interaction of the whole concept is missing.
13. `HoverLabel` never reads `hoveredCluster`; renders static per-view hint, always visible (`visible` class hardcoded). Elaborate CSS fade-in/out animation is dead code.
14. No loading screen — `Suspense fallback={null}` shows black void during multi-MB load + Draco decode + HDR fetch. drei's `<Loader/>`/`useProgress` unused.
15. Corkboard cluster routes to a camera view AND is marked `fullscreen:true` — camera move wasted, fullscreen sheet immediately covers it.
16. `::first-letter` bold applies to every `<p>` in overlay bodies, including mid-thought paragraphs — looks like accidental drop-cap.
17. Sticky-card rotation (`(i*17)%9-4deg`) collides with `.sticky:hover{transform...!important}` — cards snap to 0deg on hover instead of easing.
18. `pickCard` uses `Math.random()` in `useMemo` but is dead code — only used in non-fullscreen branch; corkboard (the only content with `cards`) is fullscreen.
19. Debug `OrbitControls` toggled by **double-clicking the canvas** in production — common user action dumps them into broken free-fly camera with no way back/indication. HANDOFF explicitly says don't ship this.
20. Inconsistent close-button wording/iconography across panels (`← back`, `← back to the shed`, `skip`, `Got it`).
21. Post-processing (vignette/hue/brightness) only mounts in `Scene`, not `WorldScene` — visible color-grade pop during intro→interior transition.

## Interaction / UX Issues
22. Keyboard shortcuts `h`,`1-4` undiscoverable; documented arrow-key cycling (`cycleView` exists in store) is never bound to any key. Dead store method.
23. `goHome` store method dead — only used by `h` key handler.
24. No focus trap/management when overlays open; no focus return on close.
25. Cluster overlay backdrop has ambiguous clickable dead-zone (transparent center 35%, panel pinned right).
26. Mute button is a no-op — no audio exists at all (#6).
27. `↻ intro` replay resets to aerial but doesn't reset `currentView` — stale state on re-entry.
28. Welcome banner blocks clicks on 3D content behind it with no backdrop, not obviously so.
29. Parallax pointer listener always running on `window`, even with overlay open (damped but still computing every frame).
30. Clicking non-interactive set-dressing does nothing with zero feedback — compounded by missing hover state (#12).
31. Intro dive timing is a hardcoded magic-number handshake between `App.jsx` fade delay and `WorldScene.jsx` GSAP timeline — any tween tweak desyncs fade from arrival.

## Accessibility Issues
32. Zero screen-reader access — all content lives inside canvas raycasting, no `<main>`, no skip link, no accessible content mirror.
33. Canvas has no keyboard interaction at all — mouse-only raycasting, fails WCAG 2.1.1.
34. No `prefers-reduced-motion` handling anywhere despite heavy GSAP camera dives/parallax/breathing sway.
35. No `aria-live`/`role` usage — overlays open with no AT announcement.
36. Color contrast risks: `--ink-faint: rgba(42,31,18,0.3)` on cream well below 4.5:1; cork tagline also borderline.
37. No `:focus-visible` styles anywhere — default outline on rotated/transformed buttons will render clipped/rotated.
38. Icon-glyph buttons (`↻`, `→`, `←`) inconsistently labeled with `aria-label`.

## Performance Issues
39. `inside.glb` (3.86MB) `preload`s immediately on module import — competes with intro, world model, Draco decoder, two HDR maps for bandwidth on first paint.
40. No texture optimization (KTX2/basis), no mesh decimation/LOD despite low-poly aesthetic goal.
41. Shadows everywhere: 2048×2048 shadow maps ×2 scenes, `castShadow`+`receiveShadow` on every mesh, no culling, no `shadow.autoUpdate=false` for static scene. Will tank mid-tier GPU/mobile.
42. Custom `onBeforeCompile` shader re-textures the room procedurally — ironic given Blender-baked pivot; extra shader compile cost.
43. Per-frame `new THREE.Vector3()` allocations inside `useFrame` in CameraRig — GC churn at 60fps.
44. Triple full `scene.traverse` passes on mount in InsideModel.jsx.
45. `EffectComposer multisampling={4}` stacked with canvas `antialias:true` — redundant double AA cost.
46. No `dpr` clamp on Canvas — full DPR on 3x Retina/mobile for a shadow-heavy scene.

## Incomplete Features (HANDOFF Phase H)
47. Audio, loading screen, mobile fallback, perf pass — all unbuilt despite README implying shipped.
48. Zero `@media` queries anywhere — no mobile experience at all; touch-only interaction with no hover feedback, overlapping controls at small widths.
49. Arrow-key view cycling (documented UX) not implemented (dup of #22).
50. Cluster membership is string-prefix matched against Blender mesh names with typos ("circut", "dumbbellwight") carried through — no guard/test if names drift on re-export, cluster silently goes dead.
51. Brain→bookshelf "easter egg" two-step zoom (HANDOFF Phase F) flattened to same single-overlay flow as everything else.

## Code Quality Issues
52. Dead vars in WorldScene.jsx: unused `paused` prop, unused `lookRef`, typo `dovingRef`.
53. `clusterMeshes`/`areaMeshes` registries written but only consumed by the missing hover-highlight feature (#12) — dead state until that's built.
54. `resolveTargets` walks parent chain every pointer event even though `clusterId` was already stamped onto ancestors at load — redundant runtime walk.
55. `findTopLevelName` brittle string-match on exact GLTF root name `'Scene'`.
56. `HIDE_TOPLEVEL_NAMES = new Set(['Sphere002'])` — magic hardcoded name, no comment explaining why.
57. Three near-identical `<a target rel>` link-rendering blocks in ClusterOverlay.jsx — should be one `<LinkList>` component.
58. `renderBody` nested function handles three unrelated render modes (panel/corkboard/fullscreen) — should split into separate components.
59. `VIEW_BY_CLUSTER` effect races CameraRig tween and DeskSubNav/corkboard logic (relates to #15).
60. Fade opacity transition: CSS `transition:none` correct given GSAP drives it manually, but unfade effect reads store value at effect-run time — possible visible seam if tween finishes early on fast machines.
61. README calls Scene.jsx "InsideScene" — naming doesn't match code, confusing indirection.
62. No consistent naming convention: kebab (`desk-corkboard`), camelCase (`currentView`), Blender Pascal/snake (`GoldBar_Cube`), lowercase ids (`rcvehicles`).
63. No CI lint step (deploy.yml only builds); several files export both components and non-components, violating react-refresh config with no warning surfaced.

## SEO / Meta Issues
64. No `<meta name="description">`, no Open Graph, no Twitter Card, no canonical, no robots, no share image.
65. Fully client-rendered inside canvas — crawlers see empty `<div id="root">`, zero indexable content, no SSR/prerender/noscript fallback.
66. `<title>What the Nash</title>` — generic, no descriptor.
67. No PWA manifest / apple-mobile-web-app meta despite being an experiential walk-around site.
68. Favicon path is fine in prod (Vite rewrites the HTML ref) — noted for completeness, not a bug.

## Fix-first priority
#2 (prod 404s) → #11 (fonts never load) → #12 (missing signature hover interaction) → #48/#34/#32-33 (zero mobile/motion/a11y) → #3-4 (hidden CDN deps) → #1 (docs lie about the codebase).
