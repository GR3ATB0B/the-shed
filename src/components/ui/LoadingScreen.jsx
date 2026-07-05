import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [hidden, setHidden] = useState(false);

  const done = !active && progress >= 100;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setHidden(true), 500);
    return () => clearTimeout(t);
  }, [done]);

  if (hidden) return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      className={`loading-screen ${done ? 'loading-screen--done' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading the shed, ${pct} percent`}
    >
      <div className="loading-screen__center">
        <div className="loading-screen__brand">whatthenash</div>
        <div className="loading-screen__track">
          <div
            className="loading-screen__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="loading-screen__pct">{pct}%</div>
      </div>
    </div>
  );
}
