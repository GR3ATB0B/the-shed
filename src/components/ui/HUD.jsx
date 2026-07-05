import { useStore } from '../../store';

export default function HUD() {
  const resetIntro = useStore((s) => s.resetIntro);

  return (
    <div className="hud">
      <div className="hud-brand">whatthenash</div>
      <div className="hud-controls">
        <button onClick={resetIntro} aria-label="Replay intro">
          ↻ intro
        </button>
      </div>
    </div>
  );
}
