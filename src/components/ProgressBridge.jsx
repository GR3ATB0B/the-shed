import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useStore } from '../store';

// Mirrors drei's useProgress into the zustand store. LoadingScreen (in the
// eagerly-loaded entry bundle) reads the store instead of importing drei,
// which keeps three/drei out of the entry chunk — they arrive with the
// lazy-loaded scenes, and this bridge mounts alongside them.
export default function ProgressBridge() {
  const { active, progress } = useProgress();
  const setLoadStatus = useStore((s) => s.setLoadStatus);

  useEffect(() => {
    setLoadStatus(active, progress);
  }, [active, progress, setLoadStatus]);

  return null;
}
