import { useStore } from '../../store';

export default function FadeOverlay() {
  const fadeOpacity = useStore((s) => s.fadeOpacity);
  return (
    <div
      className="fade-overlay"
      style={{ opacity: fadeOpacity, pointerEvents: fadeOpacity > 0.5 ? 'auto' : 'none' }}
    />
  );
}
