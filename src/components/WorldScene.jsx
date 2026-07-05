import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';
import { prefersReducedMotion } from '../motion';
import WorldModel from './WorldModel';
import PostProcessing from './PostProcessing';

const CABIN = new THREE.Vector3(-0.139, 0.05, -0.237);
const AERIAL_POS = new THREE.Vector3(1.55, 0.95, 1.75);
const CANOPY_POS = new THREE.Vector3(0.55, 0.42, 0.55);
const DOOR_POS = new THREE.Vector3(0.18, 0.06, 0.0);

// The intro fade must start 0.9s before the camera reaches the door. Both
// numbers live here so the fade is positioned on the same GSAP timeline as
// the dive instead of being hand-synced from a duplicate delay in App.jsx.
const FADE_DURATION = 0.9;

function Camera({ onArrived }) {
  const camRef = useRef();
  const divingRef = useRef(false);
  const introPhase = useStore((s) => s.introPhase);
  const setFade = useStore((s) => s.setFade);

  useEffect(() => {
    if (!camRef.current) return;
    camRef.current.position.copy(AERIAL_POS);
    camRef.current.lookAt(CABIN);
    if (import.meta.env.DEV) window.__worldCamera = camRef.current;
  }, []);

  useEffect(() => {
    if (introPhase !== 'diving' || divingRef.current) return;
    divingRef.current = true;
    const cam = camRef.current;

    if (prefersReducedMotion()) {
      cam.position.copy(DOOR_POS);
      cam.lookAt(CABIN);
      onArrived?.();
      return;
    }

    const posObj = {
      x: cam.position.x,
      y: cam.position.y,
      z: cam.position.z,
    };
    const fadeObj = { v: 0 };

    const setCam = () => {
      cam.position.set(posObj.x, posObj.y, posObj.z);
      cam.lookAt(CABIN);
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        onArrived?.();
      },
    });

    tl.to(posObj, {
      x: CANOPY_POS.x,
      y: CANOPY_POS.y,
      z: CANOPY_POS.z,
      duration: 4.6,
      ease: 'power2.inOut',
      onUpdate: setCam,
    }, 0)
      .to(posObj, {
        x: DOOR_POS.x,
        y: DOOR_POS.y,
        z: DOOR_POS.z,
        duration: 3.4,
        ease: 'power2.in',
        onUpdate: setCam,
      }, '-=1.2')
      .to(fadeObj, {
        v: 1,
        duration: FADE_DURATION,
        ease: 'power2.in',
        onUpdate: () => setFade(fadeObj.v),
      }, `-=${FADE_DURATION}`);

    return () => tl.kill();
  }, [introPhase, onArrived, setFade]);

  return (
    <PerspectiveCamera
      ref={camRef}
      fov={55}
      near={0.1}
      far={500}
      makeDefault
      position={[AERIAL_POS.x, AERIAL_POS.y, AERIAL_POS.z]}
    />
  );
}

export default function WorldScene({ onArrived }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.78,
      }}
    >
      <color attach="background" args={['#6e9bb8']} />
      <fog attach="fog" args={['#85a8c4', 8, 22]} />
      <Suspense fallback={null}>
        <Camera onArrived={onArrived} />
        <ambientLight intensity={0.55} color="#fff2dc" />
        <directionalLight
          color="#ffd9a8"
          intensity={1.3}
          position={[6, 8, 4]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
        />
        <hemisphereLight
          color="#a8c5e0"
          groundColor="#3a2814"
          intensity={0.4}
        />
        <Environment resolution={128} environmentIntensity={0.4}>
          <Lightformer
            intensity={2}
            color="#dcecff"
            position={[0, 6, 0]}
            scale={[10, 10, 1]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Lightformer
            intensity={1}
            color="#ffdca8"
            position={[6, 4, 4]}
            scale={[4, 4, 1]}
          />
          <Lightformer
            intensity={0.5}
            color="#3a5a2c"
            position={[0, -4, 0]}
            scale={[10, 10, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </Environment>
        <WorldModel />
      </Suspense>
      {/* Same color grade as the interior Scene so the intro→inside cut
          doesn't pop in vignette/hue/brightness. The composer's 4x MSAA
          replaces canvas AA (antialias: false above), matching Scene. */}
      <PostProcessing />
    </Canvas>
  );
}
