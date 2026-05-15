import { useStore } from '../../store';

export default function HUD() {
  const muted = useStore((s) => s.muted);
  const toggleMute = useStore((s) => s.toggleMute);
  const resetIntro = useStore((s) => s.resetIntro);

  return (
    <div className="hud">
      <div className="hud-brand">whatthenash</div>
      <div className="hud-controls">
        <button onClick={resetIntro} aria-label="Replay intro">
          ↻ intro
        </button>
        <button onClick={toggleMute} aria-label="Toggle mute">
          {muted ? 'unmute' : 'mute'}
        </button>
      </div>
    </div>
  );
}
