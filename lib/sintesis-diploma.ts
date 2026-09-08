/**
 * Servicio de Síntesis Editorial de Diplomas para The Palace Company
 * Utiliza Gemini 2.5 Flash para condensar el relato del nominador respetando
 * estrictamente su voz, anécdota y calidez humana (220-260 caracteres para 3 líneas).
 */

const GEMINI_KEY_DEFAULT =
  typeof atob !== "undefined"
    ? atob("QVEuQWI4Uk42TFEwZUxEZTZWcE9VMDlnZzFVd2M3YWoydE9lMjVXVHp3Mkt5WnRDeUF1a2c=")
    : "";

export async function sintetizarHechoDiploma(
  nombreNominado: string,
  relatoOriginal: string,
  pilares: string[] = []
): Promise<string> {
  if (!relatoOriginal || relatoOriginal.trim().length === 0) {
    return "";
  }

  // Si el texto ya es breve y cabe en el layout, no requiere síntesis
  if (relatoOriginal.length <= 250) {
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
4. LONGITUD ESTRICTA: Entre 220 y 260 caracteres (incluyendo espacios).

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
      return recortarInteligente(relatoOriginal, 250);
    }

    const data = (await res.json()) as any;
    const textoGenerado = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (textoGenerado && textoGenerado.length > 50) {
      return textoGenerado.replace(/^["“'«]+|["”'»]+$/g, "").trim();
    }
  } catch (err) {
    console.error("Error al sintetizar diploma con Gemini:", err);
  }

  return recortarInteligente(relatoOriginal, 250);
}

/**
 * Fallback determinista en caso de desconexión o fallo de red
 */
function recortarInteligente(texto: string, maxChars = 250): string {
  if (texto.length <= maxChars) return texto;
  const recortado = texto.slice(0, maxChars);
  const ultimoPunto = Math.max(recortado.lastIndexOf("."), recortado.lastIndexOf(","), recortado.lastIndexOf(" "));
  if (ultimoPunto > 160) {
    return recortado.slice(0, ultimoPunto).trim() + "...";
  }
  return recortado.trim() + "...";
}
