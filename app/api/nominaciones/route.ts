import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface D1Env { DB: D1Database }
interface NomBody {
  id?: string; convocatoria_id: string; nominado_id: string; nominador_id: string;
  coordinacion_id: string; pilares: string[]; descripcion_hecho: string; impacto?: string;
  foto_url?: string; foto_descripcion?: string; riesgo_sesgo?: number;
  score_pilares?: number; dictamen_ia?: string; estado?: string;
}

export async function GET(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const convId = new URL(req.url).searchParams.get("convocatoria_id") ?? "conv-2026-09";
  const { results } = await DB.prepare(
    "SELECT * FROM nominaciones WHERE convocatoria_id = ? ORDER BY created_at DESC"
  ).bind(convId).all();
  const data = results.map((r) => {
    const row = r as Record<string, unknown>;
    return { ...row, pilares: JSON.parse(row.pilares as string) };
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const body = await req.json() as NomBody;
  const id = body.id ?? `nom-${Date.now()}`;
  await DB.prepare(`
    INSERT INTO nominaciones
      (id, convocatoria_id, nominado_id, nominador_id, coordinacion_id, pilares,
       descripcion_hecho, impacto, foto_url, foto_descripcion, riesgo_sesgo,
       score_pilares, dictamen_ia, estado)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      pilares=excluded.pilares, descripcion_hecho=excluded.descripcion_hecho,
      impacto=excluded.impacto, estado=excluded.estado, updated_at=datetime('now')
  `).bind(
    id, body.convocatoria_id, body.nominado_id, body.nominador_id, body.coordinacion_id,
    JSON.stringify(body.pilares ?? []), body.descripcion_hecho, body.impacto ?? null,
    body.foto_url ?? null, body.foto_descripcion ?? null, body.riesgo_sesgo ?? 0,
    body.score_pilares ?? null, body.dictamen_ia ?? null, body.estado ?? "enviada"
  ).run();
  return NextResponse.json({ ok: true, id });
}
