import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy — deep ink violet spectrum
        surface: {
          DEFAULT: "#110334",         // Base canvas
          lowest: "#0c0225",          // Recessed / submerged
          low: "#160840",             // Slightly above base
          mid: "#1b0f4a",             // Mid layer
          high: "#231554",            // Floating cards
          highest: "#2c1d62",         // Most prominent / focus
          bright: "#39286e",          // Bright interactive
          variant: "#4c4071",         // Glass / outline base
        },
        // Primary — lavender purple
        primary: {
          DEFAULT: "#b6a0ff",
          dim: "#7e51ff",
          on: "#160050",
        },
        // on-surface text
        "on-surface": "#ebe1ff",
        "on-surface-variant": "#cbc2e8",
        // Outline
        "outline": "#7a6f99",
        "outline-variant": "#4c4071",
        // Secondary — electric teal
        secondary: {
          DEFAULT: "#00d9b8",
          dim: "#009e87",
          on: "#002b23",
        },
        // Tertiary — warm amber (chips, streaks)
        tertiary: {
          DEFAULT: "#ffb86c",
          dim: "#e07b39",
          on: "#3d1500",
        },
        // Error / wrong
        error: {
          DEFAULT: "#ff6b8a",
          dim: "#c0334f",
          on: "#3d0011",
        },
        // Success / correct
        success: {
          DEFAULT: "#4ade80",
          dim: "#16a34a",
          on: "#001f0d",
        },
        // Answer option accent badges (1-4)
        "opt-1": "#b6a0ff",   // primary lavender
        "opt-2": "#00d9b8",   // secondary teal
        "opt-3": "#ffb86c",   // tertiary amber
        "opt-4": "#c084fc",   // soft violet
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "sm": "0.5rem",
        "DEFAULT": "1rem",       // haptic default
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "3rem",            // large CTAs
        "pill": "9999px",
      },
      boxShadow: {
        "ambient": "0 20px 40px rgba(0,0,0,0.4)",
        "glow-primary": "0 0 32px rgba(182,160,255,0.2)",
        "glow-secondary": "0 0 32px rgba(0,217,184,0.2)",
        "glow-btn": "0 8px 24px rgba(126,81,255,0.3)",
      },
      animation: {
        "float-up": "floatUp 1.2s ease-out forwards",
        "shake": "shake 0.4s ease-in-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease-out forwards",
        "spring-in": "springIn 0.5s cubic-bezier(0.4,0,0.2,1.5) forwards",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-60px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-8px)" },
          "80%": { transform: "translateX(8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(182,160,255,0.2)" },
          "50%": { boxShadow: "0 0 32px rgba(182,160,255,0.5)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        springIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        "glass": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
