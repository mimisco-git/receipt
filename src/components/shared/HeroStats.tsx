"use client";

import { useEffect, useState, useRef } from "react";

interface Stats {
  services: number;
  contracts: number;
  settled: number;
  volume: number;
}

function useCountUp(target: number, duration = 1400): string {
  const [display, setDisplay] = useState("0");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (target === 0) { setDisplay("0"); return; }
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * target)));
      if (progress < 1) timerRef.current = setTimeout(step, 16);
    };
    step();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [target, duration]);

  return display;
}

export default function HeroStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  const servicesVal = useCountUp(stats?.services ?? 0);
  const settledVal  = useCountUp(stats?.settled ?? 0);
  const volumeInt   = useCountUp(stats ? Math.floor(stats.volume) : 0);

  const items = [
    { label: "Settlement speed",  value: "<500ms" },
    { label: "Currencies",        value: "USDC · EURC" },
    { label: "Services live",     value: servicesVal },
    { label: "Contracts settled", value: settledVal },
    { label: "Volume (USDC)",     value: `$${volumeInt}` },
  ];

  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 20, fontWeight: 500,
              letterSpacing: "-0.02em", marginBottom: 4,
              color: "var(--text-1)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-3)", letterSpacing: "0.03em" }}>
              {s.label}
            </div>
          </div>
          {i < items.length - 1 && (
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
