export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "Base de datos D1 no disponible" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const convId = new URL(request.url).searchParams.get("convocatoria_id") || "conv-2026-09";
    const { results } = await env.DB.prepare(
      "SELECT * FROM nominaciones WHERE convocatoria_id = ? ORDER BY created_at DESC"
    ).bind(convId).all();

    const data = (results || []).map((r) => {
      let pilares = [];
      try {
        pilares = typeof r.pilares === "string" ? JSON.parse(r.pilares) : (r.pilares || []);
      } catch {
        pilares = [];
      }
      return { ...r, pilares };
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "Base de datos D1 no disponible" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const body = await request.json();
    const id = body.id || `nom-${Date.now()}`;
    await env.DB.prepare(`
      INSERT INTO nominaciones
        (id, convocatoria_id, nominado_id, nominador_id, coordinacion_id, pilares,
         descripcion_hecho, impacto, foto_url, foto_descripcion, riesgo_sesgo,
         score_pilares, dictamen_ia, estado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        pilares=excluded.pilares, descripcion_hecho=excluded.descripcion_hecho,
        impacto=excluded.impacto, estado=excluded.estado, updated_at=datetime('now')
    `).bind(
      id,
      body.convocatoria_id,
      body.nominado_id,
      body.nominador_id,
      body.coordinacion_id,
      JSON.stringify(body.pilares || []),
      body.descripcion_hecho,
      body.impacto || null,
      body.foto_url || null,
      body.foto_descripcion || null,
      body.riesgo_sesgo || 0,
      body.score_pilares || null,
      body.dictamen_ia || null,
      body.estado || "aceptada"
    ).run();

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
