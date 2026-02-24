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
        accent: {
          50: "#f0f0ff",
          100: "#e0e0ff",
          200: "#c4c4ff",
          300: "#9e9eff",
          400: "#7c6cff",
          500: "#6d4aff",
          600: "#5e30f5",
          700: "#5022d8",
          800: "#421cb5",
          900: "#371994",
          950: "#200e64",
        },
      },
    },
  },
  plugins: [],
};

export default config;
