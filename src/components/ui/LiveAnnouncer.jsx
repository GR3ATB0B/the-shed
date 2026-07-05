import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { CLUSTER_CONTENT } from '../../content';
import { CLUSTERS } from '../../clusters';

// Announces overlay open/close to screen readers. The visual overlay lives
// in a blurred 3D HUD a screen reader can't follow; this mirrors those state
// changes as polite live-region updates (companion to AccessibleContent).
export default function LiveAnnouncer() {
  const [message, setMessage] = useState('');

  useEffect(
    () =>
      useStore.subscribe((state, prev) => {
        if (state.selectedCluster === prev.selectedCluster) return;
        if (state.selectedCluster) {
          const id = state.selectedCluster;
          const title =
            CLUSTER_CONTENT[id]?.title || CLUSTERS[id]?.label || id;
          setMessage(`Opened: ${title}. Press Escape to close.`);
        } else {
          setMessage('Closed. Back in the shed.');
        }
      }),
    [],
  );

  return (
    <div className="visually-hidden" role="status" aria-live="polite">
      {message}
    </div>
  );
}
