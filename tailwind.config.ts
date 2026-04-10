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
        background: "#0c0c0c",
        foreground: "#f0f0f0",
        card: {
          DEFAULT: "rgba(255,255,255,0.06)",
          foreground: "#f0f0f0",
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
          DEFAULT: "rgba(255,255,255,0.08)",
          foreground: "#a1a1aa",
        },
        border: "rgba(255,255,255,0.12)",
        input: "rgba(255,255,255,0.12)",
        ring: "rgba(255,255,255,0.3)",
        sidebar: {
          DEFAULT: "rgba(255,255,255,0.04)",
          foreground: "#e2e2e2",
          hover: "rgba(255,255,255,0.08)",
          active: "#ffffff",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
