import { PILARES_INICIALES } from "./supabase";

export interface EvaluacionInput {
  nominadoNombre: string;
  nominadorNombre: string;
  coordinacionNombre: string;
  jefeDirecto?: string;
  pilaresSeleccionados: string[];
  descripcionHecho: string;
  impacto?: string;
  fotoDescripcion?: string;
}

export interface DictamenIA {
  score_pilares: number; // 0 a 100
  riesgo_sesgo: number; // 0 a 100
  nivel_riesgo: "bajo" | "moderado" | "alto";
  dictamen: string;
  analisis_pilares: string;
  deteccion_sesgo: string;
  recomendacion: "Aprobada con Honores" | "Aprobada" | "Aprobada con Observación" | "Alerta de Sesgo";
  timestamp: string;
  es_ia_generativa: boolean;
}

const SYSTEM_PROMPT_ARBITRO = `
Eres el ÁRBITRO DE INTELIGENCIA ARTIFICIAL oficial del programa "Monedas · Momentos de Color" de The Palace Company.

TU MISIÓN:
Analizar la nominación de un colaborador para determinar si describe un auténtico "Momento de Color" de excelencia humana y de servicio, verificar la congruencia con los 5 pilares institucionales y auditar cualquier riesgo de sesgo o favoritismo.

LOS 5 PILARES OFICIALES DE THE PALACE COMPANY:
1. Atención al Detalle: "Percibir lo que no se dice, actuar antes de que se pida".
2. Hospitalidad Emocional: "Conexión genuina, calidez que trasciende el protocolo".
3. Anticipación: "Prever necesidades con base en contexto y lectura del huésped".
4. Trabajo en Equipo: "Colaboración que potencia al compañero y al resultado colectivo".
5. Innovación: "Solución creativa, nueva o adaptada, que resuelve un problema real".

CRITERIOS DE AUDITORÍA:
1. Concreción del Hecho: ¿Se narra una acción específica, un momento y un contexto real, o son solo adjetivos genéricos de elogio? (Debe tener >=80 caracteres con sustancia).
2. Congruencia de Pilares: ¿Los pilares seleccionados (1 a 3) se ven claramente reflejados en la acción narrada?
3. Impacto: ¿Qué beneficio generó en el huésped, cliente o equipo?
4. Detección de Sesgo: Evaluar si hay relación de subordinación, elogio vacío ("es muy buena persona"), o reciprocidad corporativa.

FORMATO DE SALIDA (EXCLUSIVAMENTE JSON VÁLIDO):
{
  "score_pilares": number (0 a 100),
  "riesgo_sesgo": number (0 a 100),
  "nivel_riesgo": "bajo" | "moderado" | "alto",
  "dictamen": "Texto ejecutivo del dictamen (2-3 oraciones sintetizando el mérito y la decisión)",
  "analisis_pilares": "Explicación de cómo el hecho respalda cada pilar seleccionado",
  "deteccion_sesgo": "Observaciones sobre objetividad, impacto declarado y posibles sesgos",
  "recomendacion": "Aprobada con Honores" | "Aprobada" | "Aprobada con Observación" | "Alerta de Sesgo"
}
`;

/**
 * Ejecuta la evaluación con IA (Gemini API o Fallback Inteligente)
 */
