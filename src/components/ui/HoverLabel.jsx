import { useStore } from '../../store';

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
  const selectedCluster = useStore((s) => s.selectedCluster);
  if (selectedCluster) return null;
  const hint = HINTS[currentView];
  if (!hint) return null;
  return (
    <div className="hover-label visible">
      <span className="hover-label__text">{hint}</span>
    </div>
  );
}
