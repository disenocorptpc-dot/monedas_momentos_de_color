import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPilarColor(clave: string): string {
  switch (clave) {
    case "atencion_detalle":
      return "border-[#E8903A] text-[#E8903A] bg-[#E8903A]/10";
    case "hospitalidad_emocional":
      return "border-[#E8584A] text-[#E8584A] bg-[#E8584A]/10";
    case "anticipacion":
      return "border-[#2A7D6F] text-[#2A7D6F] bg-[#2A7D6F]/10";
    case "trabajo_equipo":
      return "border-[#4A8BB5] text-[#4A8BB5] bg-[#4A8BB5]/10";
    case "innovacion":
      return "border-[#7B6FA0] text-[#7B6FA0] bg-[#7B6FA0]/10";
    default:
      return "border-slate-500 text-slate-300 bg-slate-500/10";
  }
}

export function formatPilarBadgeColor(clave: string): string {
  switch (clave) {
    case "atencion_detalle":
      return "bg-[#E8903A] text-white font-semibold shadow-sm";
    case "hospitalidad_emocional":
      return "bg-[#E8584A] text-white font-semibold shadow-sm";
    case "anticipacion":
      return "bg-[#2A7D6F] text-white font-semibold shadow-sm";
    case "trabajo_equipo":
      return "bg-[#4A8BB5] text-white font-semibold shadow-sm";
    case "innovacion":
      return "bg-[#7B6FA0] text-white font-semibold shadow-sm";
    default:
      return "bg-slate-600 text-white font-semibold shadow-sm";
  }
}

export interface PilarTheme {
  clave: string;
  color: string;
  border: string;
  bgSubtle: string;
  text: string;
  badge: string;
}

export function getPilarTheme(clave: string): PilarTheme {
  switch (clave) {
    case "atencion_detalle":
      return {
        clave,
        color: "#E8903A",
        border: "border-[#E8903A]",
        bgSubtle: "bg-[#E8903A]/10",
        text: "text-[#E8903A]",
        badge: "bg-[#E8903A] text-white font-semibold shadow-sm",
      };
    case "hospitalidad_emocional":
      return {
        clave,
        color: "#E8584A",
        border: "border-[#E8584A]",
        bgSubtle: "bg-[#E8584A]/10",
        text: "text-[#E8584A]",
        badge: "bg-[#E8584A] text-white font-semibold shadow-sm",
      };
    case "anticipacion":
      return {
        clave,
        color: "#2A7D6F",
        border: "border-[#2A7D6F]",
        bgSubtle: "bg-[#2A7D6F]/10",
        text: "text-[#2A7D6F]",
        badge: "bg-[#2A7D6F] text-white font-semibold shadow-sm",
      };
    case "trabajo_equipo":
      return {
        clave,
        color: "#4A8BB5",
        border: "border-[#4A8BB5]",
        bgSubtle: "bg-[#4A8BB5]/10",
        text: "text-[#4A8BB5]",
        badge: "bg-[#4A8BB5] text-white font-semibold shadow-sm",
      };
    case "innovacion":
      return {
        clave,
        color: "#7B6FA0",
        border: "border-[#7B6FA0]",
        bgSubtle: "bg-[#7B6FA0]/10",
        text: "text-[#7B6FA0]",
        badge: "bg-[#7B6FA0] text-white font-semibold shadow-sm",
      };
    default:
      return {
        clave,
        color: "#64748B",
        border: "border-slate-400",
        bgSubtle: "bg-slate-100",
        text: "text-slate-700",
        badge: "bg-slate-600 text-white font-semibold shadow-sm",
      };
  }
}

