import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';

const HIGHLIGHT_COLOR = new THREE.Color('#ffb15a');
const MAX_EMISSIVE = 0.9;
const LERP_SPEED = 8;

// Reads hoveredCluster and lerps an emissive boost onto every mesh in the
// hovered cluster (or area, at the home view). This is the core "the whole
// thing lights up" interaction. Registries come from the store, populated in
// InsideModel on load.
export default function HoverHighlight() {
  const active = useRef(new Map());

  useFrame((_, dt) => {
    const {
      hoveredCluster,
      clusterMeshes,
      areaMeshes,
      currentView,
      selectedCluster,
    } = useStore.getState();

    const targetMeshes =
      !selectedCluster && hoveredCluster
        ? currentView === 'home'
          ? areaMeshes[hoveredCluster] || []
          : clusterMeshes[hoveredCluster] || []
        : [];

    const targetSet = new Set(targetMeshes);
    const t = Math.min(1, dt * LERP_SPEED);

    for (const mesh of targetSet) {
      registerAndDrive(mesh, MAX_EMISSIVE, t, active);
    }

    for (const [mesh, entry] of active) {
      if (targetSet.has(mesh)) continue;
      entry.current = THREE.MathUtils.lerp(entry.current, 0, t);
      applyEmissive(mesh, entry);
      if (entry.current < 0.002) {
        restore(mesh, entry);
        active.delete(mesh);
      }
    }
  });

  return null;
}

function registerAndDrive(mesh, target, t, active) {
  const mat = mesh.material;
  if (!mat || !mat.emissive) return;
  let entry = active.get(mesh);
  if (!entry) {
    entry = {
      current: 0,
      origEmissive: mat.emissive.clone(),
      origIntensity: mat.emissiveIntensity ?? 1,
    };
    active.set(mesh, entry);
  }
  entry.current = THREE.MathUtils.lerp(entry.current, target, t);
  applyEmissive(mesh, entry);
}

function applyEmissive(mesh, entry) {
  const mat = mesh.material;
  if (!mat || !mat.emissive) return;
  mat.emissive.copy(entry.origEmissive).lerp(HIGHLIGHT_COLOR, entry.current);
  mat.emissiveIntensity = entry.origIntensity + entry.current;
}

function restore(mesh, entry) {
  const mat = mesh.material;
  if (!mat || !mat.emissive) return;
  mat.emissive.copy(entry.origEmissive);
  mat.emissiveIntensity = entry.origIntensity;
}
