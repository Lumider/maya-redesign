/**
 * Datos de ejemplo para el prototipo.
 * Todos los nombres y cifras son ficticios.
 */

export const USUARIA = {
  nombre: 'Gabriela Mendoza Ríos',
  codigo: '10234',
  rol: 'DIR SSE',
  campana: 'C6',
  semana: 'S3',
  iniciales: 'GM',
  carrito: 22,
};

/**
 * Pedido personal de la campaña: requisito de calificación de la directora
 * (activa N1 Gana Más). Baja frecuencia (1 por campaña), alta importancia.
 */
export const PEDIDO_PERSONAL = {
  estado: 'pendiente' as 'pendiente' | 'calificado',
  ventaActual: 0,
  metaN1: 400,
  cierre: 'semana S4',
};

export interface Indicador {
  label: string;
  valor: string;
  icon: string;
  tone: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  detalle?: string;
}

export const INDICADORES: Indicador[] = [
  { label: 'Venta GP actual', valor: '$158,420', icon: 'trending', tone: 'brand', detalle: '56% de la meta C6' },
  { label: 'Activas GP', valor: '31', icon: 'users', tone: 'success', detalle: 'Meta campañal: 65' },
  { label: 'Primeros pedidos', valor: '0', icon: 'box', tone: 'warning', detalle: 'Meta: 4' },
  { label: 'Deuda actual', valor: '$3,180', icon: 'alert', tone: 'danger', detalle: 'Vence el 18 jun' },
  { label: 'Cuadrante', valor: 'D', icon: 'chart', tone: 'danger', detalle: 'Riesgo · sin MRM ni PPED' },
  { label: 'Índice de morosidad', valor: '4.2%', icon: 'wallet', tone: 'warning', detalle: 'Meta PAR+: 3.00%' },
  { label: 'Crédito Yanbal', valor: '$10,820', icon: 'wallet', tone: 'info', detalle: 'de $14,000 disponibles' },
];

export interface SegmentoGP {
  label: string;
  count: number;
  tone: string;
  hint: string;
}

export const SEGMENTOS_GP: SegmentoGP[] = [
  { label: 'Reactivar', count: 42, tone: 'warning', hint: 'Sin pedido en 2+ campañas' },
  { label: 'Deuda', count: 4, tone: 'danger', hint: 'Con saldo vencido' },
  { label: 'Retener', count: 29, tone: 'info', hint: 'Repitentes: la base del negocio' },
  { label: 'Inicio Ganador', count: 5, tone: 'violet', hint: 'En programa de inicio' },
  { label: 'Sin 1er Pedido', count: 11, tone: 'warning', hint: 'Incorporadas sin pedido' },
  { label: 'Activas', count: 30, tone: 'success', hint: 'Con pedido esta campaña' },
  { label: 'Incorporables', count: 59, tone: 'teal', hint: 'Prospectos listos' },
  { label: 'Celebraciones', count: 12, tone: 'brand', hint: 'Cumpleaños y logros' },
];

export interface Anuncio {
  titulo: string;
  texto: string;
  cta: string;
  gradiente: string;
  emoji: string;
}

export const ANUNCIOS: Anuncio[] = [
  {
    titulo: 'Product Book',
    texto: 'Tu nueva herramienta de inspiración, capacitación y venta.',
    cta: 'Míralo aquí',
    gradiente: 'linear-gradient(120deg, #c84008, #d94e15 55%, #dc582a)',
    emoji: '📖',
  },
  {
    titulo: 'Yanbal Business',
    texto: 'Empieza a construir tu camino hoy y descubre lo que puedes lograr.',
    cta: 'Síguenos en Instagram',
    gradiente: 'linear-gradient(120deg, #5e4632, #7a5c3e 60%, #8a6a52)',
    emoji: '📱',
  },
  {
    titulo: 'Viaje PAR+',
    texto: 'Hay un lugar reservado para ti, junto a las mejores.',
    cta: 'Mira tu progreso',
    gradiente: 'linear-gradient(120deg, #0c5566, #0e7490 60%, #1287a8)',
    emoji: '🌴',
  },
];

export interface Material {
  titulo: string;
  tag?: 'Actual' | 'Nuevo';
  gradiente: string;
  emoji: string;
}

