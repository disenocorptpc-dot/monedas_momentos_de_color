export async function onRequestPost({ request }) {
  return new Response(JSON.stringify({
    score_pilares: 85,
    riesgo_sesgo: 10,
    nivel_riesgo: "bajo",
    dictamen: "Nominación válida y congruente con los pilares del programa.",
    recomendacion: "Aprobada",
    timestamp: new Date().toISOString(),
    es_ia_generativa: false
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
