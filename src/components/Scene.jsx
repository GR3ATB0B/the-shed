import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import InsideModel from './InsideModel';
import Lighting from './Lighting';
import PostProcessing from './PostProcessing';
import CameraRig from './CameraRig';
import HoverHighlight from './HoverHighlight';
import ProgressBridge from './ProgressBridge';

export default function Scene() {
  const [debugOrbit, setDebugOrbit] = useState(false);
  const canToggleDebug = import.meta.env.DEV;

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.1, 2.2, 3.3], fov: 58 }}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.78,
        }}
        onDoubleClick={
          canToggleDebug ? () => setDebugOrbit((o) => !o) : undefined
        }
      >
        <color attach="background" args={['#0c0a08']} />
        <ProgressBridge />
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
        <HoverHighlight />
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
      {debugOrbit && (
        <div className="debug-orbit-badge">
          <span>debug camera · double-click to exit</span>
          <button onClick={() => setDebugOrbit(false)}>return</button>
        </div>
      )}
    </>
  );
}
