"use client";

import { useEffect, useRef, useState } from "react";

function Counter({ target, prefix = "", suffix = "", dec = 0, delay = 0 }: {
  target: number; prefix?: string; suffix?: string; dec?: number; delay?: number;
}) {
  const [v, setV] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const tid = setTimeout(() => {
      const dur = 1000;
      const t0  = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(2, -10 * p);
        setV(target * e);
        if (p < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame.current); };
  }, [target, delay]);

  const formatted = dec > 0
    ? v.toFixed(dec)
    : Math.round(v).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

const stats = [
  { label: "Settlement speed",  special: "<500ms" },
  { label: "Chain",             special: "Arc L1" },
  { label: "Currencies",        special: "USDC · EURC" },
  { label: "Chargebacks",       special: "0%" },
];

export default function HeroStats() {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center", gap: 32,
      opacity: 0.6,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 20, fontWeight: 500,
              letterSpacing: "-0.02em", marginBottom: 4,
              color: "var(--text-1)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {s.special}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.03em" }}>
              {s.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 10 }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
