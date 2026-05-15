import { useStore } from '../../store';

export default function IntroOverlay() {
  const introPhase = useStore((s) => s.introPhase);
  const startDive = useStore((s) => s.startDive);
  const skipIntro = useStore((s) => s.skipIntro);

  if (introPhase !== 'aerial') return null;

  return (
    <div className="intro-overlay">
      <div className="intro-overlay__center">
        <div className="intro-overlay__brand">whatthenash</div>
        <p className="intro-overlay__sub">A shed I built. Take a look around.</p>
        <button
          className="intro-overlay__begin"
          onClick={(e) => {
            e.stopPropagation();
            startDive();
          }}
        >
          Click to begin
        </button>
      </div>
      <button
        className="intro-overlay__skip"
        onClick={(e) => {
          e.stopPropagation();
          skipIntro();
        }}
      >
        skip →
      </button>
    </div>
  );
}