export const MATERIALES: Material[] = [
  { titulo: 'Carrera de Liderazgo', tag: 'Nuevo', gradiente: 'linear-gradient(160deg, #d94e15, #92330b)', emoji: '🚀' },
  { titulo: 'Ganamás C6', tag: 'Actual', gradiente: 'linear-gradient(160deg, #ddd0c0, #b8a68e)', emoji: '🏆' },
  { titulo: 'Catálogo C6', tag: 'Actual', gradiente: 'linear-gradient(160deg, #2f4858, #33658a)', emoji: '💄' },
  { titulo: 'Entrenos C6', tag: 'Actual', gradiente: 'linear-gradient(160deg, #7a5c3e, #a98253)', emoji: '🧖🏽‍♀️' },
  { titulo: 'Catálogo C7', gradiente: 'linear-gradient(160deg, #4c2a59, #7c3aed)', emoji: '✨' },
  { titulo: 'Entrenos C7', gradiente: 'linear-gradient(160deg, #9a3412, #ea580c)', emoji: '🍳' },
  { titulo: 'Reporte PAR+', gradiente: 'linear-gradient(160deg, #155e75, #0891b2)', emoji: '🌊' },
];

export interface Consultora {
  nombre: string;
  nivel: 'CNS' | 'CEM' | 'CES' | 'ASP';
  ventaPersonal: number;
  ventaGrupal?: number;
  estado: 'activa' | 'riesgo' | 'nueva' | 'deuda';
}

export const CONSULTORAS: Consultora[] = [
  { nombre: 'Renata Olivares Cano', nivel: 'CNS', ventaPersonal: 0, estado: 'riesgo' },
  { nombre: 'Carmen Paredes Luna', nivel: 'CEM', ventaPersonal: 0, ventaGrupal: 14250, estado: 'riesgo' },
  { nombre: 'Tatiana Aguirre Solís', nivel: 'CNS', ventaPersonal: 3495, estado: 'activa' },
  { nombre: 'Daniela Robles Vega', nivel: 'CNS', ventaPersonal: 0, estado: 'deuda' },
  { nombre: 'Yamila Rodas Leyton', nivel: 'CNS', ventaPersonal: 0, estado: 'riesgo' },
  { nombre: 'Silvana Prado Mora', nivel: 'CES', ventaPersonal: 5120, ventaGrupal: 38900, estado: 'activa' },
  { nombre: 'Karen Núñez Ibarra', nivel: 'CNS', ventaPersonal: 1180, estado: 'nueva' },
  { nombre: 'Martha Cisneros Peña', nivel: 'CNS', ventaPersonal: 2640, estado: 'activa' },
  { nombre: 'Natalia Fuentes Gil', nivel: 'ASP', ventaPersonal: 0, estado: 'nueva' },
  { nombre: 'Samanta Beltrán Cruz', nivel: 'CNS', ventaPersonal: 890, estado: 'activa' },
  { nombre: 'Luz Salazar Ortiz', nivel: 'CNS', ventaPersonal: 4210, estado: 'activa' },
  { nombre: 'Emma Gutiérrez Lara', nivel: 'CEM', ventaPersonal: 760, ventaGrupal: 9870, estado: 'activa' },
];

export const CAMPANA = {
  actual: 'C6',
  tabs: ['C6', 'C5', 'C4'],
  ventaActual: 158420,
  meta: 280000,
  faltante: 121580,
  activas: { total: 31, meta: 65, estatus: 'ASP 0 · CES 0 · CEM 8 · CNS 23' },
  retenidas: { valor: 25, meta: 49 },
  reactivadas: { valor: 5, meta: 12 },
  primerosPedidos: { valor: 0, meta: 4 },
  premios: { calificados: 29, cercaDelPremio: 30, misPremios: 0, ventaPersonal: 4053 },
  cuadrante: {
    actual: 'D',
    bono: 2300,
    ventaRequerida: 172500,
    faltaVenta: 14080,
    ppedRequeridos: 4,
    ppedFaltantes: 4,
  },
  morosidad: { im: 4.2, deudaGP: 178540, pagoNecesario: 22980, deudoras: 4, miDeuda: 3180 },
  credito: { estado: 'Aprobado', utilizado: 3180, disponible: 10820, total: 14000 },
  productivas: { valor: 14, meta: 5 },
  par: {
    sueno: '¡Viaje a Punta Cana!',
    nivel: 'PAR+ 2026 · Estrella 3',
    estrellaActual: 0,
    ventaC6: 703044,
    metaSueno: 1324211,
    requisitos: [
      'IM de Grupo Familiar: 3.00%',
      'Formación: 1 Nueva Directora',
      'Cuadrante A en 1 de las últimas 3 campañas',
    ],
    cumpliendo: false,
  },
};

