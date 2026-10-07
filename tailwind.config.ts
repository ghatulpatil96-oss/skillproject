import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Nomu-inspired system: warm cream page, blue-black ink, one loud coral
        accent: "#FF8A5E", // coral — CTAs, links, active states (lightened per feedback)
        "accent-dark": "#FF7448", // coral hover (original Nomu coral)
        gold: "#FFB020", // warm amber — highlights, warning chips
        verify: "#2F7D4F", // success green (tests, progress)
        ink: "#0F151D", // near-black, slightly blue
        "ink-2": "#4A5563", // secondary text
        "ink-3": "#7A8494", // muted text
        canvas: "#FFFFFF", // white panels
        list: "#FFF3EC", // soft peach rows/tints
        page: "#FFF9F6", // warm cream background
        tile: "#F8EFE9", // peachy hover tile
        line: "#F0E2D9", // warm peach hairline
        charcoal: "#0F151D", // code blocks / dark bands
      },
      boxShadow: {
        // flat hairline-first shadows with a soft lift on hover
        card: "0 1px 2px rgba(15,21,29,0.05)",
        "card-lift": "0 12px 32px -12px rgba(15,21,29,0.18)",
        canvas: "0 24px 64px rgba(15,21,29,0.18)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Segoe UI", "sans-serif"],
        display: ["var(--font-sans)", "Inter", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
