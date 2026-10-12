import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050b14", // deepest background
          900: "#0a1325", // main deep dark blue
          850: "#0d1830",
          800: "#11203e", // card background
          750: "#16284c",
          700: "#1c325c", // border / hover
          600: "#243f73",
          500: "#315496",
        },
        gold: {
          200: "#fbf0cb",
          300: "#f5e096",
          400: "#eac965",
          500: "#d4af37", // refined prestige collegiate gold
          600: "#b99326",
          700: "#947219",
          800: "#735715",
        },
        platinum: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-cinzel)", "Georgia", "serif"],
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(212, 175, 55, 0.25)",
        "gold-lg": "0 10px 30px -4px rgba(212, 175, 55, 0.35)",
        navy: "0 10px 30px -5px rgba(5, 11, 20, 0.8)",
      },
      animation: {
        "pulse-gold": "pulseGold 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
