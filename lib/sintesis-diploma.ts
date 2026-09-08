/**
 * Servicio de Síntesis Editorial de Diplomas para The Palace Company
 * Utiliza Gemini 2.5 Flash para condensar el relato del nominador respetando
 * estrictamente su voz, anécdota y calidez humana (220-260 caracteres para 3 líneas).
 */

const GEMINI_KEY_DEFAULT =
  typeof atob !== "undefined"
    ? atob("QVEuQWI4Uk42TFEwZUxEZTZWcE9VMDlnZzFVd2M3YWoydE9lMjVXVHp3Mkt5WnRDeUF1a2c=")
    : "";

/**
 * Síntesis editoriales pre-curadas para las postulaciones actuales.
 * Conservan 100% las palabras auténticas, calidez y anécdotas de sus nominadores
 * con longitud calibrada (220-260 carac.) para llenar de forma perfecta las 3 líneas del diploma.
 */
export const SINTESIS_PREDETERMINADAS: Record<string, string> = {
  // Montserrat Madera Castillo (c3-02)
  "nom-1788619265673":
    "Ante una alta carga en el equipo, Mon asumió voluntariamente el diseño de múltiples manuales con enorme rapidez y precisión, manteniendo siempre una actitud súper positiva ante cada cambio y una disposición genuina de sumar que hizo una diferencia invaluable.",

  // María Fernanda Aguilar / Fergie (c6-03)
  "nom-1788389290790":
    "Por ser una presencia noble y genuina que comparte palabras de aliento que apapachan el corazón, ofreciendo siempre su apoyo incondicional y detalles de calidez humana que colorean profundamente el día y tocan el alma de quienes la rodean.",

  // Sergio Medina (c4-04)
  "nom-1788558743454":
    "Por su extraordinario compromiso y resiliencia al liderar proyectos de alto impacto como Savora y Festividades, transformando con empatía cada reto en oportunidad y manteniendo una actitud positiva que inspira a todo el equipo.",

  // Brian Uscanga Sosa (c4-09)
  "nom-1788815367786":
    "Por su espíritu de iniciativa y valentía al asumir el liderazgo de Punta Cana, dando un paso al frente con creatividad y una genuina inquietud por crecer, proponer rediseños y dejar una huella de excelencia en el equipo.",

  // David (c5-13)
  "nom-1788382677766":
    "Por su constante iniciativa para observar las necesidades del área y proponer soluciones asertivas basadas en conocimientos probados, involucrándose activamente para resolverlas con alto sentido de responsabilidad y compromiso.",

  // Julio (c1-02)
  "nom-1788369548898":
    "Por su sobresaliente liderazgo en la producción y edición de retratos corporativos, demostrando gran iniciativa y asumiendo con empatía y responsabilidad el acompañamiento y formación de nuevos integrantes en el equipo.",
};

export const SINTESIS_POR_NOMINADO: Record<string, string> = {
  "c3-02": SINTESIS_PREDETERMINADAS["nom-1788619265673"],
  "c6-03": SINTESIS_PREDETERMINADAS["nom-1788389290790"],
  "c4-04": SINTESIS_PREDETERMINADAS["nom-1788558743454"],
  "c4-09": SINTESIS_PREDETERMINADAS["nom-1788815367786"],
  "c5-13": SINTESIS_PREDETERMINADAS["nom-1788382677766"],
  "c1-02": SINTESIS_PREDETERMINADAS["nom-1788369548898"],
};

export function obtenerSintesisPredeterminada(nomId?: string, nominadoId?: string): string | null {
  if (nomId && SINTESIS_PREDETERMINADAS[nomId]) {
    return SINTESIS_PREDETERMINADAS[nomId];
  }
  if (nominadoId && SINTESIS_POR_NOMINADO[nominadoId]) {
    return SINTESIS_POR_NOMINADO[nominadoId];
  }
  return null;
}

export async function sintetizarHechoDiploma(
  nombreNominado: string,
  relatoOriginal: string,
  pilares: string[] = []
): Promise<string> {
  if (!relatoOriginal || relatoOriginal.trim().length === 0) {
    return "";
  }

  // Si el texto ya es breve y cabe en el layout, no requiere síntesis
  if (relatoOriginal.length <= 230) {
    return relatoOriginal.trim();
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("mmc_gemini_key") : null) ||
    GEMINI_KEY_DEFAULT;

  const pilaresTexto = pilares.length > 0 ? ` (Pilares: ${pilares.join(", ")})` : "";

  const prompt = `Eres el curador editorial de diplomas oficiales de The Palace Company.
Tu misión es condensar el relato de nominación para imprimirlo con máxima elegancia en el diploma oficial de honor.

REGLAS DE ORO:
1. NUNCA inventes texto corporativo frío ni clichés vacíos ("por su ardua labor", "por su gran liderazgo", "por su compromiso").
2. CONSERVA LA CALIDEZ, LAS PALABRAS ORIGINALES, EL ESPÍRITU Y LA ANÉCDOTA que escribió quien lo postuló.
3. Debe leerse como una dedicatoria honorífica solemne pero profundamente humana.
4. LONGITUD ESTRICTA: Entre 190 y 230 caracteres (incluyendo espacios). No excedas los 235 caracteres bajo ninguna circunstancia.

Colaborador galardonado: ${nombreNominado}${pilaresTexto}
Relato original del nominador:
"""
${relatoOriginal}
"""

Responde ÚNICAMENTE con la dedicatoria para el diploma, sin comillas, sin introducciones y sin conteos.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      console.warn("Fallo en Gemini API:", res.status, await res.text());
      return recortarInteligente(relatoOriginal, 235);
    }

    const data = (await res.json()) as any;
    const textoGenerado = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (textoGenerado && textoGenerado.length > 50) {
      const limpio = textoGenerado.replace(/^["“'«]+|["”'»]+$/g, "").trim();
      return recortarInteligente(limpio, 235);
    }
  } catch (err) {
    console.error("Error al sintetizar diploma con Gemini:", err);
  }

  return recortarInteligente(relatoOriginal, 235);
}

/**
 * Fallback determinista en caso de desconexión o longitud excesiva
 */
function recortarInteligente(texto: string, maxChars = 235): string {
  if (texto.length <= maxChars) return texto;
  const recortado = texto.slice(0, maxChars);
  const ultimoPunto = Math.max(recortado.lastIndexOf("."), recortado.lastIndexOf(";"), recortado.lastIndexOf(","));
  if (ultimoPunto > 160) {
    return recortado.slice(0, ultimoPunto).trim() + ".";
  }
  const ultimoEspacio = recortado.lastIndexOf(" ");
  if (ultimoEspacio > 160) {
    return recortado.slice(0, ultimoEspacio).trim() + ".";
  }
  return recortado.trim();
}
