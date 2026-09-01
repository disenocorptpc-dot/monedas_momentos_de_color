import { NextRequest, NextResponse } from "next/server";
import { EvaluacionInput, evaluarNominacionConIA } from "@/lib/arbitro-ia";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { input: EvaluacionInput; apiKey?: string };

    if (!body?.input?.descripcionHecho) {
      return NextResponse.json(
        { error: "La descripción del hecho es requerida" },
        { status: 400 }
      );
    }

    const dictamen = await evaluarNominacionConIA(body.input, body.apiKey);
    return NextResponse.json(dictamen);
  } catch (error: any) {
    console.error("Error en API de Árbitro IA:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno evaluando con Árbitro IA" },
      { status: 500 }
    );
  }
}
