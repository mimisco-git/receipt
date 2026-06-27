"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import { formatUsdc, timeAgo } from "@/lib/utils";

interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: number;
  currency: string;
  type: string;
  freelancerName: string;
  freelancerBio?: string;
  avatarColor?: string;
  createdAt: string;
}

export default function Marketplace() {
  const [tab, setTab] = useState<"services" | "jobs">("services");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service/list")
      .then(r => r.ok ? r.json() : { services: [] })
      .then(data => {
        if (data.services?.length) {
          setListings(data.services.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            slug: s.slug as string,
            title: s.title as string,
            description: s.description as string,
            priceUsdc: s.priceUsdc as number,
            currency: (s.currency as string) || "USDC",
            type: (s.type as string) || "service",
            freelancerName: (s.freelancer as Record<string, string>)?.name || "User",
            freelancerBio: (s.freelancer as Record<string, string>)?.bio,
            avatarColor: (s.freelancer as Record<string, string>)?.avatarColor,
            createdAt: s.createdAt as string,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter out own listings
  const myName = (() => {
    try { return JSON.parse(localStorage.getItem("receipt_profile") || "{}").name || ""; } catch { return ""; }
  })();
  const others = listings.filter(l => !myName || l.freelancerName.toLowerCase() !== myName.toLowerCase());
  const services = others.filter(l => l.type !== "job");
  const jobs = others.filter(l => l.type === "job");
  const current = tab === "services" ? services : jobs;

  const filtered = current.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q)
      || s.description.toLowerCase().includes(q)
      || s.freelancerName.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 20px 60px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>
              Marketplace
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Hire skilled workers or find open jobs. All payments settle in USDC or EURC on Arc.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {(["services", "jobs"] as const).map(t => {
              const count = t === "services" ? services.length : jobs.length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "8px 18px", borderRadius: 100, border: "none",
                    background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
                    color: tab === t ? "var(--text-1)" : "var(--text-3)",
                    fontSize: 13, fontWeight: tab === t ? 600 : 500,
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                >
                  {t === "services" ? "Workers" : "Open Jobs"}
                  {count > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "services" ? "Search workers or services..." : "Search open jobs..."}
            className="input"
            style={{ background: "rgba(0,0,0,0.3)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}
          />
        </div>

        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 && current.length === 0 ? (
          <EmptyState
            title={tab === "services" ? "No workers yet" : "No open jobs yet"}
            subtitle={tab === "services"
              ? "Be the first to list your service on Receipt."
              : "Post a job and workers will find it here."}
            ctaLabel={tab === "services" ? "Offer a service" : "Post a job"}
            ctaHref="/setup"
          />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: "var(--text-3)", fontSize: 14 }}>
              No results match &ldquo;{search}&rdquo;.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>
              {filtered.length} {tab === "services" ? "service" : "job"}{filtered.length !== 1 ? "s" : ""} available
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}>
              {filtered.map((item, i) => {
                const initials = item.freelancerName
                  .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                const sym = item.currency === "EURC" ? "€" : "$";
                const isJob = item.type === "job";
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/hire/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div
                        style={{
                          padding: 20,
                          background: "var(--card)",
                          border: "1px solid var(--line)",
                          borderRadius: 16,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          height: "100%",
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "var(--card-2)";
                          e.currentTarget.style.borderColor = "var(--line-2)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "var(--card)";
                          e.currentTarget.style.borderColor = "var(--line)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: "50%",
                              background: item.avatarColor || "var(--green)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 700, flexShrink: 0, color: "#fff",
                            }}>
                              {initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>
                                {item.freelancerName}
                              </div>
                              {item.freelancerBio && (
                                <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.freelancerBio}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Type badge */}
                          <div style={{
                            padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                            background: isJob ? "var(--blue-dim)" : "var(--green-dim)",
                            color: isJob ? "var(--blue)" : "var(--green)",
                            border: `1px solid var(--green-border)`,
                            flexShrink: 0,
                          }}>
                            {isJob ? "Job" : "Service"}
                          </div>
                        </div>

                        <h3 style={{
                          fontSize: 15, fontWeight: 700,
                          letterSpacing: "-0.01em",
                          marginBottom: 8, lineHeight: 1.3,
                        }}>
                          {item.title}
                        </h3>

                        <p style={{
                          fontSize: 13, color: "var(--text-2)", lineHeight: 1.5,
                          marginBottom: 14,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {item.description}
                        </p>

                        {/* Price + CTA */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>
                              {sym}{formatUsdc(item.priceUsdc)}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 4 }}>{item.currency}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isJob ? "var(--blue)" : "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                            {isJob ? "Apply" : "Hire"}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                        </div>

                        {/* Posted time */}
                        {item.createdAt && (
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>
                            Posted {timeAgo(new Date(item.createdAt))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", gap: 6 }}>
      {[0, 0.15, 0.3].map(d => (
        <div key={d} style={{
          width: 6, height: 6, borderRadius: "50%", background: "var(--green)",
          animation: `pulse-dot 1.2s ${d}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle, ctaLabel, ctaHref }: {
  title: string; subtitle: string; ctaLabel: string; ctaHref: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
        {subtitle}
      </p>
      <Link href={ctaHref}>
        <button className="btn-primary" style={{ padding: "12px 24px", borderRadius: "var(--r-sm)" }}>
          {ctaLabel}
        </button>
      </Link>
    </div>
  );
}
