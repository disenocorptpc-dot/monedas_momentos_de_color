import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface D1Env { DB: D1Database }
interface InhabBody {
  id?: string; convocatoria_id: string; integrante_id: string;
  motivo: string; suplente_id?: string; designado_por: string;
}

export async function GET(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const convId = new URL(req.url).searchParams.get("convocatoria_id") ?? "conv-2026-09";
  const { results } = await DB.prepare(
    "SELECT * FROM inhabilitaciones WHERE convocatoria_id = ?"
  ).bind(convId).all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const DB = (globalThis as unknown as D1Env).DB;
  if (!DB) return NextResponse.json({ error: "D1 no disponible" }, { status: 503 });
  const body = await req.json() as InhabBody;
  const id = body.id ?? `inhab-${Date.now()}`;
  await DB.prepare(`
    INSERT INTO inhabilitaciones (id, convocatoria_id, integrante_id, motivo, suplente_id, designado_por)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(convocatoria_id, integrante_id) DO UPDATE SET
      motivo=excluded.motivo, suplente_id=excluded.suplente_id
  `).bind(
    id, body.convocatoria_id, body.integrante_id,
    body.motivo, body.suplente_id ?? null, body.designado_por
  ).run();
  return NextResponse.json({ ok: true, id });
}
