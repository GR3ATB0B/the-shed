export default function Lighting() {
  return (
    <>
      <ambientLight color="#ffe8cc" intensity={0.45} />
      <hemisphereLight
        color="#ffe8cc"
        groundColor="#3a2814"
        intensity={0.35}
      />
      <directionalLight
        color="#ffe2b8"
        intensity={0.5}
        position={[5, 7, 4]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
