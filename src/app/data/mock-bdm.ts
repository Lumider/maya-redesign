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
}

export const GESTION_BDM: GestionBdm[] = [
  { etiqueta: 'Cuadrante A', valor: '70%', frente: 'Cuadrante', positivo: true },
  { etiqueta: 'Cuadrante D', valor: '10%', frente: 'Cuadrante' },
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

/** Mi campaña BDM: las 6 cards de indicador (anatomía común: banner de brecha
 *  → indicador principal → distribución/slider → enlace a la gestión). */
export const CAMPANA_BDM = {
  campana: 'C6',
  /** pestañas del selector de periodo (diseño: últimas 3 campañas) */
  periodos: ['C6', 'C5', 'C4'],

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
