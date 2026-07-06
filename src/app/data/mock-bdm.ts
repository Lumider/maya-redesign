/**
 * Datos mock de la vista BDM (Portal para BDMs) — audiencia Staff de Ventas.
 *
 * Fuente: base de conocimiento "Yanbal - BDM" (Obsidian) + Figma "🦋 Asesoría
 * de Negocio (BDM)" nodos 10-11067 (Home) y 38-14867 (Mi Campaña). Los valores
 * son los DATOS DE EJEMPLO del diseño, no datos reales; las definiciones aún
 * marcadas como (supuesto) en la base se modelan igual para el prototipo.
 *
 * La BDM (Business Development Manager) es Staff de Ventas: asesora y modela
 * a Líderes y Directoras para mover Delta (solidez), Capitalización (formación
 * de nuevas DIR) y % de Líderes Poderosas — Metodología de Asesoría de Negocio
 * (Plays 1–6). Su bono trimestral se mide por el Delta del equipo.
 */

export const USUARIA_BDM = {
  nombre: 'Allison Paredes Vega',
  codigo: '90411',
  rol: 'BDM',
  campana: 'C7',
  semana: 'S3',
  iniciales: 'AP',
  carrito: 0,
};

export const PERFIL_BDM = {
  nombreNivel: 'Business Development Manager',
  resumen: 'Staff de Ventas — asesora a Líderes y Directoras (Plays 1–6)',
};

/** Indicador del Home; cada uno enlaza a su card de detalle en Mi campaña. */
export interface IndicadorBdm {
  /** ancla de su card en /n/campana */
  seccion: string;
  etiqueta: string;
  valor: string;
  /** apoyo corto: variación, comparativo o unidad */
  nota?: string;
}

export const INDICADORES_BDM: IndicadorBdm[] = [
  { seccion: 'delta', etiqueta: 'Delta Campañal', valor: '60%' },
  { seccion: 'crecimiento', etiqueta: 'Capitalización DIR', valor: '126', nota: '+6' },
  { seccion: 'par', etiqueta: 'Proyecta NE', valor: '40%' },
  { seccion: 'par', etiqueta: 'Proyecta NE 3+', valor: '10%' },
  { seccion: 'poderosas', etiqueta: 'Líderes Poderosas', valor: '20%' },
  { seccion: 'poderosas', etiqueta: 'Líderes Ejemplo', valor: '40%' },
  { seccion: 'bp', etiqueta: 'Cumpl. Vta. Neta BP', valor: '96%', nota: 'vs BP' },
  { seccion: 'driver', etiqueta: 'Venta Neta C6', valor: 'S/ 1,773.66', nota: 'Driver Tree' },
];

/** Tarjeta de "Gestión de tus Directoras": conteo de DIR en un estado que
 *  requiere acción; el frente destino es una de las 5 Cards del release 1. */
export interface GestionBdm {
  etiqueta: string;
  valor: string;
  frente: 'Cuadrante' | 'Meta y Activas' | 'Formaciones' | 'PAR+' | 'Poderosas';
  /** true = estado bueno (celebrar); false = brecha (actuar) */
  positivo?: boolean;
  /** tab preseleccionado al abrir Mis Directoras (solo tiles de cuadrante) */
  cuad?: CuadranteLetra;
}

export const GESTION_BDM: GestionBdm[] = [
  { etiqueta: 'Cuadrante A', valor: '70%', frente: 'Cuadrante', positivo: true, cuad: 'A' },
  { etiqueta: 'Cuadrante D', valor: '10%', frente: 'Cuadrante', cuad: 'D' },
  { etiqueta: 'No cumple meta', valor: '50', frente: 'Meta y Activas' },
  { etiqueta: 'Formadoras', valor: '28', frente: 'Formaciones', positivo: true },
  { etiqueta: 'Con ASP', valor: '5', frente: 'Formaciones', positivo: true },
  { etiqueta: 'Sin Estrella', valor: '60', frente: 'PAR+' },
  { etiqueta: 'Poderosas', valor: '2', frente: 'Poderosas', positivo: true },
];

/** Quicklinks del Home (destinos dentro del prototipo). */
export const QUICKLINKS_BDM = [
  { etiqueta: 'Realizar pedido', icono: 'cart', ruta: '/externa/mis-pedidos' },
  { etiqueta: 'Reportes', icono: 'file', ruta: '/externa/reportes' },
  { etiqueta: 'Reporte BPlan', icono: 'chart', ruta: '/externa/reportes' },
  { etiqueta: 'Mis cursos', icono: 'cap', ruta: '/externa/cursos' },
];

