import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";

export const runtime = "edge";

interface NomBody {
  id?: string;
  convocatoria_id: string;
  nominado_id: string;
  nominador_id: string;
  coordinacion_id: string;
  pilares: string[];
  descripcion_hecho: string;
  impacto?: string;
  foto_url?: string;
  foto_descripcion?: string;
  riesgo_sesgo?: number;
  score_pilares?: number;
  dictamen_ia?: string;
  estado?: string;
}

export async function GET(req: NextRequest) {
  try {
    const DB = getD1();
    if (!DB) {
      return NextResponse.json({ error: "Base de datos D1 no disponible" }, { status: 503 });
    }
    const convId = new URL(req.url).searchParams.get("convocatoria_id") ?? "conv-2026-09";
    const { results } = await DB.prepare(
      "SELECT * FROM nominaciones WHERE convocatoria_id = ? ORDER BY created_at DESC"
    ).bind(convId).all();

    const data = (results || []).map((r) => {
      const row = r as Record<string, unknown>;
      let pilaresParsed: string[] = [];
      try {
        pilaresParsed = typeof row.pilares === "string" ? JSON.parse(row.pilares) : ((row.pilares as string[]) ?? []);
      } catch {
        pilaresParsed = [];
      }
      return { ...row, pilares: pilaresParsed };
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const DB = getD1();
    if (!DB) {
      return NextResponse.json({ error: "Base de datos D1 no disponible" }, { status: 503 });
    }
    const body = (await req.json()) as NomBody;
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
      id,
      body.convocatoria_id,
      body.nominado_id,
      body.nominador_id,
      body.coordinacion_id,
      JSON.stringify(body.pilares ?? []),
      body.descripcion_hecho,
      body.impacto ?? null,
      body.foto_url ?? null,
      body.foto_descripcion ?? null,
      body.riesgo_sesgo ?? 0,
      body.score_pilares ?? null,
      body.dictamen_ia ?? null,
      body.estado ?? "aceptada"
    ).run();

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
