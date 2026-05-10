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
        paper: "#F4EBD9",
        "paper-deep": "#E8DCC0",
        bone: "#EDE3CE",
        ink: "#1A1A1A",
        "ink-soft": "#3A3A3A",
        forest: "#2D3A2E",
        "forest-deep": "#1F2A20",
        moss: "#5A6B4F",
        rust: "#B85C2E",
        "rust-deep": "#8B3F1F",
        pumpkin: "#D87A3F",
        plum: "#4A2942",
        mist: "#A8AC9F",
      },
      fontFamily: {
        display: ["var(--font-trench-slab)", "serif"],
        body: ["var(--font-alpino)", "sans-serif"],
        mono: ["var(--font-alpino)", "sans-serif"],
        telma: ["var(--font-telma)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
