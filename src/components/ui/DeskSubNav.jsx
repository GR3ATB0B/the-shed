import { useStore } from '../../store';

const OPTIONS = [
  { id: 'desk', label: 'Overview' },
  { id: 'desk-top', label: 'Desktop' },
  { id: 'desk-corkboard', label: 'Corkboard' },
];

export default function DeskSubNav() {
  const currentView = useStore((s) => s.currentView);
  const setView = useStore((s) => s.setView);
  const selectedCluster = useStore((s) => s.selectedCluster);
  if (!currentView.startsWith('desk')) return null;
  if (selectedCluster) return null;

  return (
    <div className="desk-subnav">
      <div className="desk-subnav__label">at the desk</div>
      <div className="desk-subnav__rail">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            className={`desk-subnav__chip ${
              currentView === o.id ? 'desk-subnav__chip--active' : ''
            }`}
            onClick={() => setView(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
