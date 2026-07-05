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

export default function HoverLabel() {
  const currentView = useStore((s) => s.currentView);
  const hoveredCluster = useStore((s) => s.hoveredCluster);
  const selectedCluster = useStore((s) => s.selectedCluster);
  if (selectedCluster) return null;

  const hoveredLabel =
    currentView === 'home'
      ? AREAS[hoveredCluster]?.label
      : CLUSTERS[hoveredCluster]?.label;

  const showingHover = !!hoveredLabel;
  const text = hoveredLabel || HINTS[currentView];
  if (!text) return null;

  return (
    <div className={`hover-label visible ${showingHover ? 'hover-label--named' : ''}`}>
      <span className="hover-label__text">{text}</span>
      {showingHover && <span className="hover-label__hint">click to open</span>}
    </div>
  );
}
