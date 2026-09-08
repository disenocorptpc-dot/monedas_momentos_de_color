import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-display)", // Freight Text
          "Iowan Old Style",
          "Palatino Linotype",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pilar: {
          detalle: "#E8903A",
          hospitalidad: "#E8584A",
          anticipacion: "#2A7D6F",
          equipo: "#4A8BB5",
          innovacion: "#7B6FA0",
        },
        palace: {
          oceano: "#254D6E",
          bronce: "#B88F69",
          azulLigero: "#E0E5E5",
          perla: "#EDECE4",
        }
      },
    },
  },
  plugins: [],
};
export default config;
