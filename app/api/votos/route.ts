import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface D1Env { DB: D1Database }
interface VotoItem { integrante_id: string; nominacion_id: string; puntos: number }
interface VotosBody { convocatoria_id?: string; votos: VotoItem[] }

export async function GET(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const convId = new URL(req.url).searchParams.get("convocatoria_id") ?? "conv-2026-09";
  const { results } = await DB.prepare(
    "SELECT * FROM comite_votos WHERE convocatoria_id = ?"
  ).bind(convId).all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const body = await req.json() as VotosBody;
  const votos = body.votos ?? [];
  const convId = body.convocatoria_id ?? "conv-2026-09";
  if (votos.length > 0) {
    await DB.prepare(
      "DELETE FROM comite_votos WHERE convocatoria_id = ? AND integrante_id = ?"
    ).bind(convId, votos[0].integrante_id).run();
  }
  for (const v of votos) {
    const id = `voto-${convId}-${v.integrante_id}-${v.nominacion_id}`;
    await DB.prepare(
      "INSERT OR REPLACE INTO comite_votos (id, convocatoria_id, integrante_id, nominacion_id, puntos) VALUES (?,?,?,?,?)"
    ).bind(id, convId, v.integrante_id, v.nominacion_id, v.puntos).run();
  }
  return NextResponse.json({ ok: true, count: votos.length });
}
