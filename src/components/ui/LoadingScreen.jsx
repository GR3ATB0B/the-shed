import { useEffect, useState } from 'react';
import { useStore } from '../../store';

// Reads load progress from the store (mirrored there by ProgressBridge in
// the split 3D chunks) rather than drei's useProgress directly — importing
// drei here would pull the whole three stack into the entry chunk.
export default function LoadingScreen() {
  const active = useStore((s) => s.loadActive);
  const progress = useStore((s) => s.loadProgress);
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
