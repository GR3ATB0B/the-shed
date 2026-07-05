import { useEffect, useRef } from 'react';

export default function Lighting() {
  const sunRef = useRef();

  useEffect(() => {
    const sun = sunRef.current;
    if (!sun) return;
    // Static interior: render the shadow map for a couple of frames then
    // freeze it. Saves re-rendering two shadow passes every frame.
    sun.shadow.autoUpdate = true;
    sun.shadow.needsUpdate = true;
    let frames = 0;
    let raf;
    const tick = () => {
      frames += 1;
      if (frames >= 3) {
        sun.shadow.autoUpdate = false;
        return;
      }
      sun.shadow.needsUpdate = true;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <ambientLight color="#ffe8cc" intensity={0.45} />
      <hemisphereLight
        color="#ffe8cc"
        groundColor="#3a2814"
        intensity={0.35}
      />
      <directionalLight
        ref={sunRef}
        color="#ffe2b8"
        intensity={0.5}
        position={[5, 7, 4]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />
      <pointLight
        color="#ffc890"
        intensity={0.3}
        distance={5.5}
        decay={1.8}
        position={[0, 2.6, -3.2]}
      />
      <pointLight
        color="#ffd9a8"
        intensity={0.22}
        distance={4.5}
        decay={2.0}
        position={[-3.0, 2.3, 1.5]}
      />
    </>
  );
}
