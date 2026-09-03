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
      "SELECT * FROM inhabilitaciones WHERE convocatoria_id = ?"
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
    const id = body.id || `inhab-${Date.now()}`;
    await env.DB.prepare(`
      INSERT INTO inhabilitaciones (id, convocatoria_id, integrante_id, motivo, suplente_id, designado_por)
      VALUES (?,?,?,?,?,?)
      ON CONFLICT(convocatoria_id, integrante_id) DO UPDATE SET
        motivo=excluded.motivo, suplente_id=excluded.suplente_id
    `).bind(
      id,
      body.convocatoria_id,
      body.integrante_id,
      body.motivo,
      body.suplente_id || null,
      body.designado_por
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
