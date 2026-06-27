"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

// ── BUTTON ──────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    primary:   "bg-[#00E5C3] text-[#000000] hover:opacity-90 hover:-translate-y-0.5",
    secondary: "bg-transparent text-[var(--text-primary)] border border-[var(--border-light)] hover:bg-white/5",
    ghost:     "bg-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
    danger:    "bg-[rgba(255,68,68,0.10)] text-[#ff4444] border border-[rgba(255,68,68,0.2)] hover:bg-[rgba(255,68,68,0.2)]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ── BADGE ──────────────────────────────────────────────────

interface BadgeProps {
  variant?: "mint" | "amber" | "red" | "blue" | "neutral";
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

const badgeVariants = {
  mint:    { bg: "rgba(0,229,195,0.10)",    color: "#00E5C3", border: "rgba(0,229,195,0.2)" },
  amber:   { bg: "rgba(255,255,255,0.05)",  color: "#888888", border: "rgba(255,255,255,0.10)" },
  red:     { bg: "rgba(255,68,68,0.10)",    color: "#ff4444", border: "rgba(255,68,68,0.2)" },
  blue:    { bg: "rgba(0,229,195,0.10)",    color: "#00E5C3", border: "rgba(0,229,195,0.2)" },
  neutral: { bg: "rgba(255,255,255,0.06)",  color: "#888888", border: "rgba(255,255,255,0.1)" },
};

export function Badge({ variant = "neutral", dot = false, pulse = false, children, className }: BadgeProps) {
  const v = badgeVariants[variant];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", className)}
      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}` }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: "currentColor",
            animation: pulse ? "pulse-dot 1.5s ease-in-out infinite" : "none",
          }}
        />
      )}
      {children}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </span>
  );
}

// ── CARD ──────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-200",
        hover && "cursor-pointer",
        className
      )}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
      } : undefined}
      onMouseLeave={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
      } : undefined}
    >
      {children}
    </div>
  );
}

// ── INPUT ──────────────────────────────────────────────────

interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  as?: "input" | "textarea";
  rows?: number;
  mono?: boolean;
  className?: string;
  [key: string]: unknown;
}

export function Input({
  label,
  hint,
  error,
  as: Tag = "input",
  rows = 3,
  mono = false,
  className,
  ...props
}: InputProps) {
  const inputStyle: React.CSSProperties = {
    background: "var(--card)",
    border: `1px solid ${error ? "rgba(255,68,68,0.5)" : "var(--border)"}`,
    color: "var(--text-primary)",
    fontFamily: mono ? '"JetBrains Mono", monospace' : undefined,
    fontSize: mono ? 13 : undefined,
    resize: Tag === "textarea" ? "none" as const : undefined,
  };

  const cls =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-[color:var(--text-muted)]";

  return (
    <div className={className}>
      {label && (
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}
      {Tag === "textarea" ? (
        <textarea
          rows={rows}
          className={cls}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? "rgba(255,68,68,0.5)" : "var(--border)")}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={cls}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,195,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? "rgba(255,68,68,0.5)" : "var(--border)")}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error && (
        <div className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{hint}</div>
      )}
      {error && (
        <div className="text-xs mt-1.5" style={{ color: "var(--red)" }}>{error}</div>
      )}
    </div>
  );
}

// ── ARC BADGE ──────────────────────────────────────────────

export function ArcBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono"
      style={{
        background: "rgba(0,229,195,0.08)",
        color: "#00E5C3",
        border: "1px solid rgba(0,229,195,0.2)",
      }}
    >
      Arc · &lt;500ms
    </span>
  );
}

// ── SETTLEMENT STRIP ──────────────────────────────────────

export function SettlementStrip() {
  return (
    <div
      className="flex items-center justify-center gap-5 py-2.5 text-xs"
      style={{
        background: "rgba(0,229,195,0.02)",
        borderBottom: "1px solid rgba(0,229,195,0.06)",
        color: "var(--text-muted)",
      }}
    >
      {["Circle Gateway", "Arc Testnet", "USDC · EURC", "x402 Protocol"].map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--mint)", opacity: 0.6 }}
          />
          {s}
        </div>
      ))}
    </div>
  );
}
