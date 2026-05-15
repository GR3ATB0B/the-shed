import { useCallback, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  CLUSTERS,
  buildAreaRegistry,
  clusterForName,
  isDecoration,
} from '../clusters';
import { useStore } from '../store';

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

function resolveTargets(obj) {
  let p = obj;
  let clusterId = null;
  let areaId = null;
  while (p) {
    if (!clusterId && p.userData?.clusterId) clusterId = p.userData.clusterId;
    if (!areaId && p.userData?.areaId) areaId = p.userData.areaId;
    p = p.parent;
  }
  return { clusterId, areaId };
}

export default function InsideModel(props) {
  const { scene } = useGLTF('/models/inside.glb');
  const setHovered = useStore((s) => s.setHovered);
  const selectCluster = useStore((s) => s.selectCluster);
  const setView = useStore((s) => s.setView);
  const setClusterMeshes = useStore((s) => s.setClusterMeshes);
  const setAreaMeshes = useStore((s) => s.setAreaMeshes);
  const hoveredRef = useRef(null);

  const onPointerOver = useCallback(
    (e) => {
      const view = useStore.getState().currentView;
      const { clusterId, areaId } = resolveTargets(e.object);
      const id = view === 'home' ? areaId : clusterId;
      if (!id || id === hoveredRef.current) return;
      e.stopPropagation();
      hoveredRef.current = id;
      setHovered(id);
      document.body.style.cursor = 'pointer';
    },
    [setHovered],
  );

  const onPointerOut = useCallback(
    (e) => {
      const view = useStore.getState().currentView;
      const { clusterId, areaId } = resolveTargets(e.object);
      const id = view === 'home' ? areaId : clusterId;
      if (!id) return;
      if (hoveredRef.current === id) {
        hoveredRef.current = null;
        setHovered(null);
        document.body.style.cursor = '';
      }
    },
    [setHovered],
  );

  const onClick = useCallback(
    (e) => {
      const view = useStore.getState().currentView;
      const { clusterId, areaId } = resolveTargets(e.object);
      if (view === 'home') {
        if (!areaId) return;
        e.stopPropagation();
        setView(areaId);
      } else {
        if (!clusterId) return;
        e.stopPropagation();
        selectCluster(clusterId);
      }
    },
    [selectCluster, setView],
  );

  useEffect(() => {
    scene.traverse((o) => {
      if (HIDE_TOPLEVEL_NAMES.has(o.name)) o.visible = false;
    });

    const registry = {};
    Object.keys(CLUSTERS).forEach((id) => (registry[id] = []));

    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.name === 'ShedRoom' && o.material) {
        patchShedRoomMaterial(o);
        return;
      }
      const topName = findTopLevelName(o, scene);
      if (isDecoration(topName) || isDecoration(o.name)) return;
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

    scene.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mat = o.material;
      if (mat.userData?.rimUniforms?.uRimIntensity) {
        mat.userData.rimUniforms.uRimIntensity.value = 0;
      }
      if (mat.userData?.origEmissive && mat.emissive) {
        mat.emissive.copy(mat.userData.origEmissive);
        mat.emissiveIntensity = mat.userData.origEmissiveIntensity ?? 1;
      }
    });

    const areaRegistry = buildAreaRegistry(registry);
    setClusterMeshes(registry);
    setAreaMeshes(areaRegistry);

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
    <group
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      {...props}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/inside.glb');
