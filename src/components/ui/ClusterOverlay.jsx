import { useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { CLUSTERS } from '../../clusters';
import { CLUSTER_CONTENT } from '../../content';

const VIEW_BY_CLUSTER = Object.fromEntries(
  Object.entries(CLUSTERS).map(([id, c]) => [id, c.view]),
);

function pickCard(cards, key) {
  if (!cards?.length) return null;
  const idx = Math.floor(Math.random() * cards.length);
  return cards[idx];
}

export default function ClusterOverlay() {
  const selectedCluster = useStore((s) => s.selectedCluster);
  const deselectCluster = useStore((s) => s.deselectCluster);
  const setView = useStore((s) => s.setView);
  const currentView = useStore((s) => s.currentView);

  useEffect(() => {
    if (!selectedCluster) return;
    // Fullscreen clusters (corkboard) cover the whole viewport, so a camera
    // move underneath is wasted — skip it.
    if (CLUSTER_CONTENT[selectedCluster]?.fullscreen) return;
    const desiredView = VIEW_BY_CLUSTER[selectedCluster];
    if (desiredView && desiredView !== currentView) setView(desiredView);
  }, [selectedCluster, setView, currentView]);

  useEffect(() => {
    if (!selectedCluster) return;
    const onKey = (e) => {
      if (e.key === 'Escape') deselectCluster();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCluster, deselectCluster]);

  const content = selectedCluster ? CLUSTER_CONTENT[selectedCluster] : null;

  const card = useMemo(
    () =>
      content?.cards && !content?.fullscreen
        ? pickCard(content.cards, selectedCluster)
        : null,
    [selectedCluster, content],
  );

  const open = !!content;
  const fullscreen = !!content?.fullscreen;

  const renderBody = () => {
    if (card) {
      return (
        <>
          <p className="cluster-overlay__tagline">{card.kicker}</p>
          <h2 className="cluster-overlay__title">{card.title}</h2>
          <div className="cluster-overlay__body">
            <p>{card.body}</p>
          </div>
          {card.links?.length > 0 && (
            <ul className="cluster-overlay__links">
              {card.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {l.label} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      );
    }
    return (
      <>
        <h2 className="cluster-overlay__title">{content.title}</h2>
        {content.tagline && (
          <p className="cluster-overlay__tagline">{content.tagline}</p>
        )}
        <div className="cluster-overlay__body">
          {content.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {content.list?.length > 0 && (
            <ul className="cluster-overlay__list">
              {content.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        {content.links?.length > 0 && (
          <ul className="cluster-overlay__links">
            {content.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                >
                  {l.label} →
                </a>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  if (fullscreen) {
    return (
      <div className={`cork-full ${open ? 'open' : ''}`}>
        <div className="cork-full__backdrop" onClick={deselectCluster} />
        <div className="cork-full__sheet">
          <header className="cork-full__header">
            <button
              className="cork-full__close"
              onClick={deselectCluster}
              aria-label="Close"
            >
              ← back to the shed
            </button>
            <h1 className="cork-full__title">{content.title}</h1>
            <p className="cork-full__tagline">{content.tagline}</p>
          </header>
          <div className="cork-full__notes">
            {content.cards.map((c, i) => (
              <article
                key={i}
                className={`sticky sticky--${(i % 5) + 1}`}
                style={{
                  transform: `rotate(${
                    ((i * 17) % 9) - 4
                  }deg) translateY(${(i % 3) * 4}px)`,
                }}
              >
                <div className="sticky__pin" />
                <div className="sticky__kicker">{c.kicker}</div>
                <h3 className="sticky__title">{c.title}</h3>
                <p className="sticky__body">{c.body}</p>
                {c.links?.length > 0 && (
                  <ul className="sticky__links">
                    {c.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target={
                            l.href.startsWith('http') ? '_blank' : undefined
                          }
                          rel="noopener noreferrer"
                        >
                          {l.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cluster-overlay ${open ? 'open' : ''}`}>
      <div className="cluster-overlay__backdrop" onClick={deselectCluster} />
      <aside className="cluster-overlay__panel" aria-hidden={!open}>
        {content && (
          <>
            <button
              className="cluster-overlay__close"
              onClick={deselectCluster}
              aria-label="Close"
            >
              ← back
            </button>
            {renderBody()}
          </>
        )}
      </aside>
    </div>
  );
}