/**
 * Plan de campaña (Business Plan digital): se planifica en la semana 1
 * siguiendo el marco Sueño → Ganancia → Venta → Activas → Acciones;
 * las semanas 2-4 Maya acompaña con ritmo esperado y acciones concretas.
 */
export const PLAN_CAMPANA = {
  campana: 'C6',
  semanaActual: 3,
  totalSemanas: 4,
  estado: 'en-riesgo' as 'en-ritmo' | 'en-riesgo' | 'cumplido',
  sueno: 'Remodelar la cocina de mi casa',
  gananciaObjetivo: 19100,
  gananciaProyectada: 15900,
  metas: [
    {
      id: 'venta',
      label: 'Venta GP',
      detalle: 'MRM para Cuadrante A y tu ganancia (10% de venta neta)',
      actual: 158420,
      objetivo: 280000,
      esperadoHoy: 0.7,
      dinero: true,
    },
    {
      id: 'activas',
      label: 'Activas GP',
      detalle: 'Retenidas 25/49 · Reactivadas 5/12',
      actual: 31,
      objetivo: 65,
      esperadoHoy: 0.72,
      dinero: false,
    },
    {
      id: 'pped',
      label: 'Primeros pedidos',
      detalle: 'Requisito de Cuadrante A',
      actual: 0,
      objetivo: 4,
      esperadoHoy: 0.6,
      dinero: false,
    },
    {
      id: 'personal',
      label: 'Pedido personal N1',
      detalle: 'Tu calificación y premios Ganamás',
      actual: 0,
      objetivo: 400,
      esperadoHoy: 0.6,
      dinero: true,
    },
  ],
  semanas: [
    { n: 1, plan: 56000, logrado: 61200 },
    { n: 2, plan: 70000, logrado: 59800 },
    { n: 3, plan: 84000, logrado: 37420 },
    { n: 4, plan: 70000, logrado: 0 },
  ],
  acciones: [
    {
      id: 'a1',
      texto: 'Llama a 5 por reactivar: Renata O., Yamila R., Dalia R., Emma G. y Carmen P.',
      impacto: 'Reactivadas +5 · ~$14,000 de venta',
      meta: 'activas',
      link: '/grupo-personal',
      hecho: false,
    },
    {
      id: 'a2',
      texto: 'Asegura el primer pedido de Karen N. y Natalia F. antes del cierre',
      impacto: 'PPED +2 de 4',
      meta: 'pped',
      link: '/grupo-personal',
      hecho: false,
    },
    {
      id: 'a3',
      texto: 'Pasa tu pedido personal al N1 Gana Más ($400)',
      impacto: 'Mantienes calificación y premios',
      meta: 'personal',
      link: '/externa/mis-pedidos',
      hecho: false,
    },
    {
      id: 'a4',
      texto: 'Comparte el catálogo C6 y el Product Book con tus 30 activas',
      impacto: 'Empuja la venta de la semana',
      meta: 'venta',
      link: '/herramientas',
      hecho: true,
    },
    {
      id: 'a5',
      texto: 'Reconoce a Tatiana A. y Silvana P. por sus ventas de la semana',
      impacto: 'Retención: el reconocimiento sostiene la actividad',
      meta: 'activas',
      link: '/grupo-personal',
      hecho: true,
    },
  ],
};

/** Niveles de Estrella PAR+ 2026. Son excluyentes: se logra una de las 6. */
export const PAR_ESTRELLAS = [
  { n: 1, hito: 'Bono PAR+' },
  { n: 2, hito: 'Bono PAR+ mayor' },
  { n: 3, hito: 'Viaje a Punta Cana' },
  { n: 4, hito: 'Viaje a Jamaica' },
  { n: 5, hito: 'Cumbre Mundial · Tokio' },
  { n: 6, hito: 'Tokio con acompañante' },
];

