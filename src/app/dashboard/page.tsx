"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { timeAgo } from "@/lib/utils";

// rAF spring counter . eases out exponentially
function SpringNum({ target, prefix = "", suffix = "", dec = 2, delay = 0 }: {
  target: number; prefix?: string; suffix?: string; dec?: number; delay?: number;
}) {
  const [v, setV] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    const tid = setTimeout(() => {
      const dur = 1100;
      const t0 = performance.now();
      function tick(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(2, -10 * p);
        setV(target * e);
        if (p < 1) frame.current = requestAnimationFrame(tick);
      }
      frame.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame.current); };
  }, [target, delay]);
  return <span>{prefix}{dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString()}{suffix}</span>;
}

const CONTRACTS = [
  { id:"c1", title:"SEO blog post · Lagos solar",       client:"James Adeyemi",  net:7.20,  status:"SETTLED",          score:90,  time: new Date(Date.now()-180000) },
  { id:"c2", title:"Product description · fintech app", client:"Startup Lagos",   net:12.60, status:"SETTLED",          score:95,  time: new Date(Date.now()-7200000) },
  { id:"c3", title:"Newsletter copy · 500 words",       client:"Chioma Obi",     net:4.50,  status:"SETTLED",          score:88,  time: new Date(Date.now()-93600000) },
  { id:"c4", title:"Social media package · 10 posts",   client:"TechBridge NG",  net:18.00, status:"PENDING_DELIVERY", score:null,time: new Date(Date.now()-1800000) },
  { id:"c5", title:"Grant proposal · NGO",              client:"Kemi Soluade",   net:22.50, status:"SETTLED",          score:92,  time: new Date(Date.now()-180000000) },
];

