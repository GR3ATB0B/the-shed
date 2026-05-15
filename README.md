# the-shed

A 3D explorable portfolio. Open the cabin door, look around the shed, click on the things.

Built with React Three Fiber + drei + GSAP + Zustand. Vite for tooling.

## Run locally

```bash
NPM_CONFIG_CACHE=/tmp/npm-cache npm install
NPM_CONFIG_CACHE=/tmp/npm-cache npm run dev
```

Opens at `http://localhost:5173/`.

## What is in here

- World scene (cabin on an island) + cinematic dive intro
- Inside scene (one custom Blender GLB, ~3.7 MB Draco-compressed) with cluster-based interaction
- Four views: Home / Desk / Floor / Bookshelf, plus a Desk sub-nav (Overview / Desktop / Corkboard)
- Paper-aesthetic UI: tilted sticky-note cards, washi tape, serif typography
- Full-screen corkboard for bulletin-style content

## Files of note

- `src/components/WorldScene.jsx` — aerial cabin entrance, GSAP dive timeline
- `src/components/InsideScene` is `Scene.jsx` — inside-the-shed canvas
- `src/components/InsideModel.jsx` — loads inside.glb, builds cluster registry, wires hover + click
- `src/components/CameraRig.jsx` — view poses and tweens
- `src/clusters.js` — cluster definitions and area routing
- `src/components/ui/` — paper-style HUD, chips, overlays, banner
- `public/models/inside.glb` + `public/models/world.glb` — the two GLBs that drive everything

## Re-watch the intro

Click `↻ intro` in the top-right HUD, or paste `__resetIntro()` in the dev console.

## Editing the world

`inside.glb` and `world.glb` are exported from Blender source files in `~/blender/` (not in this repo). To swap models, re-export, run Draco compression, and drop into `public/models/`:

```bash
npx gltf-pipeline -i ~/blender/inside.glb -o public/models/inside.glb -d
```

## License

Personal portfolio code. Models in `public/models/` may carry their own licenses — see Blender source.
