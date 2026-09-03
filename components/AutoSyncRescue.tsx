"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/local-store";
import { Nominacion } from "@/lib/supabase";
import { Sparkles, X } from "lucide-react";

export function AutoSyncRescue() {
  const [sincronizados, setSincronizados] = useState<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function sincronizarDatosLocales() {
      if (typeof window === "undefined") return;

      try {
        // 1. Obtener nominaciones locales
        const rawNom = localStorage.getItem(STORAGE_KEYS.NOMINACIONES);
        if (!rawNom) return;

        let nominacionesLocales: Nominacion[] = [];
        try {
          nominacionesLocales = JSON.parse(rawNom);
        } catch {
          return;
        }

        if (!Array.isArray(nominacionesLocales) || nominacionesLocales.length === 0) {
          return;
        }

        // 2. Consultar qué nominaciones ya existen en el servidor
        const res = await fetch("/api/nominaciones", { cache: "no-store" });
        if (!res.ok) return;

        const serverNominaciones: Nominacion[] = await res.json();
        const serverIds = new Set(
          (serverNominaciones || []).map((n) => n.id)
        );

        // 3. Filtrar las que faltan en el servidor
        const pendientes = nominacionesLocales.filter(
          (n) => n && n.id && !serverIds.has(n.id)
        );

        if (pendientes.length === 0) return;

        // 4. Subir las nominaciones pendientes a la nube
        let contador = 0;
        for (const nom of pendientes) {
          const postRes = await fetch("/api/nominaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nom),
          });

          if (postRes.ok) {
            contador++;
          }
        }

        if (contador > 0) {
          setSincronizados(contador);
          setVisible(true);

          // Ocultar automáticamente a los 7 segundos
          setTimeout(() => {
            setVisible(false);
          }, 7000);
        }
      } catch (err) {
        console.warn("AutoSync: Error en la sincronización silenciosa:", err);
      }
    }

    sincronizarDatosLocales();
  }, []);

  if (!visible || sincronizados === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 text-xs">
          <p className="font-semibold text-emerald-900">
            Sincronización en la nube completada
          </p>
          <p className="mt-0.5 text-emerald-700">
            Se han respaldado exitosamente {sincronizados} {sincronizados === 1 ? "postulación" : "postulaciones"} en el sistema central.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-emerald-500 hover:text-emerald-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
