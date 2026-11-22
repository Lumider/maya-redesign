import { ETAPAS_SIM, EtapaDef, NIVEL_NOMBRE, NivelSim, SIM_CONFIG } from '../data/mock-sim';

/**
 * Motor del simulador: funciones puras compartidas por las vistas carrera y
 * formación. Trabaja con "campañas absolutas" (C1 del año actual = 1) para
 * cruzar años sin aritmética repetida en los componentes.
 */

/** Campaña absoluta → etiqueta visible: "C4" este año, "C4 (2027)" si cruza. */
export function campLabel(abs: number): string {
  const anio = SIM_CONFIG.anioActual + Math.floor((abs - 1) / SIM_CONFIG.campaniasPorAnio);
  const c = ((abs - 1) % SIM_CONFIG.campaniasPorAnio) + 1;
  return `C${c}` + (anio > SIM_CONFIG.anioActual ? ` (${anio})` : '');
}

/** Nombre visible del nivel (nunca la sigla). */
export function nivelNombre(nivel: NivelSim): string {
  return NIVEL_NOMBRE[nivel];
}

/**
 * Normaliza el `nivel` del deep link: acepta siglas y variantes humanas
 * ("consultora", "CEM Senior", "cem-senior"…). Null si no se reconoce.
 */
export function parseNivel(raw: string | null): NivelSim | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (v === 'CNS' || v === 'CONSULTORA') return 'CNS';
  if (v === 'CEM' || v === 'EMPRENDEDORA' || v === 'CONSULTORA EMPRENDEDORA') return 'CEM';
  if (/^(CES|CEMS|CEMSR)$/.test(v) || v.replace(/[-_ ]/g, '') === 'CEMSENIOR') return 'CES';
  return null;
}

export interface EtapaPlan {
  def: EtapaDef;
  /** Rango en campañas absolutas, ambos inclusive. */
  desde: number;
  hasta: number;
  n: number;
  /** Ganancia estimada S/ por campaña mientras se juega la etapa. */
  ganancia: number;
}

export interface PlanSimulado {
  nivel: NivelSim;
  /** Nº total de campañas del plan (ritmo elegido). */
  ritmo: number;
  /** Campaña absoluta de inicio y de llegada a Directora. */
  inicio: number;
  fin: number;
  etapas: EtapaPlan[];
  /** Ganancia acumulada S/ al cierre de cada campaña del plan. */
  serie: number[];
  acumulado: number;
  /** Campaña absoluta donde el acumulado cruza la meta (null si no la cruza). */
  campMeta: number | null;
}

/** Arma el plan por etapas y la serie de ganancia acumulada. */
export function simularPlan(
  nivel: NivelSim,
  ritmo: number,
  inicio: number,
  meta: number | null,
): PlanSimulado {
  const reparto = SIM_CONFIG.planes[nivel].reparto[ritmo] ?? {};
  const etapas: EtapaPlan[] = [];
  const serie: number[] = [];
  let cursor = inicio;
  let acumulado = 0;
  let campMeta: number | null = null;

  for (const def of ETAPAS_SIM) {
    const n = reparto[def.id] ?? 0;
    if (!n) continue;
    const ganancia = SIM_CONFIG.gananciaEtapa[def.gana];
    etapas.push({ def, desde: cursor, hasta: cursor + n - 1, n, ganancia });
    for (let i = 0; i < n; i++) {
      acumulado += ganancia;
      serie.push(acumulado);
      if (campMeta === null && meta !== null && acumulado >= meta) campMeta = cursor + i;
    }
    cursor += n;
  }

  return { nivel, ritmo, inicio, fin: cursor, etapas, serie, acumulado, campMeta };
}

export interface OpcionInicio {
  /** Campaña absoluta. */
  abs: number;
  big: string;
  label: string;
}

/** Las tres campañas de inicio que ofrece el chip, desde la campaña en curso. */
export function opcionesInicio(): OpcionInicio[] {
  const labels = ['Esta campaña', 'La próxima', 'En dos campañas'];
  return labels.map((label, i) => {
    const abs = SIM_CONFIG.campanaActual + i;
    const c = ((abs - 1) % SIM_CONFIG.campaniasPorAnio) + 1;
    return { abs, big: `C${c}`, label: c === SIM_CONFIG.campaniasPorAnio ? 'Fin de año' : label };
  });
}
