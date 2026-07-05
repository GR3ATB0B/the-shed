import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { CLUSTERS, AREAS } from '../../clusters';

const HINTS = {
  home: 'click around — desk, floor, bookshelf',
  desk: 'click things on the desk',
  'desk-top': 'click anything on the desk',
  'desk-corkboard': 'click the corkboard',
  floor: 'click around the floor',
  bookshelf: 'click anything on the shelf',
};

const MISS_FLASH_MS = 1400;

export default function HoverLabel() {
  const currentView = useStore((s) => s.currentView);
  const hoveredCluster = useStore((s) => s.hoveredCluster);
  const selectedCluster = useStore((s) => s.selectedCluster);

  // Briefly acknowledge clicks on non-interactive set dressing, so the
  // contrast with hover-highlighted clusters reads as intentional.
  const [showMiss, setShowMiss] = useState(false);
  const missTimer = useRef(null);
  useEffect(() => {
    const unsub = useStore.subscribe((state, prev) => {
      if (state.missClickCount === prev.missClickCount) return;
      setShowMiss(true);
      clearTimeout(missTimer.current);
      missTimer.current = setTimeout(() => setShowMiss(false), MISS_FLASH_MS);
    });
    return () => {
      unsub();
      clearTimeout(missTimer.current);
    };
  }, []);

  if (selectedCluster) return null;

  const hoveredLabel =
    currentView === 'home'
      ? AREAS[hoveredCluster]?.label
      : CLUSTERS[hoveredCluster]?.label;

  const showingHover = !!hoveredLabel;

  if (showMiss && !showingHover) {
    return (
      <div className="hover-label visible hover-label--miss" aria-hidden="true">
        <span className="hover-label__text">just scenery</span>
        <span className="hover-label__hint">try the things that glow</span>
      </div>
    );
  }

  const text = hoveredLabel || HINTS[currentView];
  if (!text) return null;

  return (
    <div className={`hover-label visible ${showingHover ? 'hover-label--named' : ''}`}>
      <span className="hover-label__text">{text}</span>
      {showingHover && <span className="hover-label__hint">click to open</span>}
    </div>
  );
}
