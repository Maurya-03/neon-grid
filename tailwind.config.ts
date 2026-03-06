import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy shadcn tokens (mapped to our design system)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Tron-inspired neon color system
        neon: {
          cyan: "#00FFFF",     // Electric Cyan - Primary
          violet: "#8A2BE2",   // Deep Violet - Secondary  
          gold: "#FFD700",     // Neon Gold - Highlights
          red: "#FF3131",      // Neon Red - Warnings/Alerts
          blue: "#00BFFF",     // Keep existing blue
          magenta: "#FF00FF",  // Keep existing magenta
          green: "#00FF00",    // Keep existing green
        },
        bg: {
          DEFAULT: "#000000",  // True black
          dark: "#040404",     // Near-black gradient start
          darker: "#0a0a0a",   // Near-black gradient end
          800: "#1a1a1a",     // Slightly lighter for cards
          700: "#2a2a2a",     // Even lighter for borders
        },
        glass: {
          DEFAULT: "hsl(var(--glass))",
          strong: "hsl(var(--glass-strong))",
        },
        text: {
          primary: "#E0E0E0",     // Bright text
          secondary: "#B0B0B0",   // Secondary text  
          tertiary: "#808080",    // Dim text
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        exo: ['Exo 2', 'Nunito Sans', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)', 
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
      },
      boxShadow: {
        'glow-cyan': '0 0 6px #00FFFF, 0 0 12px #00FFFF',
        'glow-violet': '0 0 6px #8A2BE2, 0 0 12px #8A2BE2', 
        'glow-gold': '0 0 6px #FFD700, 0 0 12px #FFD700',
        'glow-red': '0 0 6px #FF3131, 0 0 12px #FF3131',
        'inner-glow-cyan': 'inset 0 0 6px #00FFFF',
        'glass': '0 8px 32px rgba(0, 255, 255, 0.1)',
      },
      textShadow: {
        'glow-cyan': '0 0 8px #00FFFF',
        'glow-violet': '0 0 8px #8A2BE2',
        'glow-gold': '0 0 8px #FFD700',
        'glow-red': '0 0 8px #FF3131',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 6px currentColor, 0 0 12px currentColor",
            textShadow: "0 0 8px currentColor" 
          },
          "50%": { 
            boxShadow: "0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor",
            textShadow: "0 0 12px currentColor" 
          },
        },
        "grid-drift": {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-40px, -40px)" },
        },
        "fade-in-glow": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-flicker": "neon-flicker 0.3s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "grid-drift": "grid-drift 60s linear infinite",
        "fade-in-glow": "fade-in-glow 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-shadow-glow-cyan': {
          textShadow: '0 0 8px #00FFFF',
        },
        '.text-shadow-glow-violet': {
          textShadow: '0 0 8px #8A2BE2',
        },
        '.text-shadow-glow-gold': {
          textShadow: '0 0 8px #FFD700',
        },
        '.text-shadow-glow-red': {
          textShadow: '0 0 8px #FF3131',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config;
