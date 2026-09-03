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
      "SELECT * FROM comite_votos WHERE convocatoria_id = ?"
    ).bind(convId).all();

    return new Response(JSON.stringify(results || []), {
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
    const votos = body.votos || [];
    const convId = body.convocatoria_id || "conv-2026-09";

    if (votos.length > 0) {
      await env.DB.prepare(
        "DELETE FROM comite_votos WHERE convocatoria_id = ? AND integrante_id = ?"
      ).bind(convId, votos[0].integrante_id).run();
    }

    for (const v of votos) {
      const id = `voto-${convId}-${v.integrante_id}-${v.nominacion_id}`;
      await env.DB.prepare(
        "INSERT OR REPLACE INTO comite_votos (id, convocatoria_id, integrante_id, nominacion_id, puntos) VALUES (?,?,?,?,?)"
      ).bind(id, convId, v.integrante_id, v.nominacion_id, v.puntos).run();
    }

    return new Response(JSON.stringify({ ok: true, count: votos.length }), {
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
