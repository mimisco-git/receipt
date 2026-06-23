"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import { formatUsdc, timeAgo } from "@/lib/utils";

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: number;
  currency: string;
  freelancerName: string;
  freelancerBio?: string;
  avatarColor?: string;
  createdAt: string;
}

interface Job {
  id: string;
  clientName: string;
  brief: string;
  amountUsdc: number;
  currency: string;
  serviceTitle: string;
  createdAt: string;
  status: string;
}

export default function Marketplace() {
  const [tab, setTab] = useState<"workers" | "jobs">("workers");
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/service/list").then(r => r.ok ? r.json() : { services: [] }),
      fetch("/api/contracts?role=open").then(r => r.ok ? r.json() : { contracts: [] }),
    ]).then(([serviceData, jobData]) => {
      if (serviceData.services?.length) {
        setServices(serviceData.services.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          slug: s.slug as string,
          title: s.title as string,
          description: s.description as string,
          priceUsdc: s.priceUsdc as number,
          currency: (s.currency as string) || "USDC",
          freelancerName: (s.freelancer as Record<string, string>)?.name || "Freelancer",
          freelancerBio: (s.freelancer as Record<string, string>)?.bio,
          avatarColor: (s.freelancer as Record<string, string>)?.avatarColor,
          createdAt: s.createdAt as string,
        })));
      }
      if (jobData.contracts?.length) {
        setJobs(jobData.contracts.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          clientName: c.clientName as string,
          brief: c.brief as string,
          amountUsdc: c.amountUsdc as number,
          currency: (c.currency as string) || "USDC",
          serviceTitle: (c.service as Record<string, string>)?.title || "Job",
          createdAt: c.createdAt as string,
          status: c.status as string,
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
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

        {/* Header */}
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
            {(["workers", "jobs"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 100,
                  border: "none",
                  background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
                  color: tab === t ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 13,
                  fontWeight: tab === t ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {t === "workers" ? "Workers" : "Open Jobs"}
                {t === "jobs" && jobs.length > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{jobs.length}</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* JOBS TAB */}
        {tab === "jobs" && (
          <div>
            {loading ? (
              <LoadingDots />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No open jobs yet"
                subtitle="When clients fund escrow, open jobs appear here for workers to claim."
                ctaLabel="Post a job"
                ctaHref="/setup"
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {jobs.map((job, i) => {
                  const sym = job.currency === "EURC" ? "€" : "$";
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link href={`/escrow/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div
                          style={{
                            padding: "18px 20px",
                            background: "var(--card)",
                            border: "1px solid var(--line)",
                            borderRadius: 14,
                            cursor: "pointer",
                            transition: "border-color 0.15s, background 0.15s",
                            display: "flex", alignItems: "center", gap: 14,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.background = "var(--card-2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--card)"; }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                              {job.serviceTitle}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>
                              Posted by {job.clientName} · {timeAgo(new Date(job.createdAt))}
                            </div>
                            <div style={{
                              fontSize: 13, color: "var(--text-2)", lineHeight: 1.5,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {job.brief}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--green)" }}>
                              {sym}{formatUsdc(job.amountUsdc)}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-3)" }}>{job.currency}</div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WORKERS TAB */}
        {tab === "workers" && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workers or services..."
                className="input"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            {loading ? (
              <LoadingDots />
            ) : filtered.length === 0 && services.length === 0 ? (
              <EmptyState
                icon="👷"
                title="No workers yet"
                subtitle="Be the first to list your service on Receipt."
                ctaLabel="List my service"
                ctaHref="/setup"
              />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                  No services match &ldquo;{search}&rdquo;.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>
                  {filtered.length} service{filtered.length !== 1 ? "s" : ""} available
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}>
                  {filtered.map((service, i) => {
                    const initials = service.freelancerName
                      .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                    const sym = service.currency === "EURC" ? "€" : "$";
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link href={`/hire/${service.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
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
                            {/* Worker info */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: "50%",
                                background: service.avatarColor || "var(--green)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700, flexShrink: 0, color: "#fff",
                              }}>
                                {initials}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                  {service.freelancerName}
                                </div>
                                {service.freelancerBio && (
                                  <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {service.freelancerBio}
                                  </div>
                                )}
                              </div>
                            </div>

                            <h3 style={{
                              fontSize: 15, fontWeight: 700,
                              letterSpacing: "-0.01em",
                              marginBottom: 8, lineHeight: 1.3,
                            }}>
                              {service.title}
                            </h3>

                            <p style={{
                              fontSize: 13, color: "var(--text-2)", lineHeight: 1.5,
                              marginBottom: 14,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                              {service.description}
                            </p>

                            {/* Price + CTA */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div>
                                <span className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>
                                  {sym}{formatUsdc(service.priceUsdc)}
                                </span>
                                <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 4 }}>{service.currency}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
                                Hire
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
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

function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref }: {
  icon: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
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
