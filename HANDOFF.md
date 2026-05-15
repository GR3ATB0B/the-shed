# whatthenash-redesign — Handoff (Blender-GLB pivot)

_Written 2026-05-14. Supersedes `~/Nash Workbench/handoff/HANDOFF.md` direction for room shell + entrance + camera. Cluster interaction pattern + tech stack from original still apply._

---

## 1. The pivot

Nash modeled the room himself in Blender. Two GLBs now drive the whole site:

- `~/blender/world.glb` (4.5 MB) — aerial forest + mountains + cabin. Entry view.
- `~/blender/inside.glb` (17 MB pre-Draco) — shed interior. Nash's room reimagined: desk, bookshelf, forging floor, bulletin board.

**Obsolete from original handoff:** procedural shed walls, fly-through-doors entrance, 3/4-front camera angle, Poly-Pizza-sourced room shell + bench + window.

**Still in force:** React Three Fiber + drei + GSAP + Zustand + Howler tech stack; cluster-click → overlay UX pattern; Draco compression mandate; Skip-Intro + mute toggle requirements; mobile static fallback (Phase H).

---

## 2. UX flow

### Entrance (WorldScene)
1. Page loads → aerial cam looking down-and-toward cabin in `world.glb`.
2. DOM overlay text "Click to explore" (idle pulse).
3. User clicks anywhere → GSAP camera dive 2.5–4 s toward cabin door, slight FOV zoom-in. Last 200 ms fade-to-black.
4. On fade complete → `WorldScene` unmounts, `InsideScene` mounts.
5. localStorage `nash_entered=true` → skip entrance on return visits, jump straight to InsideScene with `view.desk`.

### Inside (InsideScene)
- Camera **parallel to back desk wall** at human eye height. NOT orbit. NOT 3/4.
- Three discrete view poses + GSAP tweens between them:

| View id | Description | Reveals |
|---|---|---|
| `view.desk` (default) | Seated eye-height, looking straight at back wall | Electronics, laptop/CRT, keyboard, MIDI |
| `view.floor` | Lowered + tilted down | Forging cluster: dumbbells, anvil, swords |
| `view.up` | Same XY as desk, tilted up | Bulletin board: pinned projects + ideas |

- Mini parallax shift (±0.05 units) per view based on mouse. No full orbit.
- Switch via on-screen chevron UI + `↑ / ↓` keys.
- Bookshelf is **separate named view** (`view.bookshelf`). Click the brain (AI agents joke) → camera zooms onto shelf → individual easter-egg meshes become clickable.

### Cluster interaction
- Hover any mesh in cluster group (e.g. `cluster.electronics.arduino`) → entire group emissive-boost + outline.
- Click → `store.selectedCluster = 'electronics'`. Camera stays put.
- Canvas wrapper applies CSS `filter: blur(6px) brightness(0.7)` (cheap, no shader cost).
- `ClusterOverlay.jsx` slides in: title + description + thumbnails. ESC / backdrop / back btn closes.
- Reuse existing `useClusterInteraction` hook. Extend with `clusterGroup` registry that binds many meshes → one cluster id.

---

## 3. Mesh naming contract

In Blender, rename every interactive mesh so code can wire it without hardcoded coordinates:

```
cluster.<id>.<part>
```

Examples:
- `cluster.electronics.arduino`
- `cluster.electronics.multimeter`
- `cluster.electronics.breadboard`
- `cluster.forging.anvil`
- `cluster.forging.dumbbell.left`
- `cluster.bookshelf.brain`
- `cluster.bookshelf.bible`
- `cluster.bulletin.pinned-card.1`

Code walks `scene.traverse`, builds `Map<clusterId, Object3D[]>`, attaches one event surface per cluster.

Non-interactive set dressing stays unnamed or `static.*`.

---

## 4. Asset pipeline

```bash
# Draco-compress both GLBs into project public/models/
npx gltf-pipeline -i ~/blender/inside.glb -o public/models/inside.glb -d
npx gltf-pipeline -i ~/blender/world.glb  -o public/models/world.glb  -d
```

Target sizes post-Draco: `inside.glb < 5 MB`, `world.glb < 1.5 MB`.

In code, enable Draco loader:

