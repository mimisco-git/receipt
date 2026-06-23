"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("receipt_profile");
      if (!stored) { router.replace("/profile"); return; }
      const profile = JSON.parse(stored);
      if (profile.role === "client") {
        router.replace("/client-dashboard");
      } else if (profile.role === "worker") {
        router.replace("/worker-dashboard");
      } else {
        router.replace("/profile");
      }
    } catch {
      router.replace("/profile");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--green)",
            animation: `pulse-dot 1.2s ${i * 0.15}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
