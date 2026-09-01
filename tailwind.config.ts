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
          gold: "#D4AF37",
          dark: "#0F172A",
          card: "#1E293B",
          border: "#334155",
          accent: "#38BDF8",
        }
      },
    },
  },
  plugins: [],
};
export default config;
