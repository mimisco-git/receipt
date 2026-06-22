export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--space)" }}
    >
      <div className="flex items-center gap-2">
        {[0, 0.15, 0.3].map((d, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--mint)",
              opacity: 0.4,
              animation: `loading-dot 1.2s ${d}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes loading-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
