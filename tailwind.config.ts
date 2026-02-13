import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "conic-gradient": "conic-gradient(var(--tw-gradient-stops))",
        "auth-bg-mobile": "url('/images/onboarding-bg-mobile.png')",
        "auth-bg-desktop": "url('/images/onboarding-bg-desktop.png')",
        "eye-visible": "url('')",
        "eye-hidden": "url('')",
      },
      backgroundSize: {
        full: "300%, 300%",
      },
      scale: {
        "1.5x": "1.5",
        "1.8x": "1.8",
        "2x": "2",
        "2.5x": "2.5",
        "3x": "3",
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      screens: {
        xs: "500px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        bg: "rgb(var(--bg-color))",
        canvas: "rgb(var(--canvas-color))",
        iconTabBG: "rgb(var(--icon-tab-bg))",
        activeTab: "rgb(var(--active-tab-color))",
        secondaryText: "rgb(var(--secondary-text-color))",
        activeTabBG: "rgb(var(--active-tab-bg))",
        mutedFG: "rgb(var(--muted-foreground-color))",
        fg: "rgb(var(--foreground-color))",
        outline1: "rgb(var(--outline-1))",
        outline1d: "rgb(var(--outline-1d))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-color))",
          foreground: "rgb(var(--accent-foreground))",
        },
        accentLight: {
          DEFAULT: "rgb(var(--accent-color-light))",
          foreground: "rgb(var(--accent-foreground))",
        },
        accentBright: {
          DEFAULT: "rgb(var(--accent-color-bright))",
          foreground: "rgb(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
