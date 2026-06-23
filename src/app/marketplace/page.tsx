"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/layout/Nav";

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: number;
  freelancerName: string;
  freelancerBio?: string;
  avatarColor?: string;
  skills?: string[];
  completedJobs?: number;
  avgScore?: number;
  createdAt: string;
}

const SAMPLE_SERVICES: Service[] = [
  {
    id: "demo-1",
    slug: "amaka-seo-writing",
    title: "SEO blog post, 1,000 words",
    description: "Research-backed, keyword-optimised articles. Delivered in 48 hours with 2 revisions included.",
    priceUsdc: 8,
    freelancerName: "Amaka O.",
    freelancerBio: "5 years writing for SaaS startups and African tech publications.",
    avatarColor: "#10d98a",
    skills: ["Writing", "SEO", "Marketing"],
    completedJobs: 47,
    avgScore: 93,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-2",
    slug: "chidi-react-dev",
    title: "React UI component, pixel-perfect",
    description: "Responsive, accessible React components. TypeScript + Tailwind. Delivered with Storybook docs.",
    priceUsdc: 35,
    freelancerName: "Chidi A.",
    freelancerBio: "Frontend engineer with 6 years building products for fintech and health.",
    avatarColor: "#5090ff",
    skills: ["Development", "Design"],
    completedJobs: 22,
    avgScore: 97,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "demo-3",
    slug: "fatima-translation",
    title: "English to French/Arabic translation",
    description: "Certified translator. Legal, marketing, and technical documents. Fast turnaround.",
    priceUsdc: 12,
    freelancerName: "Fatima N.",
    freelancerBio: "Trilingual translator working with international NGOs and startups.",
    avatarColor: "#e0407a",
    skills: ["Translation"],
    completedJobs: 104,
    avgScore: 96,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "demo-4",
    slug: "emeka-logo-design",
    title: "Logo + brand identity pack",
    description: "Custom logo, color palette, typography guidelines, and social media kit. SVG + all formats.",
    priceUsdc: 60,
    freelancerName: "Emeka D.",
    freelancerBio: "Brand designer for 40+ African and global startups.",
    avatarColor: "#f0a500",
    skills: ["Design"],
    completedJobs: 31,
    avgScore: 91,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const CATEGORY_FILTERS = ["All", "Writing", "SEO", "Development", "Design", "Translation", "Marketing", "Data Analysis"];

export default function Marketplace() {
  const [role, setRole] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userServices, setUserServices] = useState<Service[]>([]);

  useEffect(() => {
    try {
      const p = localStorage.getItem("receipt_profile");
      if (p) setRole(JSON.parse(p).role || null);
    } catch {}
    try {
      const raw = localStorage.getItem("receipt_services");
      if (raw) setUserServices(JSON.parse(raw));
    } catch {}
  }, []);

  const allServices = [...userServices, ...SAMPLE_SERVICES];

  const filtered = allServices.filter((s) => {
    const matchFilter = filter === "All" || (s.skills || []).includes(filter);
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 20px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>
                {role === "worker" ? "Job board" : "Find a worker"}
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                {role === "worker"
                  ? "Browse open briefs from clients. Apply and get paid instantly in USDC."
                  : "Hire skilled workers. Pay on delivery. USDC settles in under 500ms."}
              </p>
            </div>
            {role === "worker" && (
              <Link href="/setup">
                <button
                  style={{
                    padding: "9px 18px",
                    background: "#10d98a",
                    color: "#0a0f1e",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  + List my service
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Search + filters */}
        <div style={{ marginBottom: 28, marginTop: 28 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "#ffffff",
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              boxSizing: "border-box" as const,
              marginBottom: 14,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.3)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "6px 13px",
                  borderRadius: 100,
                  border: filter === cat ? "1px solid #10d98a" : "1px solid rgba(255,255,255,0.08)",
                  background: filter === cat ? "rgba(16,217,138,0.1)" : "rgba(255,255,255,0.03)",
                  color: filter === cat ? "#10d98a" : "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: filter === cat ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
          {filtered.length} service{filtered.length !== 1 ? "s" : ""} available
        </p>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((service, i) => {
            const initials = service.freelancerName
              .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={service.id.startsWith("demo-") ? "#" : `/hire/${service.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "20px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      height: "100%",
                      boxSizing: "border-box" as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Worker info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: service.avatarColor || "#10d98a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>
                          {service.freelancerName}
                        </div>
                        {(service.avgScore || service.completedJobs) && (
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                            {service.completedJobs && `${service.completedJobs} jobs`}
                            {service.avgScore && service.completedJobs && " · "}
                            {service.avgScore && `${service.avgScore}% agent score`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service title */}
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "-0.01em",
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.5,
                        marginBottom: 14,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {service.description}
                    </p>

                    {/* Skills */}
                    {service.skills && service.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {service.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 100,
                              fontSize: 10,
                              fontWeight: 600,
                              background: "rgba(80,144,255,0.1)",
                              color: "#5090ff",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#10d98a",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${service.priceUsdc.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>USDC</span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#10d98a",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
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

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
              No services match your search. Try a different keyword or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
