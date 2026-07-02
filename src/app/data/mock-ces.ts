/**
 * Datos de ejemplo para la vista CES (Consultora Emprendedora Senior).
 * Todos los nombres y cifras son ficticios; los montos van en soles (Perú)
 * y son coherentes entre sí (ver docs/referencia-vista-ces.md):
 *  · Venta personal S/ 1,500.50 → escala 35% → ganancia por escala S/ 525.
 *  · Venta GP S/ 3,029 sobre una meta CES de S/ 6,000 (30% del MRM de S/ 20,000).
 *  · El título (CES) es independiente de la calificación de la campaña (CNS).
 */

export const USUARIA_CES = {
  nombre: 'Valeria Espinoza Rojas',
  codigo: '118344',
  rol: 'CEM Senior',
  titulo: 'CES',
  calificandoComo: 'CNS',
  campana: 'C7',
  semana: 'S2',
  iniciales: 'VE',
  carrito: 3,
};

/** Niveles Ganamás (venta pública acumulada por campaña) — referenciales del prototipo. */
export const GANAMAS_NIVELES = [
  { nivel: 'N1', desde: 470, descuento: 25 },
  { nivel: 'N2', desde: 940, descuento: 30 },
  { nivel: 'N3', desde: 1410, descuento: 35 },
  { nivel: 'N4', desde: 1880, descuento: 35 },
];

export const CAMPANA_CES = {
  actual: 'C7',
  tabs: ['C7', 'C6', 'C5'],
  semana: 2,
  totalSemanas: 4,
  diasCierre: 12,

  /** Venta del Grupo Personal (toda la red: hijas + nietas). */
  ventaGP: 3029,
  /** Meta CES: venta GP ≥ 30% del MRM (S/ 20,000). */
  metaVentaGP: 6000,

  /** Activas de la red y su composición. */
  activas: { total: 3, estatus: 'ASP 0 · CES 0 · CEM 0 · CNS 3' },
  retenidas: 2,
  reactivadas: 1,
  /** Primeros pedidos DIRECTOS (hijas): requisito CES = 2. */
  ppedDirectos: 0,
  metaPped: 2,
  /** Activas directas (hijas): requisito CES = 5. */
  activasDirectas: 3,
  metaActivasDirectas: 5,

  /** Mi venta personal y nivel Ganamás. */
  ventaPersonal: 1500.5,
  nivelGanamas: 'N3',
  descuentoActual: 35,

  /** Bonificaciones Ganamás propias (premios en producto). */
  bonificaciones: [
    {
      tipo: 'Unicampañal N3',
      premio: 'Set Sérum + Crema Gérmaine',
      pasos: [
        { campana: 'C7', estado: 'Calificado' },
        { campana: 'C8', estado: 'Entrega de bonificación' },
      ],
    },
    {
      tipo: 'Bicampañal N1',
      premio: 'Hervidor + Sandwichera + Exprimidor',
      pasos: [
        { campana: 'C7', estado: 'Calificado' },
        { campana: 'C8', estado: 'Seguir calificando' },
        { campana: 'C9', estado: 'Entrega de bonificación' },
      ],
    },
  ],
  /** Bonificaciones del GP: cuántas de mi red califican o están cerca. */
  bonifGP: { calificadas: 5, cerca: 3 },

  /** Morosidad y deuda del GP. */
  morosidad: {
    im: 5.14,
    limite: 5.0,
    deudaGP: 7336.39,
    pagoNecesario: 111.15,
    deudoras: 1,
    miDeuda: 1529.05,
    miDeudaVence: 'en 26 días',
  },

  credito: { estado: 'Aprobado', utilizado: 1529.05, disponible: 1670.95, total: 3200 },

  /** Ganancia estimada de la campaña — oculta por defecto en la UI (privacidad). */
  ganancia: {
    total: 525,
    escala: 525,
    incorporaYGana: 0,
    creceHaciendoCrecer: 0,
  },
};

/** Integrante del Grupo Personal de la CES (hijas y nietas: CNS/CEM, nunca directoras). */
export interface IntegranteCes {
  nombre: string;
  iniciales: string;
  nivel: 'CNS' | 'CEM';
  ventaPersonal: number;
  ventaGrupal?: number;
  /** Segmento de gestión: qué acción pide esta persona hoy. */
  estado: 'activa' | 'nueva' | 'sin1er' | 'deuda' | 'retener' | 'reactivar';
  hint: string;
  /** CEM que no llegará a su calificación: cobra como CNS. */
  alerta?: string;
}