/* --------------------------------------------------------------------------
 * Gestión de Directoras — frente "Cuadrantes y Medallas"
 * (Vista BDM — Cuadrantes y Medallas, Figma 748:18331 — el único de los 5
 * frentes con spec completa en la base; los demás siguen "Pendiente").
 * -------------------------------------------------------------------------- */

export type CuadranteLetra = 'A' | 'B' | 'C' | 'D';

/** Directora dentro de la genealogía que gestiona la BDM. El cuadrante NO se
 *  guarda: se calcula con la fórmula del doc (MRM × PPED), igual que los gaps. */
export interface DirectoraBdm {
  nombre: string;
  estatus: 'JNR' | 'SNR' | 'SSE' | 'REG';
  /** relación en la genealogía de la Líder */
  relacion: 'Hija' | 'Nieta' | 'Bisnieta';
  lider: string;
  /** venta acumulada del GP en la campaña (S/) */
  ventaGP: number;
  /** vara MRM de su estatus (S/) — PAR+ 2026 Perú, como en mock-dir */
  mrm: number;
  ppedLogrados: number;
  ppedRequeridos: number;
  /** campañas del año calificando CA — proyecta la Medalla de GP */
  campanasCA: number;
  hijasTotal: number;
  hijasCA: number;
  hijasCD: number;
}

/** Cuadrante según la fórmula del doc: A = MRM ✔ y PPED ✔ · B = solo MRM ·
 *  C = solo PPED · D = ninguno. */
export function cuadranteDe(d: DirectoraBdm): CuadranteLetra {
  const mrmOk = d.ventaGP >= d.mrm;
  const ppedOk = d.ppedLogrados >= d.ppedRequeridos;
  if (mrmOk && ppedOk) return 'A';
  if (mrmOk) return 'B';
  if (ppedOk) return 'C';
  return 'D';
}

/** Medalla de GP proyectada por campañas del año en CA. Umbrales POR CONFIRMAR
 *  con Negocio (pregunta abierta de la base); supuesto del prototipo:
 *  Oro ≥ 5 · Plata ≥ 3 · Bronce ≥ 1. */
export function medallaGpDe(d: DirectoraBdm): 'Oro' | 'Plata' | 'Bronce' | null {
  if (d.campanasCA >= 5) return 'Oro';
  if (d.campanasCA >= 3) return 'Plata';
  if (d.campanasCA >= 1) return 'Bronce';
  return null;
}

/** Medalla de Liderazgo: elegible si ≥60% de las hijas directas están en CA. */
export const MEDALLA_LIDERAZGO_UMBRAL = 60;

