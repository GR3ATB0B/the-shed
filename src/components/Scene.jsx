import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import InsideModel from './InsideModel';
import Lighting from './Lighting';
import PostProcessing from './PostProcessing';
import CameraRig from './CameraRig';

export default function Scene() {
  const [debugOrbit, setDebugOrbit] = useState(false);

  return (
    <Canvas
      shadows
      camera={{ position: [0.1, 2.2, 3.3], fov: 58 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.78,
      }}
      onDoubleClick={() => setDebugOrbit((o) => !o)}
    >
      <color attach="background" args={['#0c0a08']} />
      <Suspense fallback={null}>
        <Lighting />
        <InsideModel />
        <Environment preset="apartment" environmentIntensity={0.35} />
      </Suspense>
      {debugOrbit ? (
        <OrbitControls
          target={[0, 1.4, -3]}
          enablePan
          minDistance={0.5}
          maxDistance={20}
        />
      ) : (
        <CameraRig />
      )}
      <PostProcessing />
    </Canvas>
  );
}
