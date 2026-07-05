import { useCallback, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  CLUSTERS,
  buildAreaRegistry,
  clusterForName,
  isDecoration,
} from '../clusters';
import { assetUrl } from '../assetPath';
import { useStore } from '../store';

const INSIDE_MODEL_URL = assetUrl('models/inside.glb');

// Stray objects left in the Blender export that should never render.
// 'Sphere002' is a leftover debug/reference sphere in inside.glb — hiding it
// here is cheaper than re-exporting the GLB.
const HIDE_TOPLEVEL_NAMES = new Set(['Sphere002']);

function findTopLevelName(mesh, root) {
  let p = mesh;
  while (p && p.parent && p.parent !== root && p.parent.name !== 'Scene') {
    p = p.parent;
  }
  return p?.name || null;
}

function patchShedRoomMaterial(mesh) {
  const mat = mesh.material.clone();
  mat.roughness = 0.92;
  mat.metalness = 0.0;
  mat.color.set('#ffffff');
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFloorColor = { value: new THREE.Color('#7a5230') };
    shader.uniforms.uWallColor = { value: new THREE.Color('#b3a18a') };
    shader.uniforms.uCeilColor = { value: new THREE.Color('#e7dccb') };
    shader.uniforms.uPlankWidth = { value: 0.35 };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWorldPos_;\nvarying vec3 vWorldNormal_;',
      )
      .replace(
        '#include <fog_vertex>',
        `#include <fog_vertex>
         vWorldPos_ = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vWorldNormal_ = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldPos_;
         varying vec3 vWorldNormal_;
         uniform vec3 uFloorColor;
         uniform vec3 uWallColor;
         uniform vec3 uCeilColor;
         uniform float uPlankWidth;
         float hash(float n) { return fract(sin(n) * 43758.5453); }`,
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec3 baseCol;
         if (vWorldNormal_.y > 0.7 && vWorldPos_.y < 0.5) {
           float plank = floor(vWorldPos_.z / uPlankWidth);
           float plankShade = mix(0.82, 1.08, hash(plank));
           float grain = sin(vWorldPos_.x * 38.0 + plank * 7.0) * 0.04;
           baseCol = uFloorColor * plankShade + grain;
         } else if (vWorldNormal_.y < -0.7) {
           baseCol = uCeilColor;
         } else {
           float vert = sin(vWorldPos_.y * 3.0) * 0.015;
           baseCol = uWallColor * (1.0 + vert);
         }
         vec4 diffuseColor = vec4( baseCol, opacity );`,
      );
  };
  mat.needsUpdate = true;
  mesh.material = mat;
}

// clusterId/areaId are stamped directly onto every cluster mesh (and its
// ancestors) at load time, so the raycast hit itself almost always carries
// them — read it straight off the hit. The parent walk only remains as a
// fallback for unstamped meshes nested inside a stamped group.
// Shared with HoverProbe, which resolves its own per-frame raycast hits.
// eslint-disable-next-line react-refresh/only-export-components
export function resolveTargets(obj) {
  if (obj.userData?.clusterId || obj.userData?.areaId) {
    return {
      clusterId: obj.userData.clusterId ?? null,
      areaId: obj.userData.areaId ?? null,
    };
  }
  let p = obj.parent;
  while (p) {
    if (p.userData?.clusterId || p.userData?.areaId) {
      return {
        clusterId: p.userData.clusterId ?? null,
        areaId: p.userData.areaId ?? null,
      };
    }
    p = p.parent;
  }
  return { clusterId: null, areaId: null };
}

export default function InsideModel(props) {
  const { scene } = useGLTF(INSIDE_MODEL_URL);
  const selectCluster = useStore((s) => s.selectCluster);
  const setView = useStore((s) => s.setView);
  const setClusterMeshes = useStore((s) => s.setClusterMeshes);
  const setAreaMeshes = useStore((s) => s.setAreaMeshes);

  // Hover is NOT handled here — HoverProbe raycasts per-frame instead,
  // because the parallax camera drifts under a stationary cursor and
  // event-driven hover goes stale. Only clicks stay on r3f's event path.
  const onClick = useCallback(
    (e) => {
      const view = useStore.getState().currentView;
      const { clusterId, areaId } = resolveTargets(e.object);
      const id = view === 'home' ? areaId : clusterId;
      if (!id) {
        // Clicked set dressing / the room shell — flash a brief "just
        // scenery" cue so interactive vs decorative stays legible.
        e.stopPropagation();
        useStore.getState().flashMissClick();
        return;
      }
      e.stopPropagation();
      if (view === 'home') setView(id);
      else selectCluster(id);
    },
    [selectCluster, setView],
  );

  useEffect(() => {
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      if (HIDE_TOPLEVEL_NAMES.has(o.name)) o.visible = false;
    });

    const registry = {};
    Object.keys(CLUSTERS).forEach((id) => (registry[id] = []));

    const _box = new THREE.Box3();
    const _size = new THREE.Vector3();
    // Meshes with a bounding box smaller than this in every axis don't earn a
    // shadow-map slot — the shadow is invisible at this scale but still costs a
    // render pass.
    const MIN_SHADOW_CASTER = 0.08;

    scene.traverse((o) => {
      if (!o.isMesh) return;
      if (o.name === 'ShedRoom' && o.material) {
        // The room shell receives shadows but never needs to cast them.
        o.castShadow = false;
        o.receiveShadow = true;
        patchShedRoomMaterial(o);
        return;
      }

      o.geometry.computeBoundingBox();
      _box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      _box.getSize(_size);
      const decoration = isDecoration(findTopLevelName(o, scene)) || isDecoration(o.name);
      const tiny =
        _size.x < MIN_SHADOW_CASTER &&
        _size.y < MIN_SHADOW_CASTER &&
        _size.z < MIN_SHADOW_CASTER;
      o.castShadow = !decoration && !tiny;
      o.receiveShadow = true;

      const topName = findTopLevelName(o, scene);
      if (decoration) return;
      const clusterId = clusterForName(topName) || clusterForName(o.name);
      if (clusterId) {
        registry[clusterId].push(o);
        o.userData.clusterId = clusterId;
        o.userData.areaId = CLUSTERS[clusterId].area;
        let p = o.parent;
        while (p && p !== scene) {
          if (!p.userData.clusterId) p.userData.clusterId = clusterId;
          if (!p.userData.areaId) p.userData.areaId = CLUSTERS[clusterId].area;
          p = p.parent;
        }
      }
    });

    const areaRegistry = buildAreaRegistry(registry);
    setClusterMeshes(registry);
    setAreaMeshes(areaRegistry);

    // Sanity check: cluster membership is matched by string prefix against
    // Blender mesh names (which carry typos like "circut", "dumbbellwight").
    // If a re-export renames a mesh, a cluster silently goes dead. Warn loudly
    // so the drift is caught instead of shipping a non-interactive cluster.
    const emptyClusters = Object.entries(registry)
      .filter(([, meshes]) => meshes.length === 0)
      .map(([id]) => id);
    if (emptyClusters.length > 0) {
      console.warn(
        '[InsideModel] clusters matched zero meshes (mesh names may have ' +
          'drifted on GLB re-export):',
        emptyClusters,
      );
    }

    if (import.meta.env.DEV) {
      window.__insideScene = scene;
      window.__THREE = THREE;
      window.__clusterRegistry = registry;
      window.__areaRegistry = areaRegistry;
      window.__sceneReport = () => {
        scene.updateMatrixWorld(true);
        const rows = [];
        scene.traverse((o) => {
          if (!o.isMesh) return;
          const box = new THREE.Box3().setFromObject(o);
          const c = new THREE.Vector3();
          const sz = new THREE.Vector3();
          box.getCenter(c);
          box.getSize(sz);
          rows.push({
            name: o.name,
            parent: o.parent?.name || null,
            cluster: o.userData?.clusterId || null,
            area: o.userData?.areaId || null,
            visible: o.visible,
            cx: +c.x.toFixed(2),
            cy: +c.y.toFixed(2),
            cz: +c.z.toFixed(2),
            sx: +sz.x.toFixed(2),
            sy: +sz.y.toFixed(2),
            sz: +sz.z.toFixed(2),
          });
        });
        return rows;
      };
      const counts = Object.fromEntries(
        Object.entries(registry).map(([k, v]) => [k, v.length]),
      );
      const areaCounts = Object.fromEntries(
        Object.entries(areaRegistry).map(([k, v]) => [k, v.length]),
      );
      console.log('[InsideModel] clusters:', counts, 'areas:', areaCounts);
    }
  }, [scene, setClusterMeshes, setAreaMeshes]);

  return (
    <group onClick={onClick} {...props}>
      <primitive object={scene} />
    </group>
  );
}

// The preload trigger deliberately lives next to the model URL it preloads;
// losing fast-refresh on this file is an acceptable trade.
// eslint-disable-next-line react-refresh/only-export-components
export function preloadInsideModel() {
  useGLTF.preload(INSIDE_MODEL_URL);
}
