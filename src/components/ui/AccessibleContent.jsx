import { CLUSTER_CONTENT } from '../../content';
import { CLUSTERS, AREAS } from '../../clusters';
import { useStore } from '../../store';

const AREA_ORDER = ['desk', 'floor', 'bookshelf'];

function ClusterSection({ id }) {
  const content = CLUSTER_CONTENT[id];
  const selectCluster = useStore((s) => s.selectCluster);
  if (!content) return null;

  const title = content.title || CLUSTERS[id]?.label || id;

  return (
    <section aria-labelledby={`a11y-${id}-heading`}>
      <h3 id={`a11y-${id}-heading`}>
        <button
          type="button"
          className="a11y-cluster-link"
          onClick={() => selectCluster(id)}
        >
          {title}
        </button>
      </h3>
      {content.tagline && <p>{content.tagline}</p>}
      {content.body?.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      {content.list?.length > 0 && (
        <ul>
          {content.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {content.cards?.length > 0 && (
        <ul>
          {content.cards.map((c, i) => (
            <li key={i}>
              <strong>{c.title}</strong>
              {c.body ? ` — ${c.body}` : null}
              {c.links?.length > 0 && (
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target={l.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      {content.links?.length > 0 && (
        <ul>
          {content.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AccessibleContent() {
  const clustersByArea = AREA_ORDER.map((area) => ({
    area,
    label: AREAS[area]?.label || area,
    ids: Object.entries(CLUSTERS)
      .filter(([, c]) => c.area === area)
      .map(([id]) => id),
  }));

  return (
    <main className="visually-hidden" id="content">
      <h1>whatthenash — Nash&apos;s workshop</h1>
      <p>
        A 3D explorable shed portfolio. The interactive scene above needs a
        pointer or keyboard; the same content is written out here for screen
        readers and search engines. Activate a heading to jump to that spot in
        the 3D scene.
      </p>
      {clustersByArea.map(({ area, label, ids }) => (
        <section key={area} aria-labelledby={`a11y-area-${area}`}>
          <h2 id={`a11y-area-${area}`}>{label}</h2>
          {ids.map((id) => (
            <ClusterSection key={id} id={id} />
          ))}
        </section>
      ))}
    </main>
  );
}
