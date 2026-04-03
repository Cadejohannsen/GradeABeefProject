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
          DEFAULT: "#2D1B4E",
          foreground: "#ffffff",
          50: "#e8ddf2",
          100: "#c5b3db",
          200: "#9B7EC4",
          300: "#7B5DAA",
          400: "#5C3D8F",
          500: "#2D1B4E",
          600: "#251745",
          700: "#1E123A",
          800: "#160D2E",
          900: "#0F0A20",
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