```js
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
useGLTF.preload('/models/inside.glb');
// drei auto-uses Draco when loader has decoder path set;
// set via useGLTF.setDecoderPath('/draco/') or rely on jsDelivr default
```

Re-run pipeline whenever Nash re-exports Blender file. Mesh names must survive — verify with `console.log(scene)` after each re-export.

---

## 5. What lives in the scaffold today

Keep:
- `src/store.js` — extend with `currentView` (`'desk' | 'floor' | 'up' | 'bookshelf'`) and `worldPhase` (`'aerial' | 'diving' | 'inside'`).
- `src/components/Lighting.jsx` — still useful as overlay on baked GLB lights.
- `src/components/PostProcessing.jsx` — bloom + tone map stays.
- `src/components/ui/HUD.jsx` — brand + mute toggle stays. Drop TOD selector (lighting now baked in GLB).
- `src/components/ui/ClusterOverlay.jsx` — reuse, extend content map.
- `src/components/clusters/ClusterBase.jsx` — `useClusterInteraction` hook still good. Add `clusterGroup` binding.

Delete (obsolete after pivot):
- `src/components/Shed.jsx` — procedural walls replaced by `inside.glb`.
- `src/components/Bench.jsx` — desk lives inside `inside.glb`.
- `src/components/Window.jsx` — window mesh + sun light now in `inside.glb` or re-added per view.
- `src/components/EdisonBulb.jsx` — bulb lives in `inside.glb`.
- Current `CameraRig.jsx` 3/4-angle logic → full rewrite.

Existing `Electronics.jsx` cluster — keep as reference, but rewire to use named meshes from `inside.glb` instead of separate `arduino-uno.glb` + `multimeter.glb` files.

---

## 6. Build phases

| Phase | Goal | Est |
|---|---|---|
| **A — Pivot scaffold** | Draco-compress both GLBs into `public/models/`. Delete obsolete procedural files. Mount `inside.glb` via `<primitive>` in Scene. Confirm renders. | 1 evening |
| **B — Three-view camera rig** | Rewrite `CameraRig.jsx`: poses `desk` / `floor` / `up`. GSAP tween between. Chevron UI + arrow-key shortcuts. Mouse parallax per view. | 1 evening |
| **C — Mesh naming contract** | Nash renames meshes in Blender per §3. Re-export. Code adds `clusterRegistry` walker that binds hover/click to named groups. | 1 session, joint Nash + code |
| **D — World entrance** | `WorldScene.jsx`. Aerial cam, "Click to explore" overlay, GSAP dive, fade-to-black swap, localStorage skip-on-return. | 1 evening |
| **E — Electronics cluster end-to-end** | First cluster on new pattern: hover-highlights-whole-group + CSS-blur overlay + content. Pattern frozen for replication. | 1 evening |
| **F — Bookshelf sub-view** | Click brain → `view.bookshelf` GSAP zoom. Per-easter-egg micro-overlays (brain → AI agents, bible, math books, etc.). | 1 session |
| **G — Remaining clusters** | Forging, bulletin board cards, music corner, anything else inside.glb supports. Markdown content per cluster. | 3–4 sessions |
| **H — Polish** | Sound (Howler), proper loading screen, mobile static fallback, SEO meta + Open Graph, performance pass. | 1 session |

---

## 7. Open questions

- Mesh-naming convention `cluster.<id>.<part>` confirmed? (Code expects it.)
- "Click brain → bookshelf zoom → easter eggs" two-step OK vs flat single overlay?
- CSS blur on canvas wrapper acceptable to start (vs DoF postprocessing)?
- Audio plan — record real sounds or sourced?

---

## 8. Don't do

- Don't push to GitHub yet (per existing CLAUDE.md).
- Don't keep procedural Shed/Bench/Window/EdisonBulb files "just in case" — delete them.
- Don't load uncompressed GLBs from `~/blender/` at runtime; only `public/models/` copies.
- Don't introduce orbit controls outside debug mode.
- Don't autoplay audio. Don't force intro on return visits.

---

## 9. Files of record

- This file: `~/code/whatthenash-redesign/HANDOFF.md`
- Project context: `~/code/whatthenash-redesign/CLAUDE.md`
- Original spec (cluster pattern + tech stack still valid): `~/Nash Workbench/handoff/HANDOFF.md`
- Source Blender + GLBs: `~/blender/`
