# whatthenash-redesign — project context for Claude

## Project goal
A 3D explorable "shed" portfolio for whatthenash.com. Aerial cabin intro,
dive through the door, then walk around the inside of a shed and click on the
things Nash builds (electronics, AI agents, forging, photography, coffee, etc).
Henry Heffernan vibe, low-poly Blender aesthetic, paper/sticky-note UI.

**Do NOT push this repo to GitHub.** Local-only until Nash says otherwise. It
deploys (when it does) to GitHub Pages under the base path `/the-shed/`.

## How to run
```bash
NPM_CONFIG_CACHE=/tmp/npm-cache npm install
NPM_CONFIG_CACHE=/tmp/npm-cache npm run dev
```
Dev serves at `http://localhost:5173/the-shed/` (note the base path — `base:
'/the-shed/'` is set in `vite.config.js`, so the app lives under `/the-shed/`
in dev, preview, and prod alike).

`npm run build` → `dist/`; `npm run preview` serves the built app under the
same base path. `npm run lint` runs eslint.

## Architecture as built (Blender-GLB pivot)

The entire experience is driven by **two Draco-compressed GLBs** exported from
Blender, not procedural geometry. There is no per-object component — clusters
are matched against Blender mesh names at load time.

- `public/models/world.glb` (~300KB) — the aerial cabin/island for the intro.
- `public/models/inside.glb` (~3.9MB) — the whole shed interior. Every
  interactive "cluster" is a named mesh (or group of meshes) inside this file.
- `public/draco/` — **self-hosted** Draco decoder (decoder .js/.wasm/.wrapper).
  Wired via `useGLTF.setDecoderPath` in `src/assetPath.js`. Do not remove; it
  is what lets the compressed GLBs decode without the Google gstatic CDN.

### Asset paths — important
All runtime asset URLs (GLBs, Draco decoder) MUST go through
`assetUrl(path)` in `src/assetPath.js`, which prepends `import.meta.env.BASE_URL`
(`/the-shed/`). Root-absolute paths like `/models/inside.glb` 404 in production.
This is the single most load-bearing fix in the codebase — do not regress it.

### State (`src/store.js`)
Zustand store. Key state:
- `introPhase`: `'aerial' | 'diving' | 'inside'` — drives which scene mounts.
  Persisted via `localStorage('nash_entered')` so returning visitors skip the
  intro.
- `currentView`: `'home' | 'desk' | 'floor' | 'bookshelf'` (+ desk sub-views
  `'desk-top'`, `'desk-corkboard'`). Camera pose per view lives in `CameraRig`.
- `hoveredCluster` / `selectedCluster` — hover + open state.
- `clusterMeshes` / `areaMeshes` — registries of THREE meshes per cluster/area,
  populated by `InsideModel` on load and **consumed by `HoverHighlight`** for
  the emissive highlight.
- `fadeOpacity` — the black fade between world and inside, driven by GSAP.

### Clusters (`src/clusters.js`)
`CLUSTERS` maps a cluster id → `{ label, area, view, members }` where `members`
are **Blender mesh-name prefixes** (they carry Blender typos like `circut`,
`dumbbellwight` — leave them; they must match the GLB). `DECORATION_PREFIXES`
lists non-interactive set dressing. `clusterForName` / `isDecoration` resolve a
mesh name to a cluster. `InsideModel` warns at startup if any cluster matched
zero meshes (catches a re-export that renamed a mesh).

### Content (`src/content.js`)
`CLUSTER_CONTENT` — the portfolio copy for every cluster (title, tagline, body,
links, list, and the corkboard's `cards`). **Shared** by the 3D overlay
(`ClusterOverlay`) and the accessible DOM mirror (`AccessibleContent`).

### Components
- `src/App.jsx` — top-level. Mounts `WorldScene` (intro) or `Scene` (inside)
  inside an `ErrorBoundary`, plus the loading screen, accessible mirror, and
  all HUD/overlay UI. Owns the GSAP dive-fade timing.
- `src/components/WorldScene.jsx` — aerial Canvas + GSAP dive timeline to the
  door. `src/components/WorldModel.jsx` loads `world.glb`.
- `src/components/Scene.jsx` — the inside Canvas (dpr clamped `[1,2]`, no canvas
  AA — the EffectComposer does AA). Mounts `Lighting`, `InsideModel`, a
  Lightformer `Environment` (no CDN HDR), `HoverHighlight`, `CameraRig`,
  `PostProcessing`. Debug `OrbitControls` is **DEV-only** (double-click) with a
  visible on-screen return badge.
- `src/components/InsideModel.jsx` — loads `inside.glb`, builds the cluster/area
  mesh registries, stamps `userData.clusterId`/`areaId` up the tree, wires
  hover/click raycasting, and applies the shadow-cost policy. `preloadInsideModel`
  is exported and fired from `App` once the dive starts (deferred, not on import).
- `src/components/HoverHighlight.jsx` — the signature interaction. Reads
  `hoveredCluster` + the mesh registries each frame and lerps an emissive boost
  onto the whole hovered cluster (or area, at the home view).
- `src/components/CameraRig.jsx` — per-view camera poses, GSAP tweens, mouse
  parallax + breathing sway. All motion gated behind `prefers-reduced-motion`.
- `src/components/Lighting.jsx` — ambient/hemisphere/directional + point lights.
  Directional shadow map is 1024 and frozen after a few frames (static scene).
- `src/components/PostProcessing.jsx` — Hue/Brightness/Vignette via
  EffectComposer (`multisampling={4}` is the only AA).
- `src/motion.js` — `prefersReducedMotion()` / `motionDuration()` helper.
- `src/components/ui/` — paper-aesthetic HUD, view switcher (+ arrow-key
  cycling), desk sub-nav, cluster overlay (panel + fullscreen corkboard sheet),
  hover label, intro/welcome/fade overlays, loading screen, and the
  visually-hidden `AccessibleContent` mirror (a11y + SEO).

## Accessibility & SEO
- `AccessibleContent` renders a `visually-hidden` (not `display:none`) `<main>`
  mirroring all cluster content with real headings/landmarks and buttons that
  open each cluster — this is the keyboard + screen-reader + crawler path.
- `index.html` has the full meta set (description, OG, Twitter Card, canonical,
  robots, noscript). Canonical/OG point at `https://gr3atb0b.github.io/the-shed/`.
- `prefers-reduced-motion` is respected in both JS (GSAP) and CSS.

## Known gotchas
- `useGLTF.setDecoderPath` in `assetPath.js` runs at import time; both model
  modules import `assetPath` before their `useGLTF.preload`, so the decoder
  path is set before any load. Keep that import order.
- Mesh-name matching is string-prefix based and unguarded beyond the startup
  warning. A Blender re-export that renames a cluster mesh silently drops it —
  watch the console warning.
- StrictMode double-invokes effects; the InsideModel load effect is idempotent.
- A few lint errors remain (r3f `camera` immutability, a couple of dead vars,
  one react-refresh export) — pre-existing or slated for the cleanup/polish pass.

## Fonts (not yet loaded)
`App.css` references IBM Plex Serif/Mono heavily but nothing loads them yet, so
the UI currently falls back to Georgia. Loading the fonts is the cleanup pass's
job, not done here.

## Don't do
- Don't push to GitHub.
- Don't regress the `assetUrl`/BASE_URL asset paths or the self-hosted Draco/HDR
  setup — those are what make prod work offline/under the base path.
- Don't add markdown docs/README unless asked.
- Don't add comments explaining WHAT code does (only non-obvious WHY).
