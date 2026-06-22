import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void:    "#07080F",
        glass:   "#0F1219",
        frost:   "#161C28",
        "frost-2": "#1B2230",
        wire:    "#1E2736",
        "wire-2": "#28344A",
        ink:     "#FFFFFF",
        "ink-2": "#C8D0DC",
        ash:     "#6B7588",
        mist:    "#3A4558",
        ledger:  "#00E896",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["DM Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        DEFAULT: "14px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        "ledger-sm": "0 0 24px rgba(0,232,150,0.12)",
        "ledger-md": "0 0 48px rgba(0,232,150,0.18)",
        "ledger-lg": "0 0 80px rgba(0,232,150,0.28)",
        "card":      "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
        "card-lg":   "0 24px 64px rgba(0,0,0,0.55)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "out-expo": "cubic-bezier(0.19, 1.0, 0.22, 1.0)",
      },
    },
  },
  plugins: [],
};
export default config;
