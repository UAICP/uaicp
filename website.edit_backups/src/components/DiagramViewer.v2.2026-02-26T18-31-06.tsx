import React, {useEffect, useRef, useState} from 'react';
import Mermaid from '@theme/Mermaid';

import styles from './DiagramViewer.module.css';

type DiagramViewerProps = {
  title?: string;
  mermaid: string;
  minWidth?: number;
};

export default function DiagramViewer({title, mermaid, minWidth = 760}: DiagramViewerProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let panZoom: {destroy: () => void} | null = null;
    let observer: MutationObserver | null = null;
    let isCancelled = false;

    const initPanZoom = async () => {
      const svg = host.querySelector('svg');
      if (!svg) {
        return;
      }

      if (panZoom) {
        return;
      }

      const module = await import('svg-pan-zoom');
      const createPanZoom = module.default;

      if (isCancelled) {
        return;
      }

      panZoom = createPanZoom(svg, {
        zoomEnabled: true,
        mouseWheelZoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 8,
      });

      setIsReady(true);
    };

    void initPanZoom();

    if (!panZoom) {
      observer = new MutationObserver(() => {
        if (!panZoom) {
          void initPanZoom();
        }
        if (panZoom && observer) {
          observer.disconnect();
          observer = null;
        }
      });

      observer.observe(host, {subtree: true, childList: true});
    }

    return () => {
      isCancelled = true;
      if (observer) {
        observer.disconnect();
      }
      if (panZoom) {
        panZoom.destroy();
      }
      setIsReady(false);
    };
  }, [mermaid]);

  const openFullSize = () => {
    const svg = hostRef.current?.querySelector('svg');
    if (!svg) {
      return;
    }

    const blob = new Blob([svg.outerHTML], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <section className={styles.block}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}

      <div className={styles.toolbar}>
        <button className="button button--secondary button--sm" type="button" onClick={openFullSize}>
          Open Full Size
        </button>
        <span className={styles.hint}>Use mouse wheel to zoom and drag to pan.</span>
      </div>

      <div className={styles.canvas} style={{minWidth: `${minWidth}px`}}>
        <div className={styles.host} ref={hostRef}>
          <Mermaid value={mermaid} />
        </div>
      </div>

      {!isReady ? <p className={styles.loading}>Loading interactive controls...</p> : null}
    </section>
  );
}
