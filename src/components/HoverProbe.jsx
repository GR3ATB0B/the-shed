import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { resolveTargets } from './InsideModel';

// Drives hoveredCluster by raycasting from the live camera every few frames.
// r3f's event-driven hover only re-raycasts on pointermove, but CameraRig
// drifts the camera every frame (parallax + breathing sway), so what sits
// under the cursor changes without the mouse moving — event-driven hover
// misses and goes stale. Clicks stay on r3f's event path (they raycast at
// the moment of the click, which is always fresh).
export default function HoverProbe() {
  const { scene, camera, pointer } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const frame = useRef(0);
  // Don't probe until the pointer has actually been placed — r3f's pointer
  // starts at (0,0) (screen center), which would light up whatever happens
  // to be in the middle of the view on load.
  const pointerLive = useRef(false);

  useEffect(() => {
    const mark = () => {
      pointerLive.current = true;
    };
    window.addEventListener('pointermove', mark, { once: true });
    window.addEventListener('pointerdown', mark, { once: true });
    return () => {
      window.removeEventListener('pointermove', mark);
      window.removeEventListener('pointerdown', mark);
    };
  }, []);

  useFrame(() => {
    // ~20Hz is plenty for hover and keeps the full-scene raycast cheap.
    frame.current = (frame.current + 1) % 3;
    if (frame.current !== 0) return;

    const state = useStore.getState();
    const clear = () => {
      if (state.hoveredCluster !== null) state.setHovered(null);
      if (document.body.style.cursor === 'pointer') {
        document.body.style.cursor = '';
      }
    };

    if (!pointerLive.current || state.selectedCluster) {
      clear();
      return;
    }

    raycaster.current.setFromCamera(pointer, camera);
    const hit = raycaster.current.intersectObject(scene, true)[0];
    if (!hit) {
      clear();
      return;
    }

    const { clusterId, areaId } = resolveTargets(hit.object);
    const id = state.currentView === 'home' ? areaId : clusterId;
    if (!id) {
      clear();
      return;
    }
    if (state.hoveredCluster !== id) state.setHovered(id);
    if (document.body.style.cursor !== 'pointer') {
      document.body.style.cursor = 'pointer';
    }
  });

  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  return null;
}
