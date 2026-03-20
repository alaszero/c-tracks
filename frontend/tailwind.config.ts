import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primarios — Naranja industrial
        primary: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        // Neutros — Gris acero industrial
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        // Acentos funcionales
        success: { DEFAULT: "#22C55E", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#EAB308", foreground: "#000000" },
        danger: { DEFAULT: "#EF4444", foreground: "#FFFFFF" },
        info: { DEFAULT: "#3B82F6", foreground: "#FFFFFF" },
        // Superficies
        background: "#0F172A",
        foreground: "#F8FAFC",
        card: { DEFAULT: "#1E293B", foreground: "#F8FAFC" },
        muted: { DEFAULT: "#334155", foreground: "#94A3B8" },
        border: "#334155",
        input: "#334155",
        ring: "#F97316",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
