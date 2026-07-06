import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useStore } from '../store';

// Mirrors drei's useProgress into the zustand store. LoadingScreen (in the
// small entry chunk) reads the store instead of importing drei, which keeps
// three/drei out of the entry chunk — they live in the split vendor chunks,
// and this bridge mounts alongside the Canvas that needs them.
export default function ProgressBridge() {
  const { active, progress } = useProgress();
  const setLoadStatus = useStore((s) => s.setLoadStatus);

  useEffect(() => {
    setLoadStatus(active, progress);
  }, [active, progress, setLoadStatus]);

  return null;
}