export const GRUPO_CES: IntegranteCes[] = [
  {
    nombre: 'Katia Mendoza Palacios',
    iniciales: 'KM',
    nivel: 'CNS',
    ventaPersonal: 520,
    estado: 'activa',
    hint: 'Primer pedido ✓ · Inicio Ganador 1ª campaña',
  },
  {
    nombre: 'Bertha Rondán Meza',
    iniciales: 'BR',
    nivel: 'CNS',
    ventaPersonal: 731.5,
    estado: 'activa',
    hint: 'Bicampañal N1: calificada en C7',
  },
  {
    nombre: 'Delfina Landa Osorio',
    iniciales: 'DL',
    nivel: 'CNS',
    ventaPersonal: 797,
    estado: 'activa',
    hint: 'A S/ 143 del nivel N2 (30%)',
  },
  {
    nombre: 'Rosa Campos Huamán',
    iniciales: 'RC',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'retener',
    hint: 'Trabajó C6 — aún sin pedido esta campaña',
  },
  {
    nombre: 'Rayda León Roca',
    iniciales: 'RL',
    nivel: 'CEM',
    ventaPersonal: 0,
    ventaGrupal: 0,
    estado: 'retener',
    hint: 'Sin pedido esta campaña',
    alerta: 'Ganará como CNS',
  },
  {
    nombre: 'Carolina Torres Sinchi',
    iniciales: 'CT',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'sin1er',
    hint: 'Incorporada en C6 · aún sin primer pedido',
  },
  {
    nombre: 'Diego Salas Neyra',
    iniciales: 'DS',
    nivel: 'CNS',
    ventaPersonal: 430,
    estado: 'sin1er',
    hint: 'A S/ 40 del mínimo N1 (S/ 470)',
  },
  {
    nombre: 'Hermelinda Bautista Soto',
    iniciales: 'HB',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'deuda',
    hint: 'S/ 111.15 vencidos — bajan tu IM a 5.00%',
  },
  {
    nombre: 'Gloria Hinostroza Torre',
    iniciales: 'GH',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'reactivar',
    hint: 'Sin pedido hace 2 campañas',
  },
  {
    nombre: 'Luz Quispe Mayta',
    iniciales: 'LQ',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'reactivar',
    hint: 'Sin pedido hace 3 campañas',
  },
  {
    nombre: 'Emilia Gutiérrez Tovar',
    iniciales: 'EG',
    nivel: 'CNS',
    ventaPersonal: 0,
    estado: 'reactivar',
    hint: 'Sin pedido hace 1 campaña — la más fácil de recuperar',
  },
  {
    nombre: 'Elizabeth Meza Lizana',
    iniciales: 'EM',
    nivel: 'CEM',
    ventaPersonal: 0,
    ventaGrupal: 0,
    estado: 'reactivar',
    hint: 'Sin pedido hace 2 campañas',
    alerta: 'Ganará como CNS',
  },
];

/** Segmentos de gestión del grupo (chips del inicio y filtros de Mi grupo). */
export const SEGMENTOS_CES = [
  { id: 'reactivar', label: 'Reactivar', tone: 'warning', hint: 'Sin pedido en 1+ campañas' },
  { id: 'sin1er', label: 'Sin 1er Pedido', tone: 'warning', hint: 'Incorporadas sin pedido' },
  { id: 'deuda', label: 'Deuda', tone: 'danger', hint: 'Con saldo vencido' },
  { id: 'retener', label: 'Retener', tone: 'info', hint: 'Trabajaron la campaña pasada' },
  { id: 'activa', label: 'Activas', tone: 'success', hint: 'Con pedido esta campaña' },
] as const;

/**
 * Incorpora y Gana: S/ 50 por campaña por cada nueva consultora activa al N1
 * (pedido ≥ S/ 470 pagado), hasta 3 campañas por persona (S/ 150).
 * El pago llega una semana después del recaudo completo (campaña siguiente).
 */
export interface IncorporadaCes {
  nombre: string;
  iniciales: string;
  codigo: string;
  incorporada: string;
  primerPedido: string | null;
  /** Estado narrativo que guía la acción de la CES. */
  mensaje: string;
  gananciaAcumulada: number;
  filas: { campana: string; monto: number | null; pago: string; recibes: number | null }[];
}

