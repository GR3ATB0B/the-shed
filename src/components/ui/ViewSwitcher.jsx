import { useEffect } from 'react';
import { useStore, VIEW_IDS } from '../../store';

const LABELS = {
  home: 'Home',
  desk: 'Desk',
  floor: 'Floor',
  bookshelf: 'Bookshelf',
};

export default function ViewSwitcher() {
  const currentView = useStore((s) => s.currentView);
  const setView = useStore((s) => s.setView);
  const goHome = useStore((s) => s.goHome);
  const cycleView = useStore((s) => s.cycleView);
  const selectedCluster = useStore((s) => s.selectedCluster);

  useEffect(() => {
    const onKey = (e) => {
      if (selectedCluster) return;
      if (e.key === 'h' || e.key === 'H') goHome();
      else if (e.key === '1') setView('home');
      else if (e.key === '2') setView('desk');
      else if (e.key === '3') setView('floor');
      else if (e.key === '4') setView('bookshelf');
      else if (e.key === 'ArrowRight') cycleView(1);
      else if (e.key === 'ArrowLeft') cycleView(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setView, goHome, cycleView, selectedCluster]);

  return (
    <div className="view-switcher" aria-hidden={!!selectedCluster}>
      <div className="view-switcher__rail">
        {VIEW_IDS.map((id) => (
          <button
            key={id}
            className={`view-switcher__chip ${
              id === currentView ? 'view-switcher__chip--active' : ''
            }`}
            onClick={() => setView(id)}
            aria-label={LABELS[id]}
          >
            {LABELS[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
