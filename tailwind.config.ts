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
        primary: {
          DEFAULT: "#6C5CE7",
          50: "#F0EEFF",
          100: "#DDD8FD",
          200: "#B8AEFB",
          300: "#9485F9",
          400: "#7F6EF3",
          500: "#6C5CE7",
          600: "#5A48D5",
          700: "#4835B3",
          800: "#372891",
          900: "#261B6F",
        },
        secondary: {
          DEFAULT: "#0984E3",
          50: "#E8F4FD",
          100: "#BEE1F9",
          200: "#7DC2F3",
          300: "#3CA4ED",
          400: "#0984E3",
          500: "#076EBF",
          600: "#05579B",
          700: "#044077",
          800: "#022953",
          900: "#01132F",
        },
        success: "#00B894",
        danger: "#D63031",
        warning: "#FDCB6E",
        dark: {
          DEFAULT: "#1A0D3D",
          50: "#2D1B69",
          100: "#251559",
          200: "#1E1049",
          300: "#1A0D3D",
          400: "#150A32",
          500: "#100727",
        },
        surface: "#2D1B69",
        "answer-blue": "#0984E3",
        "answer-teal": "#00B894",
        "answer-orange": "#E17055",
        "answer-purple": "#A29BFE",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        answer: "12px",
        btn: "8px",
        pill: "999px",
      },
      animation: {
        "float-up": "floatUp 1.2s ease-out forwards",
        "shake": "shake 0.4s ease-in-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "confetti": "confetti 0.6s ease-out",
        "count-up": "countUp 2s ease-out",
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
          "0%, 100%": { boxShadow: "0 0 5px rgba(108, 92, 231, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(108, 92, 231, 0.6)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(180deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
