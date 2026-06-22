"use client";

import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useRef, useCallback } from "react";

type OrbState = "idle" | "locked" | "released";

interface Props {
  amount: number;
  state: OrbState;
  size?: number;
}

export default function PaymentOrb({ amount, state, size = 180 }: Props) {
  const orbRef = useRef<HTMLDivElement>(null);

  // Spring-physics mouse tracking for specular highlight
  const mouseX = useSpring(50, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(50, { stiffness: 100, damping: 20 });

  // Specular position as percentages
  const specX = useTransform(mouseX, v => `${v}%`);
  const specY = useTransform(mouseY, v => `${v}%`);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(38);
    mouseY.set(30);
  }, [mouseX, mouseY]);

  const fmt = amount.toFixed(2);

  // Per-state color system
  const theme = {
    idle: {
      core:    "conic-gradient(from 200deg, rgba(30,38,58,0.9), rgba(18,24,40,0.95), rgba(30,38,58,0.9))",
      fresnel: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.06), transparent 60%)",
      spec:    "rgba(255,255,255,0.05)",
      glow:    "transparent",
      ring:    "rgba(255,255,255,0.04)",
      pulse:   { boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 0px rgba(255,255,255,0)"] },
      label:   "var(--mist)",
    },
    locked: {
      core:    "conic-gradient(from 200deg, rgba(58,40,8,0.95), rgba(40,28,6,0.98), rgba(58,40,8,0.95))",
      fresnel: "radial-gradient(ellipse at 50% 100%, rgba(239,160,32,0.12), transparent 60%)",
      spec:    "rgba(255,200,60,0.14)",
      glow:    "rgba(239,160,32,0.14)",
      ring:    "rgba(239,160,32,0.15)",
      pulse:   {
        boxShadow: [
          "0 0 0px rgba(239,160,32,0.0), inset 0 1px 0 rgba(255,255,255,0.06)",
          "0 0 50px rgba(239,160,32,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
          "0 0 0px rgba(239,160,32,0.0), inset 0 1px 0 rgba(255,255,255,0.06)",
        ]
      },
      label:   "var(--amber)",
    },
    released: {
      core:    "conic-gradient(from 200deg, rgba(0,60,40,0.95), rgba(0,40,28,0.98), rgba(0,60,40,0.95))",
      fresnel: "radial-gradient(ellipse at 50% 100%, rgba(0,229,160,0.16), transparent 60%)",
      spec:    "rgba(0,255,180,0.18)",
      glow:    "rgba(0,229,160,0.20)",
      ring:    "rgba(0,229,160,0.22)",
      pulse:   {
        boxShadow: [
          "0 0 40px rgba(0,229,160,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
        ]
      },
      label:   "var(--ledger)",
    },
  };

  const t = theme[state];

  return (
    <div
      ref={orbRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: size + 80, height: size + 80,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Ambient light pool behind orb */}
      <div style={{
        position: "absolute", inset: -20, borderRadius: "50%",
        background: t.glow,
        filter: "blur(40px)",
        transition: "background 0.9s ease",
        pointerEvents: "none",
      }} />

      {/* Concentric rings — only when active */}
      <AnimatePresence>
        {state !== "idle" && [0, 26, 52].map((offset, i) => (
          <motion.div
            key={`ring-${state}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.6, 0.1, 0.6], scale: [1, 1.04, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.55, ease: "easeInOut" }}
            style={{
              position: "absolute", borderRadius: "50%",
              inset: -offset,
              boxShadow: `inset 0 0 0 0.5px ${t.ring}`,
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Settle ripple */}
      <AnimatePresence>
        {state === "released" && (
          <motion.div
            key="ripple"
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{}}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              inset: 0, borderRadius: "50%",
              boxShadow: "inset 0 0 0 1px rgba(0,229,160,0.5)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* THE ORB */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ scale: 0.82, opacity: 0 }}
          animate={
            state === "locked"
              ? {
                  scale: 1, opacity: 1,
                  boxShadow: t.pulse.boxShadow as string[],
                }
              : state === "released"
              ? {
                  scale: 1, opacity: 1,
                  boxShadow: t.pulse.boxShadow as string[],
                }
              : { scale: 1, opacity: 1 }
          }
          exit={{ scale: 0.82, opacity: 0 }}
          transition={
            state === "locked" || state === "released"
              ? {
                  scale: { type: "spring", stiffness: 260, damping: 22 },
                  opacity: { duration: 0.4 },
                  boxShadow: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
                }
              : { type: "spring", stiffness: 260, damping: 22 }
          }
          style={{
            width: size, height: size, borderRadius: "50%",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            background: t.core,
            // Glass material: specular inset highlight on top, shadow on bottom
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.10),
              inset 0 -1px 0 rgba(0,0,0,0.40),
              inset 1px 0 0 rgba(255,255,255,0.04),
              inset -1px 0 0 rgba(0,0,0,0.20),
              0 4px 24px rgba(0,0,0,0.5)
            `,
            // Thin specular ring (Fresnel edge effect)
            outline: `0.5px solid ${t.ring}`,
            outlineOffset: "0px",
          }}
        >
          {/* Moving specular highlight — follows mouse via spring */}
          <motion.div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at ${specX} ${specY}, ${t.spec}, transparent 52%)`,
            pointerEvents: "none",
          }} />

          {/* Fresnel edge — brighter at bottom limb */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: t.fresnel,
            pointerEvents: "none",
          }} />

          {/* Chromatic aberration: tiny red fringe on one edge, blue on other */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 28% 28%, rgba(255,80,80,0.025), transparent 35%)",
            pointerEvents: "none", mixBlendMode: "screen",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 72% 72%, rgba(80,120,255,0.025), transparent 35%)",
            pointerEvents: "none", mixBlendMode: "screen",
          }} />

          {/* Content */}
          <AnimatePresence mode="wait">
            {state === "released" ? (
              <motion.div
                key="check"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.08 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, zIndex: 1 }}
              >
                <svg width={size * 0.24} height={size * 0.24} viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="rgba(0,229,160,0.3)" strokeWidth="0.5" />
                  <polyline points="8 16 14 22 24 11" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-mono" style={{
                  fontSize: 9.5, letterSpacing: "0.14em",
                  color: "var(--ledger)", textTransform: "uppercase",
                }}>Settled</span>
              </motion.div>
            ) : (
              <motion.div
                key="amt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 1 }}
              >
                <span className="font-mono" style={{
                  fontSize: size * 0.175,
                  fontWeight: 400,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em", lineHeight: 1,
                }}>
                  {fmt}
                </span>
                <span className="font-mono" style={{
                  fontSize: size * 0.065, fontWeight: 400,
                  letterSpacing: "0.1em",
                  color: t.label, textTransform: "uppercase",
                }}>USDC</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
