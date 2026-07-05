import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
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
        <Environment resolution={128} environmentIntensity={0.35}>
          <color attach="background" args={['#1a140c']} />
          <Lightformer
            intensity={1.4}
            color="#ffe2b8"
            position={[0, 4, -2]}
            scale={[6, 3, 1]}
          />
          <Lightformer
            intensity={0.6}
            color="#ffd9a8"
            position={[-4, 2, 2]}
            scale={[3, 3, 1]}
          />
          <Lightformer
            intensity={0.4}
            color="#a8c5e0"
            position={[4, 3, 2]}
            scale={[3, 3, 1]}
          />
        </Environment>
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
