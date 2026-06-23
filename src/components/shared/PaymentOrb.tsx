"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

type OrbState = "idle" | "locked" | "evaluating" | "settled" | "disputed";

interface PaymentOrbProps {
  state?: OrbState;
  amount?: number;
  score?: number;
  size?: number;
  interactive?: boolean;
}

export default function PaymentOrb({
  state = "idle",
  amount = 0,
  score = 0,
  size = 220,
  interactive = true,
}: PaymentOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState(false);
  const [prevState, setPrevState] = useState(state);

  // Mouse tracking springs
  const mouseX = useSpring(0, { stiffness: 120, damping: 22 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 22 });

  // Tilt from mouse
  const rotateX = useTransform(mouseY, [-1, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [-1, 1], [-4, 4]);

  // Specular highlight position
  const specX = useTransform(mouseX, [-1, 1], [30, 70]);
  const specY = useTransform(mouseY, [-1, 1], [20, 60]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!orbRef.current || !interactive) return;
      const rect = orbRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set((e.clientX - cx) / (rect.width / 2));
      mouseY.set((e.clientY - cy) / (rect.height / 2));
    },
    [mouseX, mouseY, interactive]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const el = orbRef.current;
    if (!el || !interactive) return;
    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, interactive]);

  // Ripple on settle
  useEffect(() => {
    if (state === "settled" && prevState !== "settled") {
      setRipple(true);
      setTimeout(() => setRipple(false), 800);
    }
    setPrevState(state);
  }, [state, prevState]);

  const stateColors = {
    idle: {
      core: "radial-gradient(circle at 40% 35%, #2a3a5e 0%, #0d1525 60%, #060d1a 100%)",
      glow: "rgba(99,120,180,0.25)",
      accent: "#4a6fa5",
      label: "WAITING",
      labelColor: "rgba(150,170,210,0.7)",
    },
    locked: {
      core: "radial-gradient(circle at 40% 35%, #5a3800 0%, #2a1800 60%, #100800 100%)",
      glow: "rgba(240,140,0,0.35)",
      accent: "#f0a500",
      label: "LOCKED",
      labelColor: "rgba(240,160,60,0.9)",
    },
    evaluating: {
      core: "radial-gradient(circle at 40% 35%, #1a2a4a 0%, #0d1a35 60%, #060e20 100%)",
      glow: "rgba(80,140,255,0.3)",
      accent: "#5090ff",
      label: "READING",
      labelColor: "rgba(120,170,255,0.85)",
    },
    settled: {
      core: "radial-gradient(circle at 40% 35%, #004a2a 0%, #001f12 60%, #000d08 100%)",
      glow: "rgba(16,217,138,0.4)",
      accent: "#10d98a",
      label: "SETTLED",
      labelColor: "rgba(16,217,138,0.95)",
    },
    disputed: {
      core: "radial-gradient(circle at 40% 35%, #4a0a0a 0%, #200404 60%, #0d0101 100%)",
      glow: "rgba(220,60,60,0.3)",
      accent: "#dc3c3c",
      label: "DISPUTED",
      labelColor: "rgba(220,80,80,0.9)",
    },
  };

  const c = stateColors[state];
  const half = size / 2;

  return (
    <div
      ref={orbRef}
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
    >
      {/* Ambient glow beneath */}
      <motion.div
        style={{
          position: "absolute",
          inset: -size * 0.18,
          borderRadius: "50%",
          background: c.glow,
          filter: `blur(${size * 0.22}px)`,
          zIndex: 0,
        }}
        animate={{ opacity: state === "settled" ? [0.5, 0.9, 0.5] : [0.3, 0.55, 0.3] }}
        transition={{ duration: state === "settled" ? 1.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The orb itself */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 800,
          zIndex: 1,
          cursor: interactive ? "default" : "inherit",
        }}
      >
        {/* SVG refraction filter */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={`glass-${state}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                seed={state === "settled" ? 2 : 1}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={state === "settled" ? 3 : 5}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {/* Base sphere */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: c.core,
            boxShadow: `
              inset 0 ${size * 0.04}px ${size * 0.12}px rgba(255,255,255,0.06),
              inset 0 -${size * 0.06}px ${size * 0.15}px rgba(0,0,0,0.6),
              0 0 0 1px rgba(255,255,255,0.07)
            `,
          }}
        />

        {/* Chromatic aberration — red top-left */}
        <div
          style={{
            position: "absolute",
            top: size * 0.08,
            left: size * 0.09,
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,60,60,0.055) 0%, transparent 70%)",
          }}
        />
        {/* Chromatic aberration — blue bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: size * 0.09,
            right: size * 0.09,
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(60,80,255,0.055) 0%, transparent 70%)",
          }}
        />

        {/* Fresnel edge brightening — bottom limb */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 92%, rgba(255,255,255,0.09) 0%, transparent 55%)",
          }}
        />

        {/* Rotating caustic ray (evaluating only) */}
        {state === "evaluating" && (
          <motion.div
            style={{
              position: "absolute",
              inset: size * 0.12,
              borderRadius: "50%",
              background: `conic-gradient(
                transparent 0deg,
                rgba(80,140,255,0.06) 45deg,
                transparent 90deg,
                rgba(80,140,255,0.04) 180deg,
                transparent 270deg
              )`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Settled shimmer */}
        {state === "settled" && (
          <motion.div
            style={{
              position: "absolute",
              inset: size * 0.1,
              borderRadius: "50%",
              background: `conic-gradient(
                transparent 0deg,
                rgba(16,217,138,0.1) 60deg,
                transparent 120deg,
                rgba(16,217,138,0.06) 240deg,
                transparent 300deg
              )`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Mouse-tracking specular */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(
              circle at ${specX.get()}% ${specY.get()}%,
              rgba(255,255,255,0.14) 0%,
              rgba(255,255,255,0.04) 30%,
              transparent 60%
            )`,
          }}
        />

        {/* Fixed top-left Fresnel highlight */}
        <div
          style={{
            position: "absolute",
            top: size * 0.1,
            left: size * 0.14,
            width: size * 0.35,
            height: size * 0.28,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 70%)",
            filter: "blur(1px)",
          }}
        />

        {/* Small secondary highlight */}
        <div
          style={{
            position: "absolute",
            top: size * 0.22,
            left: size * 0.19,
            width: size * 0.12,
            height: size * 0.08,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Content: amount + label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: size * 0.04,
            zIndex: 2,
          }}
        >
          {/* Score bar (evaluating) */}
          {state === "evaluating" && score > 0 && (
            <div
              style={{
                width: size * 0.52,
                height: 3,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              <motion.div
                style={{ height: "100%", background: "#5090ff", borderRadius: 2 }}
                initial={{ width: "0%" }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Amount */}
          {amount > 0 && (
            <div
              style={{
                fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
                fontSize: size * 0.14,
                fontWeight: 600,
                color: state === "settled" ? "#10d98a" : state === "locked" ? "#f0a500" : "#ffffff",
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums lining-nums",
                lineHeight: 1,
              }}
            >
              ${amount.toFixed(2)}
            </div>
          )}

          {/* State label */}
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: size * 0.065,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: c.labelColor,
              textTransform: "uppercase" as const,
            }}
          >
            {state === "evaluating" && score > 0 ? `${score}%` : c.label}
          </div>

          {/* Settled tick */}
          {state === "settled" && (
            <motion.svg
              width={size * 0.14}
              height={size * 0.14}
              viewBox="0 0 24 24"
              fill="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <polyline
                points="4,12 9,17 20,7"
                stroke="#10d98a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </div>
      </motion.div>

      {/* Settlement ripple */}
      {ripple && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${c.accent}`,
            zIndex: 0,
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}

      {/* Second ripple */}
      {ripple && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${c.accent}`,
            zIndex: 0,
          }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