const SC: Record<string, { label:string; dim:string; color:string; ring:string; icon:string }> = {
  SETTLED:          { label:"Settled",   dim:"rgba(0,229,160,0.08)",   color:"var(--ledger)", ring:"rgba(0,229,160,0.15)",   icon:"✓" },
  PENDING_DELIVERY: { label:"In escrow", dim:"rgba(239,160,32,0.08)",  color:"var(--amber)",  ring:"rgba(239,160,32,0.15)",  icon:"·" },
  AGENT_EVALUATING: { label:"Reviewing", dim:"rgba(74,144,232,0.08)",  color:"var(--blue)",   ring:"rgba(74,144,232,0.15)",  icon:"·" },
  DISPUTED:         { label:"Disputed",  dim:"rgba(224,80,80,0.08)",   color:"var(--red)",    ring:"rgba(224,80,80,0.15)",   icon:"!" },
};

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ background: "var(--layer-0)", minHeight: "100vh" }}>
      <Nav />

      {/* Ambient light field */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 1000, height: 500, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse, rgba(0,229,160,0.03) 0%, rgba(74,144,232,0.015) 40%, transparent 70%)",
        filter: "blur(80px)",
      }} />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 100px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25,0.46,0.45,0.94] }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--mist)", textTransform: "uppercase", marginBottom: 8 }}>
            Freelancer · Arc Testnet
          </div>
          <h1 style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Good evening, Amara.
          </h1>
        </motion.div>

        {/* WALLET-STYLE METRICS . large numbers, no card boxes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            alignItems: "center",
            padding: "32px 40px", marginBottom: 48,
            background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.010))",
            borderRadius: "var(--r-2xl)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.4)",
          }}
        >
          {[
            { label: "Total earned",      val: 47.20, prefix:"$", dec:2,  accent:true,  delay:0 },
            { label: "Settled",           val: 6,     prefix:"",  dec:0,  accent:false, delay:100 },
            { label: "In escrow",         val: 1,     prefix:"",  dec:0,  accent:false, delay:200 },
            { label: "Avg. settlement",   val: 482,   prefix:"",  dec:0,  suffix:"ms",  accent:false, delay:300 },
          ].reduce<React.ReactNode[]>((acc, s, i, arr) => {
            acc.push(
              <div key={s.label} style={{ padding: i === 0 ? "0 32px 0 0" : i === arr.length-1 ? "0 0 0 32px" : "0 32px", textAlign: i === 0 ? "left" : "center" }}>
                <div style={{
                  fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
                  color: "var(--mist)", textTransform: "uppercase", marginBottom: 10,
                }}>
                  {s.label}
                </div>
                <div className="font-mono" style={{
                  fontSize: "clamp(24px,3vw,32px)", fontWeight: 400,
                  color: s.accent ? "var(--ledger)" : "var(--ink)",
                  letterSpacing: "-0.03em",
                }}>
                  <SpringNum target={s.val} prefix={s.prefix} suffix={"suffix" in s ? s.suffix : ""} dec={s.dec} delay={s.delay} />
                </div>
              </div>
            );
            if (i < arr.length - 1) {
              acc.push(
                <div key={`div-${i}`} style={{ width: 0.5, height: 44, background: "rgba(255,255,255,0.06)", alignSelf: "center" }} />
              );
            }
            return acc;
          }, [])}
        </motion.div>

        {/* Activity feed */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>Recent contracts</div>
            <button className="btn-ghost" style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11.5 }}>
              View all
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {CONTRACTS.map((c, i) => {
              const st = SC[c.status] ?? SC.SETTLED;
              const settled = c.status === "SETTLED";
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.04, duration: 0.4, ease: [0.25,0.46,0.45,0.94] }}
                  onClick={() => router.push(`/escrow/${c.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 16px", borderRadius: "var(--r-lg)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.008))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    transition: "background 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.016))";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.008))";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.2)";
                  }}
                >
                  {/* Status icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: st.dim,
                    boxShadow: `inset 0 0 0 0.5px ${st.ring}`,
                    fontSize: 13, color: st.color,
                    fontWeight: 600,
                  }}>{st.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--mist)", marginTop: 2 }}>
                      {c.client}{c.score ? ` · ${c.score}% scope` : ""} · {timeAgo(c.time)}
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{
                    padding: "2px 9px", borderRadius: 999, flexShrink: 0,
                    background: st.dim, color: st.color,
                    boxShadow: `inset 0 0 0 0.5px ${st.ring}`,
                    fontSize: 10.5, fontWeight: 600,
                  }}>{st.label}</div>

                  {/* Amount */}
                  <div style={{ textAlign: "right", flexShrink: 0, minWidth: 68 }}>
                    <div className="font-mono" style={{
                      fontSize: 13, fontWeight: 400,
                      color: settled ? "var(--ledger)" : "var(--amber)",
                    }}>
                      {settled ? "+" : ""}${c.net.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 9.5, color: "var(--mist)" }}>USDC</div>
                  </div>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--mist)">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Withdrawal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{
            marginTop: 16,
            padding: "28px 32px",
            borderRadius: "var(--r-2xl)",
            background: "linear-gradient(145deg, rgba(0,229,160,0.07), rgba(0,200,255,0.03))",
            boxShadow: "inset 0 1px 0 rgba(0,229,160,0.12), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 20,
          }}
        >
          <div>
            <div style={{
              fontSize: 11, fontWeight: 400, letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.35)", marginBottom: 10, textTransform: "uppercase",
            }}>
              Available to withdraw
            </div>
            <div className="font-mono" style={{
              fontSize: 38, fontWeight: 400, letterSpacing: "-0.03em",
              color: "var(--ledger)",
            }}>
              $47.20
              <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 6, opacity: 0.45 }}>USDC</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(0,229,160,0.35)", marginTop: 6 }}>
              Settled on Arc. Transfer to any wallet instantly.
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "12px 24px", borderRadius: 12, fontSize: 13 }}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${((e.clientX-rect.left)/rect.width)*100}%`);
              e.currentTarget.style.setProperty("--my", `${((e.clientY-rect.top)/rect.height)*100}%`);
            }}
          >
            Withdraw USDC
          </button>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
