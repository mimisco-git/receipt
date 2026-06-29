"use client";

import { motion, AnimatePresence, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRef, useCallback } from "react";

type OrbState = "idle" | "locked" | "released";

interface Props {
  amount: number;
  state: OrbState;
  size?: number;
  currency?: string;
}

export default function PaymentOrb({ amount, state, size = 180, currency = "USDC" }: Props) {
  const orbRef = useRef<HTMLDivElement>(null);

  const mouseX = useSpring(38, { stiffness: 80, damping: 18 });
  const mouseY = useSpring(32, { stiffness: 80, damping: 18 });
  const specX  = useTransform(mouseX, v => `${v}%`);
  const specY  = useTransform(mouseY, v => `${v}%`);
  const specBg = useMotionTemplate`radial-gradient(circle at ${specX} ${specY}, var(--orb-spec), transparent 50%)`;

  // Tilt effect: up to 3 degrees
  const tiltX = useTransform(mouseY, [0, 100], [3, -3]);
  const tiltY = useTransform(mouseX, [0, 100], [-3, 3]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbRef.current) return;
    const r = orbRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width) * 100);
    mouseY.set(((e.clientY - r.top) / r.height) * 100);
  }, [mouseX, mouseY]);

  const onLeave = useCallback(() => {
    mouseX.set(38);
    mouseY.set(32);
  }, [mouseX, mouseY]);

  const fmt = amount.toFixed(2);

  const theme = {
    idle: {
      coreA:  "rgba(18,30,50,0.95)",
      coreB:  "rgba(10,18,32,0.98)",
      spec:   "rgba(255,255,255,0.06)",
      fresnel:"rgba(255,255,255,0.04)",
      ring:   "rgba(255,255,255,0.06)",
      glow:   "transparent",
      anim:   "orb-glow-idle 8s ease-in-out infinite",
      label:  "var(--text-3)",
    },
    locked: {
      coreA:  "rgba(0,30,25,0.95)",
      coreB:  "rgba(0,18,15,0.98)",
      spec:   "rgba(0,229,195,0.18)",
      fresnel:"rgba(0,229,195,0.10)",
      ring:   "rgba(0,229,195,0.20)",
      glow:   "rgba(0,229,195,0.12)",
      anim:   "orb-glow-locked 3s ease-in-out infinite",
      label:  "var(--accent)",
    },
    released: {
      coreA:  "rgba(0,35,28,0.95)",
      coreB:  "rgba(0,20,16,0.98)",
      spec:   "rgba(0,229,195,0.22)",
      fresnel:"rgba(0,229,195,0.14)",
      ring:   "rgba(0,229,195,0.28)",
      glow:   "rgba(0,229,195,0.22)",
      anim:   "orb-glow-settled 2s ease-in-out infinite",
      label:  "var(--accent)",
    },
  };

  const t = theme[state];

  return (
    <div
      ref={orbRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        width: size + 80,
        height: size + 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient pool behind orb */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: t.glow,
        filter: "blur(44px)",
        transition: "background 0.9s ease",
        pointerEvents: "none",
      }} />

      {/* Pulse rings: only when active */}
      <AnimatePresence>
        {state !== "idle" && [0, 24, 48].map((offset, i) => (
          <motion.div
            key={`ring-${state}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 0.08, 0.6], scale: [1, 1.04, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
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
            initial={{ scale: 0.8, opacity: 0.85 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              boxShadow: "inset 0 0 0 1px rgba(0,229,195,0.6)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* THE ORB */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          ref={undefined}
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotateX: tiltX.get(),
            rotateY: tiltY.get(),
          }}
          exit={{ scale: 0.82, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={{
            width: size, height: size,
            borderRadius: "50%",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            // Liquid glass core: conic gradient gives rotational depth
            background: `conic-gradient(from 210deg at 50% 50%, ${t.coreA}, ${t.coreB}, ${t.coreA})`,
            // Glass inset edges: top light, bottom shadow
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.12),
              inset 0 -1px 0 rgba(0,0,0,0.5),
              inset 1px 0 0 rgba(255,255,255,0.05),
              inset -1px 0 0 rgba(0,0,0,0.25)
            `,
            outline: `0.5px solid ${t.ring}`,
            animation: t.anim,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Mouse-tracking specular highlight */}
          <motion.div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            "--orb-spec": t.spec,
            background: specBg as unknown as string,
            pointerEvents: "none",
          } as React.CSSProperties} />

          {/* Fixed top-left specular (Fresnel edge) */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.12), transparent 40%)`,
            pointerEvents: "none",
          }} />

          {/* Fresnel bottom limb brightening */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: t.fresnel
              ? `radial-gradient(ellipse at 50% 92%, ${t.fresnel}, transparent 50%)`
              : "none",
            pointerEvents: "none",
          }} />

          {/* Subtle chromatic aberration */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 22% 24%, rgba(255,60,60,0.025), transparent 35%)",
            mixBlendMode: "screen", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 76% 74%, rgba(60,120,255,0.025), transparent 35%)",
            mixBlendMode: "screen", pointerEvents: "none",
          }} />

          {/* Rotating inner caustic (slow light ray) */}
          {state !== "idle" && (
            <div style={{
              position: "absolute",
              width: "60%", height: "60%",
              top: "-8%", left: "-8%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,229,195,0.12), transparent 70%)",
              animation: "orb-rotate 10s linear infinite",
              transformOrigin: "82% 82%",
              pointerEvents: "none",
            }} />
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {state === "released" ? (
              <motion.div
                key="check"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.06 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}
              >
                <svg width={size * 0.26} height={size * 0.26} viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="19" stroke="rgba(0,229,195,0.3)" strokeWidth="0.75"/>
                  <polyline points="11 20 18 27 29 13" stroke="#00E5C3" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono" style={{
                  fontSize: 13, letterSpacing: "0.14em",
                  color: "var(--green)", textTransform: "uppercase",
                }}>Settled</span>
              </motion.div>
            ) : (
              <motion.div
                key="amount"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 1 }}
              >
                <span className="font-mono" style={{
                  fontSize: size * 0.175, fontWeight: 400,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.02em", lineHeight: 1,
                }}>
                  {fmt}
                </span>
                <span className="font-mono" style={{
                  fontSize: size * 0.07, fontWeight: 400,
                  letterSpacing: "0.10em",
                  color: t.label, textTransform: "uppercase",
                }}>{currency}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
