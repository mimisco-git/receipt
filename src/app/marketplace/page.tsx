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
  funded?: boolean;
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
            funded: s.funded as boolean | undefined,
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
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em", marginBottom: 6 }}>
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
                const isFunded = isJob && item.funded;
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
                          background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)",
                          backdropFilter: "blur(30px) saturate(180%)",
                          WebkitBackdropFilter: "blur(30px) saturate(180%)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 20,
                          boxShadow: "0 12px 32px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)",
                          cursor: "pointer",
                          transition: "transform 500ms cubic-bezier(0.34,1.4,0.64,1), border-color 280ms ease, background 280ms ease, box-shadow 400ms ease",
                          height: "100%",
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,.13)";
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.050) 0%, rgba(255,255,255,.025) 100%)";
                          e.currentTarget.style.boxShadow = "0 24px 56px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12)";
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.030) 0%, rgba(255,255,255,.012) 100%)";
                          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)";
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

                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                          <h3 style={{
                            fontSize: 15, fontWeight: 700,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.3, margin: 0,
                          }}>
                            {item.title}
                          </h3>
                          {isFunded && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                              padding: "3px 8px", borderRadius: 999,
                              background: "rgba(0,229,195,0.12)",
                              color: "var(--green)",
                              border: "1px solid rgba(0,229,195,0.25)",
                            }}>
                              ✓ Budget locked
                            </span>
                          )}
                          {isJob && !isFunded && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                              padding: "3px 8px", borderRadius: 999,
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.35)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}>
                              Pending funding
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: 13, opacity: 0.72, color: "inherit", lineHeight: 1.5,
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
                          <span style={{ fontSize: 12, fontWeight: 600, color: isFunded ? "var(--green)" : isJob ? "rgba(255,255,255,0.3)" : "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                            {isJob ? (isFunded ? "Accept →" : "View") : "Hire"}
                            {!isJob && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            )}
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
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 14,
    }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          padding: 20, borderRadius: 20, height: 200,
          background: "linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.018) 0%, rgba(255,255,255,.008) 100%)",
          border: "1px solid rgba(255,255,255,.05)",
          animation: `skeleton-pulse 1.8s ${i * 0.1}s ease-in-out infinite`,
        }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.04)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 11, borderRadius: 6, background: "rgba(255,255,255,.04)", width: "60%" }} />
              <div style={{ height: 9, borderRadius: 6, background: "rgba(255,255,255,.03)", width: "40%" }} />
            </div>
          </div>
          <div style={{ height: 13, borderRadius: 6, background: "rgba(255,255,255,.04)", marginBottom: 10 }} />
          <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,.03)", marginBottom: 7, width: "90%" }} />
          <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,.03)", width: "70%" }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle, ctaLabel, ctaHref }: {
  title: string; subtitle: string; ctaLabel: string; ctaHref: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "rgba(255,255,255,.28)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.65 }}>
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
