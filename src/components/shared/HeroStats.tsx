"use client";

import { useEffect, useState } from "react";

interface Stats {
  services: number;
  contracts: number;
  settled: number;
  volume: number;
}

export default function HeroStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  const items = [
    { label: "Settlement speed",  value: "<500ms" },
    { label: "Currencies",        value: "USDC · EURC" },
    { label: "Services live",     value: stats ? String(stats.services) : "—" },
    { label: "Contracts settled", value: stats ? String(stats.settled) : "—" },
    { label: "Volume (USDC)",     value: stats ? `$${stats.volume.toFixed(2)}` : "—" },
  ];

  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center", gap: 32,
      opacity: 0.6,
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
            <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.03em" }}>
              {s.label}
            </div>
          </div>
          {i < items.length - 1 && (
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 10 }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