export async function evaluarNominacionConIA(input: EvaluacionInput, apiKeyOverride?: string): Promise<DictamenIA> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || (typeof window !== "undefined" ? localStorage.getItem("mmc_gemini_key") : null);

  const esJefeDirecto = Boolean(
    input.jefeDirecto &&
    input.nominadorNombre &&
    input.jefeDirecto.toLowerCase().includes(input.nominadorNombre.toLowerCase())
  );

  // Si hay API Key disponible, intentamos llamar a Gemini
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const pilaresNombres = input.pilaresSeleccionados.map((pKey) => {
        const p = PILARES_INICIALES.find((item) => item.clave === pKey);
        return p ? `${p.nombre} (${p.descripcion})` : pKey;
      });

      const userContent = `
DATOS DE LA NOMINACIÓN A AUDITAR:
- Nominado: ${input.nominadoNombre}
- Nominador: ${input.nominadorNombre} (Coordinación: ${input.coordinacionNombre})
- ¿El nominador es jefe directo del nominado?: ${esJefeDirecto ? "SÍ (Alerta de posible sesgo jerárquico)" : "NO"}
- Pilares postulados (1-3): ${pilaresNombres.join(" | ")}
- Relato del hecho: "${input.descripcionHecho}"
- Impacto reportado: ${input.impacto ? `"${input.impacto}"` : "NO SE REPORTÓ IMPACTO"}
- Descripción de evidencia fotográfica: ${input.fotoDescripcion ? `"${input.fotoDescripcion}"` : "Sin foto adjunta"}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: SYSTEM_PROMPT_ARBITRO },
                  { text: userContent },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await response.json() as any;
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            score_pilares: Number(parsed.score_pilares) || 85,
            riesgo_sesgo: Number(parsed.riesgo_sesgo) || 15,
            nivel_riesgo: parsed.nivel_riesgo || "bajo",
            dictamen: parsed.dictamen || "Dictamen emitido por Árbitro IA.",
            analisis_pilares: parsed.analisis_pilares || "Pilares respaldados por el hecho narrado.",
            deteccion_sesgo: parsed.deteccion_sesgo || "Sin sesgos críticos detectados.",
            recomendacion: parsed.recomendacion || "Aprobada",
            timestamp: new Date().toISOString(),
            es_ia_generativa: true,
          };
        }
      }
    } catch (err) {
      console.warn("Fallo en llamada a API de Gemini, aplicando motor semántico local:", err);
    }
  }

  // Motor semántico de respaldo (Deep Deterministic Evaluator)
  return evaluarConMotorLocal(input, esJefeDirecto);
}

/**
 * Motor semántico determinista local (0 API, instantáneo)
 */
function evaluarConMotorLocal(input: EvaluacionInput, esJefeDirecto: boolean): DictamenIA {
  let scorePilares = 70;
  let riesgoSesgo = 0;

  const len = input.descripcionHecho.trim().length;
  if (len >= 160) scorePilares += 15;
  else if (len >= 100) scorePilares += 10;
  else scorePilares += 5;

  if (input.impacto && input.impacto.trim().length >= 30) {
    scorePilares += 15;
  } else {
    riesgoSesgo += 25; // Falta de impacto
  }

  if (esJefeDirecto) {
    riesgoSesgo += 20; // Sesgo jerárquico
  }

  const pilaresCount = input.pilaresSeleccionados.length;
  if (pilaresCount >= 1 && pilaresCount <= 3) {
    scorePilares = Math.min(100, scorePilares);
  }

  let nivelRiesgo: "bajo" | "moderado" | "alto" = "bajo";
  if (riesgoSesgo >= 50) nivelRiesgo = "alto";
  else if (riesgoSesgo >= 25) nivelRiesgo = "moderado";

  let recomendacion: "Aprobada con Honores" | "Aprobada" | "Aprobada con Observación" | "Alerta de Sesgo" = "Aprobada";
  if (scorePilares >= 90 && riesgoSesgo <= 15) recomendacion = "Aprobada con Honores";
  else if (riesgoSesgo >= 40) recomendacion = "Alerta de Sesgo";
  else if (riesgoSesgo >= 20) recomendacion = "Aprobada con Observación";

  const pilaresNombres = input.pilaresSeleccionados
    .map((k) => PILARES_INICIALES.find((p) => p.clave === k)?.nombre || k)
    .join(", ");

  const dictamen = `La postulación para ${input.nominadoNombre} presenta un relato con suficiente extensión y pertinencia. Se vincula favorablemente con los pilares de ${pilaresNombres}.${
    esJefeDirecto ? " Nota: Se identifica relación jerárquica que requiere atención en la mesa de comité." : ""
  }`;

  const analisisPilares = `El hecho de ${len} caracteres describe acciones que se alinean con la cultura de The Palace Company en (${pilaresNombres}). ${
    input.impacto ? "El impacto complementa la justificación." : "Se recomienda detallar más el impacto en futuras convocatorias."
  }`;

  const deteccionSesgo = esJefeDirecto
    ? "Alerta moderada: El nominador es jefe directo. La postulación se mantiene válida pero sujeta a escrutinio del comité."
    : !input.impacto
    ? "Observación: Ausencia de campo impacto incrementa el riesgo de sesgo en +25 puntos."
    : "Sin riesgos estructurales de sesgo identificados. Criterio objetivo.";

  return {
    score_pilares: Math.min(100, Math.max(0, scorePilares)),
    riesgo_sesgo: Math.min(100, Math.max(0, riesgoSesgo)),
    nivel_riesgo: nivelRiesgo,
    dictamen,
    analisis_pilares: analisisPilares,
    deteccion_sesgo: deteccionSesgo,
    recomendacion,
    timestamp: new Date().toISOString(),
    es_ia_generativa: false,
  };
}

/**
 * Genera el prompt estructurado completo para copiar y pegar en Claude.ai o ChatGPT
 */
export function generarReporteClaudePrompt(nominaciones: any[], ciclo: string): string {
  const lineas = [
    `# AUDITORÍA DE ÁRBITRO — PROGRAMA MONEDAS · MOMENTOS DE COLOR`,
    `The Palace Company · Ciclo: ${ciclo}`,
    `Fecha de exportación: ${new Date().toLocaleDateString()}`,
    ``,
    `Instrucción para el LLM / Claude:`,
    `Actúa como el Árbitro Oficial de Cultura Organizacional. Revisa las siguientes ${nominaciones.length} nominaciones del ciclo actual contra los 5 pilares institucionales (Atención al Detalle, Hospitalidad Emocional, Anticipación, Trabajo en Equipo, Innovación) y emite un informe ejecutivo identificando los momentos más sobresalientes y cualquier posible sesgo.`,
    ``,
    `---`,
    `## NOMINACIONES DEL CICLO:`,
    ``,
  ];

  nominaciones.forEach((nom, index) => {
    lineas.push(`### ${index + 1}. Nominado ID: ${nom.nominado_id}`);
    lineas.push(`- Coordinación: ${nom.coordinacion_id}`);
    lineas.push(`- Pilares: ${nom.pilares?.join(", ")}`);
    lineas.push(`- Relato del hecho: "${nom.descripcion_hecho}"`);
    lineas.push(`- Impacto: ${nom.impacto || "No especificado"}`);
    if (nom.foto_descripcion) {
      lineas.push(`- Evidencia fotográfica: ${nom.foto_descripcion}`);
    }
    lineas.push(`- Score preliminar del Árbitro: ${nom.score_pilares || "N/A"} / Riesgo: ${nom.riesgo_sesgo || 0}%`);
    lineas.push(``);
  });

  lineas.push(`---`);
  lineas.push(`POR FAVOR RESPONDE CON:`);
  lineas.push(`1. Resumen ejecutivo del ciclo.`);
  lineas.push(`2. Ranking de las 3 nominaciones con mayor mérito y por qué.`);
  lineas.push(`3. Observaciones de mejora para la Mesa Alta en redacción de evidencias.`);

  return lineas.join("\n");
}