export const DIRECTORAS_BDM: DirectoraBdm[] = [
  // ——— Cuadrante A: banner verde con medalla proyectada ———
  // El caso del doc: "Hijas en CA: 2 (20%) / Hijas en CD: 5 (50%)"
  {
    nombre: 'Rosa Cárdenas Puma',
    estatus: 'SSE',
    relacion: 'Hija',
    lider: 'Gabriela Mendoza',
    ventaGP: 41200,
    mrm: 34000,
    ppedLogrados: 5,
    ppedRequeridos: 4,
    campanasCA: 5,
    hijasTotal: 10,
    hijasCA: 2,
    hijasCD: 5,
  },
  {
    nombre: 'Milagros Quispe Flores',
    estatus: 'SNR',
    relacion: 'Hija',
    lider: 'Gabriela Mendoza',
    ventaGP: 30150,
    mrm: 28200,
    ppedLogrados: 4,
    ppedRequeridos: 3,
    campanasCA: 3,
    hijasTotal: 6,
    hijasCA: 4,
    hijasCD: 1,
  },
  {
    nombre: 'Teresa Huamán Ccoa',
    estatus: 'JNR',
    relacion: 'Nieta',
    lider: 'Rosa Cárdenas',
    ventaGP: 24980,
    mrm: 22500,
    ppedLogrados: 3,
    ppedRequeridos: 3,
    campanasCA: 1,
    hijasTotal: 4,
    hijasCA: 3,
    hijasCD: 0,
  },
  {
    nombre: 'Ana Lucía Torres Vera',
    estatus: 'REG',
    relacion: 'Hija',
    lider: 'Patricia Salas',
    ventaGP: 36890,
    mrm: 34000,
    ppedLogrados: 4,
    ppedRequeridos: 4,
    campanasCA: 6,
    hijasTotal: 8,
    hijasCA: 6,
    hijasCD: 1,
  },
  // ——— Cuadrante B: tiene venta, le faltan PPED (caso del doc: falta 1) ———
  {
    nombre: 'Carmen Ríos Delgado',
    estatus: 'SNR',
    relacion: 'Hija',
    lider: 'Patricia Salas',
    ventaGP: 29400,
    mrm: 28200,
    ppedLogrados: 2,
    ppedRequeridos: 3,
    campanasCA: 2,
    hijasTotal: 5,
    hijasCA: 2,
    hijasCD: 2,
  },
  {
    nombre: 'Yolanda Paz Mamani',
    estatus: 'SSE',
    relacion: 'Nieta',
    lider: 'Ana Lucía Torres',
    ventaGP: 35100,
    mrm: 34000,
    ppedLogrados: 2,
    ppedRequeridos: 4,
    campanasCA: 4,
    hijasTotal: 7,
    hijasCA: 3,
    hijasCD: 2,
  },
  // ——— Cuadrante C: PPED ok, falta venta para el MRM ———
  {
    nombre: 'Silvia Chávez Ortega',
    estatus: 'JNR',
    relacion: 'Hija',
    lider: 'Gabriela Mendoza',
    ventaGP: 19300,
    mrm: 22500,
    ppedLogrados: 3,
    ppedRequeridos: 3,
    campanasCA: 0,
    hijasTotal: 3,
    hijasCA: 1,
    hijasCD: 1,
  },
  // ——— Cuadrante D: foco Delta (caso del doc: faltan S/ 8,200 y 3 PPED) ———
  {
    nombre: 'Beatriz Luna Aguirre',
    estatus: 'SSE',
    relacion: 'Hija',
    lider: 'Patricia Salas',
    ventaGP: 25800,
    mrm: 34000,
    ppedLogrados: 1,
    ppedRequeridos: 4,
    campanasCA: 0,
    hijasTotal: 9,
    hijasCA: 1,
    hijasCD: 6,
  },
  {
    nombre: 'Gladys Rojas Ninahuanca',
    estatus: 'JNR',
    relacion: 'Bisnieta',
    lider: 'Milagros Quispe',
    ventaGP: 14200,
    mrm: 22500,
    ppedLogrados: 1,
    ppedRequeridos: 3,
    campanasCA: 1,
    hijasTotal: 2,
    hijasCA: 0,
    hijasCD: 2,
  },
  {
    nombre: 'Norma Espino Cutipa',
    estatus: 'SNR',
    relacion: 'Nieta',
    lider: 'Rosa Cárdenas',
    ventaGP: 21050,
    mrm: 28200,
    ppedLogrados: 0,
    ppedRequeridos: 3,
    campanasCA: 0,
    hijasTotal: 5,
    hijasCA: 1,
    hijasCD: 3,
  },
];

/** Los 5 frentes del release 1. Solo Cuadrante tiene spec completa en la base
 *  de conocimiento; el resto sigue "Pendiente (Figma)" y se muestra en diseño. */
export const FRENTES_BDM = [
  { id: 'cuadrante', etiqueta: 'Cuadrante y Medallas', disponible: true },
  { id: 'meta', etiqueta: 'Meta de Venta y Activas', disponible: false },
  { id: 'formaciones', etiqueta: 'Formaciones', disponible: false },
  { id: 'par', etiqueta: 'PAR+', disponible: false },
  { id: 'poderosas', etiqueta: 'Poderosas', disponible: false },
];

/** Mi campaña BDM: las 6 cards de indicador (anatomía común: banner de brecha
 *  → indicador principal → distribución/slider → enlace a la gestión). */
