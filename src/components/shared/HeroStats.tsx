"use client";

import { useEffect, useState } from "react";

function AnimCounter({ target, prefix = "", suffix = "", decimals = 0, delay = 0 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number; delay?: number;
}) {
  const [val, setVal] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      const duration = 1200;
      const startTime = performance.now();
      function tick(now: number) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(2, -10 * progress);
        setVal(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);

  const formatted = decimals > 0
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString();

  return (
    <span style={{
      fontFamily: '"DM Mono", monospace',
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 25, fontWeight: 500,
      letterSpacing: "-0.02em",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.25s ease",
    }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function HeroStats() {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "center", gap: 32,
      paddingTop: 32,
      borderTop: "1px solid rgba(255,255,255,0.05)",
    }}>
      {[
        { label: "Settled today",   val: 12847, prefix: "$", suffix: "",    dec: 0, accent: true,  delay: 0 },
        { label: "Avg. settlement", val: 482,   prefix: "",  suffix: "ms",  dec: 0, accent: false, delay: 110 },
        { label: "Chargebacks",     val: 0,     prefix: "",  suffix: "%",   dec: 0, accent: false, delay: 220 },
        { label: "Settlement rail", special: "Arc", accent: false },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              marginBottom: 5,
              color: s.accent ? "var(--ledger)" : "var(--ink)",
            }}>
              {s.special
                ? <span style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em",
                  }}>{s.special}</span>
                : <AnimCounter target={s.val!} prefix={s.prefix} suffix={s.suffix} decimals={s.dec} delay={s.delay} />
              }
            </div>
            <div style={{ fontSize: 10.5, color: "var(--mist)", letterSpacing: "0.04em" }}>
              {s.label}
            </div>
          </div>
          {i < 3 && (
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.05)" }} />
          )}
        </div>
      ))}
    </div>
  );
}
