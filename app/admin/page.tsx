"use client";

import Link from "next/link";
import { Award, ShieldAlert, BarChart3, ArrowLeft } from "lucide-react";
import { CONVOCATORIA_ACTUAL } from "@/lib/supabase";

const modulos = [
  {
    href: "/dashboard-mesa-alta",
    label: "Cuotas & Estado",
    desc: "Seguimiento de cuotas por coordinación y lista de postulaciones del ciclo.",
    icon: Award,
    color: "#4A8BB5",
  },
  {
    href: "/inhabilitaciones",
    label: "Comité & Comodines",
    desc: "Inhabilitaciones por conflicto de interés, comodines sustitutos y monitor de quórum.",
    icon: ShieldAlert,
    color: "#E8584A",
  },
  {
    href: "/resultados",
    label: "Cómputo & Resultados",
    desc: "Tabla de puntajes Borda, anuncio del ganador y exportador de reporte para revisión con IA.",
    icon: BarChart3,
    color: "#7B6FA0",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10 px-4">
      <div className="space-y-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-sm text-slate-500">
          {CONVOCATORIA_ACTUAL.ciclo} · Módulos de gestión interna del ciclo
        </p>
      </div>

      <div className="space-y-3">
        {modulos.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                style={{ color: m.color, backgroundColor: `${m.color}15`, borderColor: `${m.color}30` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                  {m.label}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-300">
        Este panel no es visible en la navegación principal. Acceso solo para coordinación del programa.
      </p>
    </div>
  );
}
