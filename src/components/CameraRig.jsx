import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';

const VIEWS = {
  home: {
    pos: new THREE.Vector3(0.1, 2.2, 3.3),
    look: new THREE.Vector3(-0.3, 0.8, -3.4),
    parallax: 0.12,
    fov: 58,
  },
  desk: {
    pos: new THREE.Vector3(-0.2, 2.0, 1.0),
    look: new THREE.Vector3(-0.2, 1.15, -3.4),
    parallax: 0.14,
    fov: 42,
  },
  'desk-top': {
    pos: new THREE.Vector3(-0.2, 4.0, -2.4),
    look: new THREE.Vector3(-0.2, 1.5, -3.5),
    parallax: 0.06,
    fov: 52,
  },
  'desk-corkboard': {
    pos: new THREE.Vector3(-0.2, 1.85, 0.6),
    look: new THREE.Vector3(-0.3, 2.95, -3.95),
    parallax: 0.1,
    fov: 40,
  },
  floor: {
    pos: new THREE.Vector3(2.5, 5.4, 0.4),
    look: new THREE.Vector3(3.5, -1.5, -3.6),
    parallax: 0.06,
    fov: 58,
  },
  bookshelf: {
    pos: new THREE.Vector3(-3.6, 2.0, 0.6),
    look: new THREE.Vector3(-3.8, 1.4, -3.5),
    parallax: 0.1,
    fov: 42,
  },
};

export default function CameraRig() {
  const { camera, size } = useThree();
  const currentView = useStore((s) => s.currentView);
  const selectedCluster = useStore((s) => s.selectedCluster);

  const mouse = useRef({ x: 0, y: 0 });
  const restingPos = useRef(new THREE.Vector3().copy(VIEWS.home.pos));
  const restingLook = useRef(new THREE.Vector3().copy(VIEWS.home.look));
  const target = useRef(new THREE.Vector3().copy(VIEWS.home.look));
  const parallaxScale = useRef(VIEWS.home.parallax);
  const animating = useRef(false);

  useEffect(() => {
    const v = VIEWS.home;
    camera.position.copy(v.pos);
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(v.look);
    if (import.meta.env.DEV) {
      window.__camera = camera;
    }
  }, [camera]);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / size.width) * 2 - 1;
      mouse.current.y = (e.clientY / size.height) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [size]);

  useEffect(() => {
    const v = VIEWS[currentView] || VIEWS.home;
    animating.current = true;
    const tweenPos = {
      x: restingPos.current.x,
      y: restingPos.current.y,
      z: restingPos.current.z,
    };
    const tweenLook = {
      x: restingLook.current.x,
      y: restingLook.current.y,
      z: restingLook.current.z,
    };
    const tweenFov = { f: camera.fov };

    gsap.to(tweenPos, {
      x: v.pos.x,
      y: v.pos.y,
      z: v.pos.z,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: () => {
        restingPos.current.set(tweenPos.x, tweenPos.y, tweenPos.z);
      },
    });
    gsap.to(tweenLook, {
      x: v.look.x,
      y: v.look.y,
      z: v.look.z,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: () => {
        restingLook.current.set(tweenLook.x, tweenLook.y, tweenLook.z);
      },
      onComplete: () => {
        animating.current = false;
      },
    });
    gsap.to(tweenFov, {
      f: v.fov,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.fov = tweenFov.f;
        camera.updateProjectionMatrix();
      },
    });
    gsap.to(parallaxScale, {
      current: v.parallax,
      duration: 1.1,
      ease: 'power3.inOut',
    });
  }, [currentView, camera]);

  useFrame((_, dt) => {
    if (animating.current) {
      camera.position.copy(restingPos.current);
      target.current.copy(restingLook.current);
      camera.lookAt(target.current);
      return;
    }
    const t = performance.now() * 0.001;
    const breathX = Math.sin(t * 0.45) * 0.005;
    const breathY = Math.cos(t * 0.34) * 0.007;
    const damp = selectedCluster ? 0.2 : 1.0;
    const px = (mouse.current.x * parallaxScale.current + breathX) * damp;
    const py =
      (-mouse.current.y * parallaxScale.current * 0.5 + breathY) * damp;

    const desired = new THREE.Vector3(
      restingPos.current.x + px,
      restingPos.current.y + py,
      restingPos.current.z,
    );
    camera.position.lerp(desired, Math.min(1, dt * 4));

    const look = new THREE.Vector3(
      restingLook.current.x +
        mouse.current.x * parallaxScale.current * 1.0 * damp,
      restingLook.current.y -
        mouse.current.y * parallaxScale.current * 0.4 * damp,
      restingLook.current.z,
    );
    target.current.lerp(look, Math.min(1, dt * 4));
    camera.lookAt(target.current);
  });

  return null;
}
