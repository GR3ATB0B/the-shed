import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function WorldModel(props) {
  const { scene } = useGLTF('/models/world.glb');

  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    if (import.meta.env.DEV) {
      window.__worldScene = scene;
      window.__THREE = THREE;
      const box = new THREE.Box3().setFromObject(scene);
      const c = new THREE.Vector3();
      const s = new THREE.Vector3();
      box.getCenter(c);
      box.getSize(s);
      console.log(
        '[world.glb] bounds center:',
        c.toArray().map((n) => +n.toFixed(2)),
        'size:',
        s.toArray().map((n) => +n.toFixed(2)),
      );
      const names = [];
      scene.traverse((o) => {
        if (o.isMesh || o.isGroup) names.push(`${o.type}:${o.name}`);
      });
      console.log('[world.glb] objects:', names.slice(0, 50));
    }
  }, [scene]);

  return <primitive object={scene} rotation={[0, Math.PI / 9, 0]} {...props} />;
}

useGLTF.preload('/models/world.glb');
