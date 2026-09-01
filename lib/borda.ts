import {
  Colaborador,
  ComiteInhabilitacion,
  ComiteIntegrante,
  ComiteVoto,
  Nominacion,
  Pilar,
} from "./supabase";

export interface ResultadoNominacion {
  nominacion: Nominacion;
  colaborador?: Colaborador;
  puntosTotales: number;
  votosDetalle: {
    integranteId: string;
    votoPor: string;
    puntos: 1 | 2 | 3;
  }[];
  posicion?: number;
}

export interface ComputoCiclo {
  quorumMinimo: number;
  votantesValidos: number;
  tieneQuorum: boolean;
  totalVotosEmitidos: number;
  maxPuntosPosibles: number;
  resultados: ResultadoNominacion[];
  distribucionPilares: {
    pilar: Pilar;
    nominacionesCount: number;
    puntosCount: number;
  }[];
}

/**
 * Calcula el cómputo final de la votación Borda (3-2-1)
 */
export function calcularComputoBorda(
  nominaciones: Nominacion[],
  votos: ComiteVoto[],
  comite: ComiteIntegrante[],
  inhabilitaciones: ComiteInhabilitacion[],
  colaboradores: Colaborador[],
  pilares: Pilar[],
  quorumMinimo: number = 4
): ComputoCiclo {
  // Identificar votantes únicos válidos
  const votantesUnicos = new Set(votos.map((v) => v.integrante_id));
  const votantesValidos = votantesUnicos.size;
  const tieneQuorum = votantesValidos >= quorumMinimo;

  // Mapa de nominaciones con sus puntuaciones
  const resultadosMap = new Map<string, ResultadoNominacion>();

  nominaciones.forEach((nom) => {
    const colab = colaboradores.find((c) => c.id === nom.nominado_id);
    resultadosMap.set(nom.id, {
      nominacion: nom,
      colaborador: colab,
      puntosTotales: 0,
      votosDetalle: [],
    });
  });

  // Sumar puntos Borda
  votos.forEach((voto) => {
    const item = resultadosMap.get(voto.nominacion_id);
    if (item) {
      item.puntosTotales += voto.puntos;
      const integrante = comite.find((c) => c.id === voto.integrante_id);
      const colabIntegrante = colaboradores.find(
        (c) => c.id === integrante?.colaborador_id
      );
      item.votosDetalle.push({
        integranteId: voto.integrante_id,
        votoPor: colabIntegrante?.nombre_completo || "Integrante Comité",
        puntos: voto.puntos,
      });
    }
  });

  // Ordenar por puntos totales descendente
  const resultadosOrdenados = Array.from(resultadosMap.values()).sort(
    (a, b) => b.puntosTotales - a.puntosTotales
  );

  // Asignar posiciones
  resultadosOrdenados.forEach((r, idx) => {
    r.posicion = idx + 1;
  });

  // Distribución de pilares
  const distribucionPilares = pilares.map((pilar) => {
    let nominacionesCount = 0;
    let puntosCount = 0;

    resultadosOrdenados.forEach((r) => {
      if (r.nominacion.pilares.includes(pilar.clave)) {
        nominacionesCount += 1;
        puntosCount += r.puntosTotales;
      }
    });

    return {
      pilar,
      nominacionesCount,
      puntosCount,
    };
  });

  return {
    quorumMinimo,
    votantesValidos,
    tieneQuorum,
    totalVotosEmitidos: votos.length,
    maxPuntosPosibles: votantesValidos * 6, // 3 + 2 + 1 = 6 por votante
    resultados: resultadosOrdenados,
    distribucionPilares,
  };
}

/**
 * Valida que una boleta de votación Borda contenga exactamente 3 puntos, 2 puntos y 1 punto
 * para 3 nominaciones distintas
 */
export function validarBoletaBorda(votos: { nominacionId: string; puntos: 1 | 2 | 3 }[]): {
  valido: boolean;
  mensaje?: string;
} {
  if (votos.length !== 3) {
    return {
      valido: false,
      mensaje: "Debes asignar exactamente 3 votos: 1er lugar (3 pts), 2do lugar (2 pts) y 3er lugar (1 pt).",
    };
  }

  const ids = new Set(votos.map((v) => v.nominacionId));
  if (ids.size !== 3) {
    return {
      valido: false,
      mensaje: "No puedes asignar más de una puntuación a la misma nominación.",
    };
  }

  const puntosSet = new Set(votos.map((v) => v.puntos));
  if (!puntosSet.has(1) || !puntosSet.has(2) || !puntosSet.has(3)) {
    return {
      valido: false,
      mensaje: "Debes asignar una puntuación de 3, una de 2 y una de 1 punto sin repetir.",
    };
  }

  return { valido: true };
}
