"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "var(--space)" }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
        style={{
          background: "rgba(255,68,68,0.1)",
          border: "1px solid rgba(255,68,68,0.2)",
        }}
      >
        ⚠
      </div>
      <div>
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ letterSpacing: "-0.04em" }}
        >
          Something went wrong
        </h2>
        <p
          className="text-sm text-center max-w-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
        style={{ background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#000000", boxShadow: "0 8px 30px rgba(0,229,195,.15)" }}
      >
        Try again
      </button>
    </div>
  );
}