export const CAMPANA_BDM = {
  campana: 'C6',
  /** pestañas del selector de periodo: la actual + las 3 campañas anteriores */
  periodos: ['C6', 'C5', 'C4', 'C3'],

  delta: {
    banner: 'Te faltan 5 DIR en CA para un Prom. Trimestral de 65% y lograr tu bono del 20%.',
    campanaPct: 60,
    promTrimestral: 63,
    /** distribución de Directoras por cuadrante (cómo se compone el Delta) */
    distribucion: [
      { cuadrante: 'A', pct: 70, n: 70 },
      { cuadrante: 'B', pct: 10, n: 10 },
      { cuadrante: 'C', pct: 10, n: 10 },
      { cuadrante: 'D', pct: 10, n: 10 },
    ],
    /** tramos del bono trimestral según Prom. Trimestral de DIR en CA */
    bonoTramos: [
      { prom: 55, bono: 10 },
      { prom: 60, bono: 15 },
      { prom: 65, bono: 20 },
    ],
    enlace: 'Ver DIR en cuadrantes',
  },

  crecimiento: {
    banner: 'Te falta 1 DIR para tu bono trimestral del 30%.',
    dirActual: 126,
    variacion: 6,
    cierreAnterior: { etiqueta: 'C13 2025', valor: 120 },
    /** meta de #DIR por trimestre con su tramo de bono */
    tramos: [
      { q: 'Q1', meta: 125, bono: 25 },
      { q: 'Q2', meta: 127, bono: 30 },
      { q: 'Q3', meta: 129, bono: 35 },
      { q: 'Q4', meta: 132, bono: 0 },
    ],
    enlace: 'Ver DIR Potenciales Formadoras',
  },

  par: {
    banner: 'Te faltan 10 DIR en NE para alcanzar el 50% y lograr tu bono anual del 10%.',
    ne1: { pct: 40, n: 40, metaPct: 50, metaN: 50, noFormaron: 8 },
    ne3: { pct: 10, n: 10, metaPct: 30, metaN: 30, noFormaron: 8 },
    /** distribución de Directoras por nivel de estrella */
    distribucion: [
      { rango: '★0', pct: 60, n: 25 },
      { rango: '★1–2', pct: 5, n: 5 },
      { rango: '★3–6', pct: 4, n: 4 },
    ],
    enlace: 'Ver DIR sin Estrella',
  },

  poderosas: {
    banner: 'Te faltan 2 Lid Poderosas para alcanzar el 40% y lograr un bono anual del 15%.',
    alerta: 'Redujo 1 LID vs C13 2025',
    poderosa: { n: 3, pct: 30, metaN: 10, metaPct: 40 },
    ejemplo: { n: 4, pct: 40, metaN: 10, metaPct: 40 },
    enlace: 'Ver Poderosas en Camino',
  },

  bp: {
    banner: 'Te faltan S/ 21,541.21 para lograr tu meta de Vta. Neta campañal.',
    cumplimientoPct: 96,
    real: 516989.0,
    meta: 538530.21,
  },

  driver: {
    venta: 1773.66,
    comparativos: ['96% vs BP', '+12.9% vs C5', '+5.9% vs 2025'],
    ranking: { puesto: 9, total: 31, nombre: 'Círculo Excelencia — Puesto Nacional' },
    enlace: 'Ver Driver Tree',
  },
};

/**
 * Cierre de una campaña anterior, para el selector de periodo de Mi campaña.
 * Una campaña cerrada ya no tiene brechas que gestionar: se muestran solo
 * los valores finales de los 6 indicadores.
 */
export interface CierreCampanaBdm {
  campana: string;
  /** Fechas reales del calendario campañal 2026 (docs/calendario-campanas.md). */
  fechas: string;
  /** % de DIR en Cuadrante A al cierre (Delta). */
  deltaPct: number;
  /** # de Directoras de la unidad al cierre (Capitalización). */
  dir: number;
  /** % de DIR con Nivel de Estrella 1 a más (PAR+). */
  ne1Pct: number;
  /** # de Líderes Poderosas. */
  poderosas: number;
  /** Cumplimiento de Venta Neta vs Business Plan. */
  bpPct: number;
  /** Venta Neta de la campaña en S/ (Driver Tree — valor de ejemplo del Figma). */
  ventaNeta: number;
  nota: string;
}

/** Las 3 campañas anteriores a la actual (C6). Coherentes con la card actual:
 *  Prom. Trimestral 63% = (C6 60 + C5 67 + C4 62) / 3, y Venta Neta C5 tal que
 *  el comparativo "+12.9% vs C5" del Driver Tree cuadre. */
export const CIERRES_BDM: CierreCampanaBdm[] = [
  {
    campana: 'C5',
    fechas: '25 abr – 22 may',
    deltaPct: 67,
    dir: 124,
    ne1Pct: 38,
    poderosas: 3,
    bpPct: 101,
    ventaNeta: 1571.0,
    nota: 'Buen cierre: Delta sobre la vara del trimestre y venta sobre el Business Plan.',
  },
  {
    campana: 'C4',
    fechas: '28 mar – 24 abr',
    deltaPct: 62,
    dir: 122,
    ne1Pct: 37,
    poderosas: 4,
    bpPct: 98,
    ventaNeta: 1540.1,
    nota: 'Cierre en línea con el plan; el Delta se sostuvo pese a 2 DIR que bajaron a B.',
  },
  {
    campana: 'C3',
    fechas: '28 feb – 27 mar',
    deltaPct: 58,
    dir: 121,
    ne1Pct: 35,
    poderosas: 4,
    bpPct: 94,
    ventaNeta: 1495.3,
    nota: 'Campaña corta en venta: el BP quedó a 6 puntos y el Delta bajo la vara del bono.',
  },
];
