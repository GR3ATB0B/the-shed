import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';
import WorldModel from './WorldModel';

const CABIN = new THREE.Vector3(-0.139, 0.05, -0.237);
const AERIAL_POS = new THREE.Vector3(1.55, 0.95, 1.75);
const CANOPY_POS = new THREE.Vector3(0.55, 0.42, 0.55);
const DOOR_POS = new THREE.Vector3(0.18, 0.06, 0.0);

function Camera({ paused, onArrived }) {
  const camRef = useRef();
  const lookRef = useRef(new THREE.Vector3().copy(CABIN));
  const dovingRef = useRef(false);
  const introPhase = useStore((s) => s.introPhase);

  useEffect(() => {
    if (!camRef.current) return;
    camRef.current.position.copy(AERIAL_POS);
    camRef.current.lookAt(CABIN);
    if (import.meta.env.DEV) window.__worldCamera = camRef.current;
  }, []);

  useEffect(() => {
    if (introPhase !== 'diving' || dovingRef.current) return;
    dovingRef.current = true;
    const cam = camRef.current;
    const posObj = {
      x: cam.position.x,
      y: cam.position.y,
      z: cam.position.z,
    };

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
      }, '-=1.2');
  }, [introPhase, onArrived]);

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
      gl={{
        antialias: true,
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
        <Environment preset="park" environmentIntensity={0.4} />
        <WorldModel />
      </Suspense>
    </Canvas>
  );
}