export const INCORPORADAS_CES: IncorporadaCes[] = [
  {
    nombre: 'Katia Mendoza Palacios',
    iniciales: 'KM',
    codigo: '2214708897',
    incorporada: 'C6 · S3',
    primerPedido: 'C7 · S1',
    mensaje: '¡Pedido pagado! Tus S/ 50 llegan en la semana 1 de C8.',
    gananciaAcumulada: 50,
    filas: [
      { campana: 'C7', monto: 520, pago: 'Pagado', recibes: 50 },
      { campana: 'C8', monto: null, pago: '—', recibes: null },
      { campana: 'C9', monto: null, pago: '—', recibes: null },
    ],
  },
  {
    nombre: 'Rosa Campos Huamán',
    iniciales: 'RC',
    codigo: '2214655120',
    incorporada: 'C5 · S2',
    primerPedido: 'C6 · S2',
    mensaje: 'Ya cobraste su C6. Si repite pedido en C7, sumas otros S/ 50.',
    gananciaAcumulada: 50,
    filas: [
      { campana: 'C6', monto: 510, pago: 'Pagado', recibes: 50 },
      { campana: 'C7', monto: null, pago: 'Sin pedido aún', recibes: null },
      { campana: 'C8', monto: null, pago: '—', recibes: null },
    ],
  },
  {
    nombre: 'Diego Salas Neyra',
    iniciales: 'DS',
    codigo: '2214690341',
    incorporada: 'C6 · S4',
    primerPedido: 'C7 · S2',
    mensaje: 'Su pedido es de S/ 430: le faltan S/ 40 para el mínimo N1. Ayúdalo a completarlo.',
    gananciaAcumulada: 0,
    filas: [
      { campana: 'C7', monto: 430, pago: 'Bajo el mínimo', recibes: null },
      { campana: 'C8', monto: null, pago: '—', recibes: null },
      { campana: 'C9', monto: null, pago: '—', recibes: null },
    ],
  },
  {
    nombre: 'Carolina Torres Sinchi',
    iniciales: 'CT',
    codigo: '2214708812',
    incorporada: 'C6 · S1',
    primerPedido: null,
    mensaje: '¡Empieza a ganar! Motiva su primer pedido: cuando lo pague, recibes S/ 50.',
    gananciaAcumulada: 0,
    filas: [
      { campana: 'C7', monto: null, pago: '—', recibes: null },
      { campana: 'C8', monto: null, pago: '—', recibes: null },
      { campana: 'C9', monto: null, pago: '—', recibes: null },
    ],
  },
];

/**
 * Mi camino: carrera de la Audiencia Emprendedoras.
 * El título CES se conserva, pero la calificación se juega cada campaña
 * (4 requisitos simultáneos). El siguiente paso es Aspirante.
 */
export const CAMINO_CES = {
  niveles: [
    {
      sigla: 'CNS',
      nombre: 'Consultora',
      gana: 'Ganas por vender',
      ganancia: 220,
      estado: 'logrado',
    },
    {
      sigla: 'CEM',
      nombre: 'Emprendedora',
      gana: '+ Incorporar y retener',
      ganancia: 370,
      estado: 'logrado',
    },
    {
      sigla: 'CES',
      nombre: 'CEM Senior',
      gana: '+ Ganas de tu red',
      ganancia: 520,
      estado: 'actual',
    },
    {
      sigla: 'ASP',
      nombre: 'Aspirante',
      gana: '+ 5–8% de todo tu GP',
      ganancia: 780,
      estado: 'siguiente',
    },
    {
      sigla: 'DIR',
      nombre: 'Directora',
      gana: '+ 10% del GP y bonos',
      ganancia: 1820,
      estado: 'futuro',
    },
  ],
  /** Los 4 requisitos de calificación CES — todos en la misma campaña. */
  requisitosCes: [
    {
      texto: 'Venta personal en Nivel 1 Ganamás (S/ 470)',
      actual: 1500.5,
      meta: 470,
      cumple: true,
      detalle: 'Vas en S/ 1,500.50 — nivel N3',
    },
    {
      texto: '2 primeros pedidos directos (hijas)',
      actual: 0,
      meta: 2,
      cumple: false,
      detalle: 'Carolina y Diego están a un paso',
    },
    {
      texto: '5 activas directas (hijas)',
      actual: 3,
      meta: 5,
      cumple: false,
      detalle: 'Reactiva a Emilia y retén a Rosa',
    },
    {
      texto: 'Venta del GP ≥ 30% del MRM (S/ 6,000)',
      actual: 3029,
      meta: 6000,
      cumple: false,
      detalle: 'Llevas el 50% — faltan S/ 2,971',
    },
  ],
  /** Postulación a Aspirante (el paso que desbloquea la Directoría). */
  requisitosAsp: [
    'Venta del GP ≥ 60% del MRM (S/ 12,000)',
    'Mantener tu calificación de CEM Senior',
    'Índice de morosidad dentro del límite del país (6%)',
    'Entrevista con tu Coordinadora',
  ],
  formacion:
    'El programa "Fórmate como Directora" dura de 2 a 4 campañas e incluye 8 cursos de Créana (5 de negocio + 3 de habilidades blandas).',
};