export interface Participante {
  nombre: string;
  codigo: string;
  iniciales: string;
}

export const PARTICIPANTES: Participante[] = [
  { nombre: 'Carmen Tapia', codigo: '2201911687', iniciales: 'CT' },
  { nombre: 'Emma Gutiérrez', codigo: '2201875520', iniciales: 'EG' },
  { nombre: 'José Bravo', codigo: '2201990341', iniciales: 'JB' },
  { nombre: 'Karen Núñez', codigo: '2202014155', iniciales: 'KN' },
  { nombre: 'Luz Salazar', codigo: '2201932277', iniciales: 'LS' },
  { nombre: 'Martha Cisneros', codigo: '2201877810', iniciales: 'MC' },
  { nombre: 'Natalia Fuentes', codigo: '2202051190', iniciales: 'NF' },
  { nombre: 'Samanta Beltrán', codigo: '2202060034', iniciales: 'SB' },
  { nombre: 'Silvia Ponce', codigo: '2201899462', iniciales: 'SP' },
];

export interface Herramienta {
  titulo: string;
  categoria: 'Productos' | 'Ofertas' | 'Ganancias' | 'Negocio';
  subcategoria: string;
  gradiente: string;
  emoji: string;
}

export const SUBCATEGORIAS = [
  'Lanzamiento', 'Perfumería', 'Tratamiento Facial', 'Joyería', 'Maquillaje', 'Protección Solar', 'Cuidado Personal',
];

