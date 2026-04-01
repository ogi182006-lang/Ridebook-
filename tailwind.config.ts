import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Baloo 2'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff8ed",
          100: "#ffefd3",
          200: "#ffdba5",
          300: "#ffc16d",
          400: "#ff9d32",
          500: "#ff7f0a",
          600: "#f06200",
          700: "#c74a02",
          800: "#9e3a0b",
          900: "#7f320c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
