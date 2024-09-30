import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
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
        "xs": "500px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1536px"
      },
      colors: {
        "bg": "rgb(var(--bg-color))",
        "canvas": "rgb(var(--canvas-color))",
        "accent": "rgb(var(--accent-color))",
        "iconTabBG": "rgb(var(--icon-tab-bg))",
        "activeTab": "rgb(var(--active-tab-color))",
        "activeTabBG": "rgb(var(--active-tab-bg))",
        "mutedFG": "rgb(var(--muted-foreground-color))",
        "fg": "rgb(var(--foreground-color))",
        "outline1": "rgb(var(--outline-1))",
      }
    },
  },
  plugins: [],
} satisfies Config;
