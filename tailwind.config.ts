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
        brand: {
          olive: "#183B0B", // Deep Olive
          green: "#2F6515", // Forest Green
          cream: "#F7F2E8", // Warm Cream
          sand: "#E9DDC7",  // Soft Sand
          gold: "#C6A15B",  // Muted Gold
          dark: "#20251D",  // Charcoal
          white: "#FFFFFF", // Pure White
          // Keeping old variable names but pointing them to new colors to avoid breaking existing classes during transition
          DEFAULT: "#2F6515",
          lime: "#C6A15B",
        },
        cream: {
          DEFAULT: "#F7F2E8",
          warm: "#E9DDC7",
        },
        olive: {
          DEFAULT: "#68705F",
          dark: "#183B0B",
          light: "#E9DDC7",
        },
        border: "#E9DDC7",
        success: "#2F6515",
        error: "#A62626",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(90deg, rgba(24,59,11,0.94), rgba(47,101,21,0.72), rgba(47,101,21,0.18))",
        "card-gradient":
          "linear-gradient(to top, rgba(24,59,11,0.85) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(24,59,11,0.08)",
        "card-hover": "0 8px 32px rgba(24,59,11,0.16)",
        gold: "0 4px 20px rgba(198,161,91,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
