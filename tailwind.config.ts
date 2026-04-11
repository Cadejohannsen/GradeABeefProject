import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--ui-bg))",
        foreground: "rgb(var(--ui-fg))",
        surface: {
          DEFAULT: "#111111",
          raised: "#161616",
          overlay: "#1c1c1c",
        },
        card: {
          DEFAULT: "rgba(255,255,255,0.03)",
          foreground: "#f0f0f0",
          hover: "rgba(255,255,255,0.05)",
        },
        primary: {
          DEFAULT: "rgb(var(--cp) / <alpha-value>)",
          foreground: "#ffffff",
          50:  "rgb(var(--cp-50)  / <alpha-value>)",
          100: "rgb(var(--cp-100) / <alpha-value>)",
          200: "rgb(var(--cp-200) / <alpha-value>)",
          300: "rgb(var(--cp-300) / <alpha-value>)",
          400: "rgb(var(--cp-400) / <alpha-value>)",
          500: "rgb(var(--cp-500) / <alpha-value>)",
          600: "rgb(var(--cp-600) / <alpha-value>)",
          700: "rgb(var(--cp-700) / <alpha-value>)",
          800: "rgb(var(--cp-800) / <alpha-value>)",
          900: "rgb(var(--cp-900) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        muted: {
          DEFAULT: "rgba(255,255,255,0.06)",
          foreground: "#888888",
        },
        border: "rgba(255,255,255,0.08)",
        input: "rgba(255,255,255,0.08)",
        ring: "rgba(255,255,255,0.20)",
        sidebar: {
          DEFAULT: "rgb(var(--ui-sidebar))",
          foreground: "#d0d0d0",
          hover: "rgba(255,255,255,0.05)",
          active: "rgba(255,255,255,0.08)",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#dcfce7",
          muted: "rgba(34, 197, 94, 0.10)",
          border: "rgba(34, 197, 94, 0.18)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#fef3c7",
          muted: "rgba(245, 158, 11, 0.10)",
          border: "rgba(245, 158, 11, 0.18)",
        },
        danger: {
          DEFAULT: "#ef4444",
          foreground: "#fee2e2",
          muted: "rgba(239, 68, 68, 0.10)",
          border: "rgba(239, 68, 68, 0.18)",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
        xs: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
        glow: "0 0 24px rgb(var(--cp-400) / 0.20)",
        "glow-sm": "0 0 12px rgb(var(--cp-400) / 0.12)",
        modal: "0 32px 80px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
