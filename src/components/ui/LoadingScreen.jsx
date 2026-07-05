import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
    if (active) setVisible(true);
  }, [active, progress]);

  if (!visible) return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      className={`loading-screen ${!active && progress >= 100 ? 'loading-screen--done' : ''}`}
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