export const HERRAMIENTAS: Herramienta[] = [
  { titulo: 'Product Book C6', categoria: 'Productos', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #d94e15, #92330b)', emoji: '📖' },
  { titulo: 'Invitación Lanzamiento', categoria: 'Productos', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #5b8c5a, #2f5233)', emoji: '💌' },
  { titulo: 'Presentación de Producto', categoria: 'Productos', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #ded6cb, #b8aa95)', emoji: '🎤' },
  { titulo: 'Ohm Black · Postal', categoria: 'Productos', subcategoria: 'Perfumería', gradiente: 'linear-gradient(150deg, #1e293b, #0f172a)', emoji: '🌑' },
  { titulo: 'Ohm Now · Postal', categoria: 'Productos', subcategoria: 'Perfumería', gradiente: 'linear-gradient(150deg, #3f6212, #65a30d)', emoji: '🌿' },
  { titulo: 'Ohm · Postal', categoria: 'Productos', subcategoria: 'Perfumería', gradiente: 'linear-gradient(150deg, #7da2c9, #b9d2ea)', emoji: '💧' },
  { titulo: 'PPT Reunión de Núcleo C6', categoria: 'Negocio', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #c2410c, #ea580c)', emoji: '📊' },
  { titulo: 'Product Book · Demo', categoria: 'Negocio', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #ea580c, #f97316)', emoji: '🎬' },
  { titulo: 'Sérum Gérmaine · Postal', categoria: 'Productos', subcategoria: 'Tratamiento Facial', gradiente: 'linear-gradient(150deg, #831843, #be185d)', emoji: '🧴' },
  { titulo: 'Oferta Dúo Perfecto', categoria: 'Ofertas', subcategoria: 'Maquillaje', gradiente: 'linear-gradient(150deg, #9d174d, #db2777)', emoji: '💋' },
  { titulo: 'Tabla de Ganancias C6', categoria: 'Ganancias', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #166534, #16a34a)', emoji: '💰' },
  { titulo: 'Guía de Incorporación', categoria: 'Negocio', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #1d4ed8, #3b82f6)', emoji: '🤝' },
];

/**
 * Créditos solicitados por consultoras del GP que la Directora debe aprobar.
 * Un crédito sin aprobar bloquea el pedido de esa consultora; aprobarlo impacta el IM.
 */
export interface CreditoPendiente {
  nombre: string;
  iniciales: string;
  codigo: string;
  montoSolicitado: number;
  impactoIM: number; // puntos porcentuales que sumaría al IM si se aprueba
}

export const CREDITOS_PENDIENTES: CreditoPendiente[] = [
  { nombre: 'Karen Núñez Ibarra', iniciales: 'KN', codigo: '2202014155', montoSolicitado: 480, impactoIM: 0.3 },
  { nombre: 'Renata Olivares Cano', iniciales: 'RO', codigo: '2201911687', montoSolicitado: 1200, impactoIM: 0.8 },
  { nombre: 'Natalia Fuentes Gil', iniciales: 'NF', codigo: '2202051190', montoSolicitado: 650, impactoIM: 0.4 },
];

/**
 * Genealogía de liderazgo: la red de directoras de la Líder, repartida en
 * 3 generaciones (Hija = Gen 1, Nieta = Gen 2, Bisnieta = Gen 3). Cada directora
 * es empresaria independiente — gestiona el crédito de su propio grupo — por eso
 * aquí NO hay aprobación de créditos. Cada una aparece una sola vez; las lentes
 * (Prioridad/Cuadrante/Metas/Emprendedoras/PAR+) reordenan esta misma lista.
 *
 * Las 4 dimensiones son de la DIRECTORA, no de la Líder.
 */
export interface MetaProyeccion {
  real: number;
  meta: number; // proyección que la directora registró al iniciar la campaña
}

export interface Directora {
  nombre: string;
  iniciales: string;
  estatus: 'JNR' | 'SNR' | 'SSE';
  generacion: 1 | 2 | 3; // 1 Hija · 2 Nieta · 3 Bisnieta
  cuadrante: 'A' | 'B' | 'C' | 'D';
  /** Qué le falta para llegar a Cuadrante A ('' si ya está en A). */
  faltaA: string;
  /** Metas registradas al iniciar la campaña: real vs. proyección. */
  metas: {
    ventaGP: MetaProyeccion;
    activas: MetaProyeccion;
    pped: MetaProyeccion;
    reactivas: MetaProyeccion;
    retenidas: MetaProyeccion;
  };
  /** CEM/CES a su cargo y nota corta de su crecimiento paralelo. */
  emprendedoras: { cem: number; ces: number; nota: string };
  /** PAR+: a qué Estrella se proyecta, su Estrella Sueño (BP) y qué le falta. */
  par: { proyectada: number; sueno: number; falta: string };
}

export const DIRECTORAS: Directora[] = [
  // ---- Gen 1 · Hijas ----
  {
    nombre: 'Verónica Ríos', iniciales: 'VR', estatus: 'SNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 245700, meta: 230000 }, activas: { real: 63, meta: 60 }, pped: { real: 7, meta: 6 }, reactivas: { real: 11, meta: 10 }, retenidas: { real: 49, meta: 47 } },
    emprendedoras: { cem: 4, ces: 2, nota: '4 CEM · 2 CES — crecen parejo' },
    par: { proyectada: 4, sueno: 5, falta: 'IM de GF ≤ 3% para su Estrella 5' },
  },
  {
    nombre: 'Lucía Herrera', iniciales: 'LH', estatus: 'SNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 212400, meta: 200000 }, activas: { real: 58, meta: 55 }, pped: { real: 6, meta: 5 }, reactivas: { real: 9, meta: 8 }, retenidas: { real: 44, meta: 42 } },
    emprendedoras: { cem: 3, ces: 1, nota: '3 CEM · 1 CES' },
    par: { proyectada: 3, sueno: 4, falta: 'Sostener el monto de venta del Sueño' },
  },
  {
    nombre: 'Paola Vásquez', iniciales: 'PV', estatus: 'JNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 168900, meta: 160000 }, activas: { real: 41, meta: 40 }, pped: { real: 4, meta: 4 }, reactivas: { real: 6, meta: 6 }, retenidas: { real: 33, meta: 32 } },
    emprendedoras: { cem: 2, ces: 0, nota: '2 CEM · aún sin CES' },
    par: { proyectada: 2, sueno: 3, falta: 'Formar 1 nueva directora para Estrella 3' },
  },
  {
    nombre: 'Andrea Quispe', iniciales: 'AQ', estatus: 'JNR', generacion: 1, cuadrante: 'C', faltaA: 'Cumple PPED · faltan $41.7k de venta (MRM)',
    metas: { ventaGP: { real: 98300, meta: 140000 }, activas: { real: 27, meta: 38 }, pped: { real: 4, meta: 4 }, reactivas: { real: 2, meta: 6 }, retenidas: { real: 22, meta: 31 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 1, sueno: 3, falta: 'Cumplir el monto de venta del Sueño' },
  },
  {
    nombre: 'Rosa Maldonado', iniciales: 'RM', estatus: 'JNR', generacion: 1, cuadrante: 'D', faltaA: 'Faltan venta (MRM) y primeros pedidos',
    metas: { ventaGP: { real: 64100, meta: 135000 }, activas: { real: 21, meta: 37 }, pped: { real: 0, meta: 4 }, reactivas: { real: 1, meta: 6 }, retenidas: { real: 16, meta: 31 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 1, sueno: 2, falta: 'Estabilizar el grupo antes de proyectar' },
  },
  // ---- Gen 2 · Nietas ----
  {
    nombre: 'Mónica Lazo', iniciales: 'ML', estatus: 'JNR', generacion: 2, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 142000, meta: 135000 }, activas: { real: 36, meta: 34 }, pped: { real: 4, meta: 3 }, reactivas: { real: 5, meta: 5 }, retenidas: { real: 27, meta: 26 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 2, sueno: 3, falta: 'Cuadrante A 1 campaña más' },
  },
  {
    nombre: 'Brenda Salas', iniciales: 'BS', estatus: 'JNR', generacion: 2, cuadrante: 'B', faltaA: 'Cumple venta (MRM) · faltan 2 primeros pedidos',
    metas: { ventaGP: { real: 121000, meta: 150000 }, activas: { real: 32, meta: 40 }, pped: { real: 2, meta: 4 }, reactivas: { real: 4, meta: 7 }, retenidas: { real: 26, meta: 33 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 1, sueno: 2, falta: 'Subir a Cuadrante A' },
  },
  {
    nombre: 'Diana Cabrera', iniciales: 'DC', estatus: 'JNR', generacion: 2, cuadrante: 'D', faltaA: 'Faltan venta (MRM) y primeros pedidos',
    metas: { ventaGP: { real: 51200, meta: 130000 }, activas: { real: 18, meta: 36 }, pped: { real: 0, meta: 4 }, reactivas: { real: 1, meta: 6 }, retenidas: { real: 14, meta: 30 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 0, sueno: 2, falta: 'Aún sin proyección PAR+' },
  },
  // ---- Gen 3 · Bisnieta ----
  {
    nombre: 'Inés Ferrer', iniciales: 'IF', estatus: 'JNR', generacion: 3, cuadrante: 'C', faltaA: 'Cumple PPED · faltan $44k de venta (MRM)',
    metas: { ventaGP: { real: 76000, meta: 120000 }, activas: { real: 22, meta: 35 }, pped: { real: 4, meta: 4 }, reactivas: { real: 1, meta: 5 }, retenidas: { real: 18, meta: 30 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 1, sueno: 2, falta: 'Lograr su primer hito PAR+' },
  },
];

/** Reconocimientos / medallas anuales (PAR+). */
export const RECONOCIMIENTOS = {
  excelenciaGP: { medalla: 'Oro' as 'Oro' | 'Plata' | 'Bronce' | '—', cumplidas: 11, de: 13 },
  liderazgo: { medalla: 'Plata' as 'Oro' | 'Plata' | 'Bronce' | '—', hijasEnA: 60, meta: 60 },
  liderPoderosa: false,
};

export const CUADRANTE_HISTORIA = [
  { campana: 'C1', valor: 'A' },
  { campana: 'C2', valor: 'A' },
  { campana: 'C3', valor: 'A' },
  { campana: 'C4', valor: 'A' },
  { campana: 'C5', valor: 'A' },
  { campana: 'C6', valor: 'D' },
  { campana: 'C7', valor: '-' },
  { campana: 'C8', valor: '-' },
  { campana: 'C9', valor: '-' },
  { campana: 'C10', valor: '-' },
  { campana: 'C11', valor: '-' },
  { campana: 'C12', valor: '-' },
  { campana: 'C13', valor: '-' },
];
