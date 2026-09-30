"use client";

import { useSyncExternalStore } from "react";
import { altitudeAtProgress, MAX_ALTITUDE_M, MIN_ALTITUDE_M } from "@/lib/altitude";

const TICKS_M = [4500, 3500, 2500, 1500, 500, 0];

function subscribe(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getScrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.round((window.scrollY / max) * 100) / 100 : 0;
}

/**
 * Side gauge used instead of a progress bar: the reader "descends" from the
 * páramo to the Pacific coast as the page scrolls. Purely decorative, so it
 * is hidden from assistive technology and on small screens.
 */
export function AltitudeGauge() {
  const progress = useSyncExternalStore(subscribe, getScrollProgress, () => 0);
  const altitude = altitudeAtProgress(progress);
  const markerTop = `${progress * 100}%`;

  return (
    <div aria-hidden="true" className="altitude-gauge">
      <div className="altitude-gauge__track">
        {TICKS_M.map((tick) => (
          <span
            key={tick}
            className="altitude-gauge__tick"
            style={{ top: `${((MAX_ALTITUDE_M - tick) / (MAX_ALTITUDE_M - MIN_ALTITUDE_M)) * 100}%` }}
          >
            {tick}
          </span>
        ))}
        <span className="altitude-gauge__marker" style={{ top: markerTop }}>
          ▶ {altitude.toLocaleString("es-CO")} m
        </span>
      </div>

      <style>{`
        .altitude-gauge {
          position: fixed;
          right: 1rem;
          top: 90px;
          bottom: 30px;
          width: 64px;
          z-index: 40;
          pointer-events: none;
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: var(--color-ink-muted);
        }
        .altitude-gauge__track {
          position: relative;
          height: 100%;
          border-right: 2px solid color-mix(in srgb, var(--color-ink) 30%, transparent);
        }
        .altitude-gauge__tick {
          position: absolute;
          right: 6px;
          transform: translateY(-50%);
        }
        .altitude-gauge__marker {
          position: absolute;
          right: -2px;
          transform: translate(0, -50%);
          white-space: nowrap;
          background: var(--color-paper);
          color: var(--color-cinnabar);
          font-weight: 600;
          padding: 0 0.25rem;
        }
        @media (max-width: 1100px) {
          .altitude-gauge { display: none; }
        }
      `}</style>
    </div>
  );
}
