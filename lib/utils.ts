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
      return "bg-[#E8903A] text-slate-950 font-semibold";
    case "hospitalidad_emocional":
      return "bg-[#E8584A] text-white font-semibold";
    case "anticipacion":
      return "bg-[#2A7D6F] text-white font-semibold";
    case "trabajo_equipo":
      return "bg-[#4A8BB5] text-white font-semibold";
    case "innovacion":
      return "bg-[#7B6FA0] text-white font-semibold";
    default:
      return "bg-slate-600 text-white font-semibold";
  }
}
