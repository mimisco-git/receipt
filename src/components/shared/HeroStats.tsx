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
  { label: "Settled today",    val: 12834, prefix: "$", dec: 0, accent: true,  delay: 0 },
  { label: "Avg. settlement",  val: 482,   prefix: "",  suffix: "ms", dec: 0, delay: 100 },
  { label: "Chargebacks",      val: 0,     prefix: "",  suffix: "%",  dec: 0, delay: 200 },
  { label: "Settlement rail",  special: "Arc" },
];

export default function HeroStats() {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center", gap: 28,
      paddingTop: 28,
      borderTop: "1px solid var(--line)",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 24, fontWeight: 500,
              letterSpacing: "-0.02em", marginBottom: 4,
              color: s.accent ? "var(--green)" : "var(--text-1)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {s.special
                ? s.special
                : <Counter target={s.val!} prefix={s.prefix} suffix={s.suffix} dec={s.dec} delay={s.delay} />
              }
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.03em" }}>
              {s.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <div style={{ width: 1, height: 32, background: "var(--line)" }} />
          )}
        </div>
      ))}
    </div>
  );
}
