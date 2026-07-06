/**
 * Datos de ejemplo para el prototipo del PASE DE PEDIDOS (portal B2B).
 *
 * Cifras y mecánicas basadas en el brief de rediseño (sesión real DIR SSE,
 * mercado México, moneda MXN). Todos los productos, códigos y precios son
 * ficticios. Este archivo es la ÚNICA fuente de datos de la vista; la página
 * no inventa cifras: todo "te falta $X", ahorro y saldo se DERIVA de aquí.
 */

/* ==========================================================================
   Recompensas — el corazón del negocio del pase de pedidos.

   El portal actual muestra DOS barras sticky que compiten (GanaMás y Escala),
   cada una con su propio "te falta $X" (hallazgos #2 y #11 del brief). Aquí las
   modelamos como HITOS sobre UNA sola vara: el monto del pedido. Ambos programas
   se alcanzan subiendo el mismo número, así que el rediseño los ordena en una
   única línea de progreso con un solo "próximo beneficio".
   ========================================================================== */

export type TipoRecompensa = 'escala' | 'ganamas';

export interface Hito {
  tipo: TipoRecompensa;
  /** Rótulo corto para el marcador ("35%", "N2"). */
  clave: string;
  /** Monto de pedido (MXN) necesario para alcanzarlo. */
  meta: number;
  titulo: string;
  /** Qué gana la directora al alcanzarlo. */
  beneficio: string;
}

/**
 * Hitos ordenados por meta ascendente. La Escala es un % de descuento sobre el
 * pedido; GanaMás es una bonificación (regalo/puntos). Se intercalan por monto
 * para que la línea única cuente una sola historia de progreso.
 */
export const HITOS: Hito[] = [
  {
    tipo: 'escala',
    clave: '30%',
    meta: 0,
    titulo: 'Escala 30% de descuento',
    beneficio: 'Descuento base sobre tu pedido comisionable.',
  },
  {
    tipo: 'ganamas',
    clave: 'N1',
    meta: 2700,
    titulo: 'GanaMás Nivel 1',
    beneficio: 'Set de fragancias de regalo con tu pedido.',
  },
  {
    tipo: 'escala',
    clave: '35%',
    meta: 3900,
    titulo: 'Escala 35% de descuento',
    beneficio: '+5% de descuento sobre TODO tu pedido (retroactivo).',
  },
  {
    tipo: 'ganamas',
    clave: 'N2',
    meta: 5300,
    titulo: 'GanaMás Nivel 2',
    beneficio: 'Kit de cuidado facial premium de regalo.',
  },
  {
    tipo: 'escala',
    clave: '40%',
    meta: 7800,
    titulo: 'Escala 40% de descuento',
    beneficio: '+5% adicional sobre TODO tu pedido (retroactivo).',
  },
  {
    tipo: 'ganamas',
    clave: 'N3',
    meta: 10500,
    titulo: 'GanaMás Nivel 3',
    beneficio: 'Bono máximo + estuche de joyería exclusivo.',
  },
];

/**
 * % de descuento de la Escala según el monto del pedido comisionable.
 * Retroactivo: al cruzar un umbral, el % nuevo aplica a TODO el pedido
 * (mecánica que el portal actual no comunica en el flujo — hallazgo #10).
 */
export function escalaPara(monto: number): number {
  if (monto >= 7800) return 0.4;
  if (monto >= 3900) return 0.35;
  return 0.3;
}

/**
 * Crédito / línea de la directora — dato central del modelo B2B (no compra al
 * contado, arma el pedido contra su línea). El "saldo disponible" se DERIVA:
 * monto disponible − total del pedido en curso.
 */
export const CREDITO = {
  /** Línea total autorizada (MXN). */
  montoDisponible: 11688.04,
};

/** Cargo fijo de logística. El portal lo muestra sin explicar (hallazgo #15). */
export const GASTOS_OPERACION = 155.0;

/* ==========================================================================
   Catálogo de productos
   ========================================================================== */

export type BadgeProducto = 'nuevo' | 'oferta-top' | 'millonaria' | null;

export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  /** Placeholder visual: no hay fotos reales en el prototipo. */
  emoji: string;
  /** Carrusel/sección a la que pertenece en la home. */
  seccion: string;
  /** P. Normal — precio de lista tachado. */
  precioLista: number;
  /**
   * P. Capi (precio de capitalización) — el precio efectivo que paga la
   * directora. Es el concepto clave que el portal no explica (hallazgo #1).
   */
  precioCapi: number;
  contenido: string;
  /** true = suma para Escala/GanaMás; false = material gratuito. */
  comisionable: boolean;
  badge: BadgeProducto;
  /** false = agotado: la card se atenúa y no permite agregar (hallazgo #6). */
  enStock: boolean;
}

/** % de ahorro Capi vs Normal, redondeado — se muestra como badge en la card. */
export function ahorroPct(p: Producto): number {
  if (p.precioLista <= 0) return 0;
  return Math.round((1 - p.precioCapi / p.precioLista) * 100);
}

export const PRODUCTOS: Producto[] = [
  // — Destacados: Aniversario —
  {
    id: 'ohm-now',
    nombre: 'Ohm Now Eau de Parfum',
    codigo: '2037',
    emoji: '🧴',
    seccion: 'Destacados: Aniversario',
    precioLista: 1075,
    precioCapi: 537.5,
    contenido: '50 ml',
    comisionable: true,
    badge: 'oferta-top',
    enStock: true,
  },
  {
    id: 'gloria-edp',
    nombre: 'Gloria Eau de Parfum',
    codigo: '4182',
    emoji: '🌸',
    seccion: 'Destacados: Aniversario',
    precioLista: 1290,
    precioCapi: 719,
    contenido: '50 ml',
    comisionable: true,
    badge: 'nuevo',
    enStock: true,
  },
  {
    id: 'sentiva-body',
    nombre: 'Sentiva Crema Corporal',
    codigo: '3391',
    emoji: '🧴',
    seccion: 'Destacados: Aniversario',
    precioLista: 419,
    precioCapi: 251,
    contenido: '200 ml',
    comisionable: true,
    badge: null,
    enStock: true,
  },
  {
    id: 'unique-lip',
    nombre: 'Unique Labial Matte',
    codigo: '5510',
    emoji: '💄',
    seccion: 'Destacados: Aniversario',
    precioLista: 289,
    precioCapi: 173,
    contenido: '3.5 g',
    comisionable: true,
    badge: null,
    enStock: false,
  },
  // — Oferta Millonaria —
  {
    id: 'leyenda-edp',
    nombre: 'Leyenda de Hombre EDP',
    codigo: '2211',
    emoji: '✨',
    seccion: 'Oferta Millonaria',
    precioLista: 1490,
    precioCapi: 596,
    contenido: '75 ml',
    comisionable: true,
    badge: 'millonaria',
    enStock: true,
  },
  {
    id: 'emprendedora-set',
    nombre: 'Set Emprendedora (3 pzas)',
    codigo: '9001',
    emoji: '🎁',
    seccion: 'Oferta Millonaria',
    precioLista: 1980,
    precioCapi: 792,
    contenido: 'Estuche',
    comisionable: true,
    badge: 'millonaria',
    enStock: true,
  },
  {
    id: 'aqua-serum',
    nombre: 'Aqua Serum Ácido Hialurónico',
    codigo: '6720',
    emoji: '💧',
    seccion: 'Oferta Millonaria',
    precioLista: 720,
    precioCapi: 396,
    contenido: '30 ml',
    comisionable: true,
    badge: 'oferta-top',
    enStock: true,
  },
  // — Cuidado de la piel —
  {
    id: 'defense-fps',
    nombre: 'Defense Protector FPS 50',
    codigo: '6104',
    emoji: '🧼',
    seccion: 'Cuidado de la piel',
    precioLista: 540,
    precioCapi: 351,
    contenido: '50 ml',
    comisionable: true,
    badge: 'nuevo',
    enStock: true,
  },
  {
    id: 'nutrition-crema',
    nombre: 'Nutrition Crema de Noche',
    codigo: '6099',
    emoji: '🌙',
    seccion: 'Cuidado de la piel',
    precioLista: 890,
    precioCapi: 534,
    contenido: '50 g',
    comisionable: true,
    badge: null,
    enStock: true,
  },
  {
    id: 'micelar-agua',
    nombre: 'Agua Micelar Desmaquillante',
    codigo: '6033',
    emoji: '🫧',
    seccion: 'Cuidado de la piel',
    precioLista: 320,
    precioCapi: 224,
    contenido: '200 ml',
    comisionable: true,
    badge: null,
    enStock: true,
  },
];

/**
 * Material promocional que acompaña al pedido: demostradores, sachets y
 * flyers. NO comisionable (no suma a Escala/GanaMás) y siempre GRATIS. El portal
 * actual lo mezcla con el pedido real y confunde qué se paga (hallazgo #14):
 * aquí va agrupado y explicado aparte en la bolsa.
 */
export interface MaterialGratis {
  id: string;
  nombre: string;
  emoji: string;
  cantidad: number;
}

export const MATERIAL_PROMOCIONAL: MaterialGratis[] = [
  { id: 'demo-ohm', nombre: 'Demostrador Ohm Now', emoji: '🧪', cantidad: 2 },
  { id: 'sachet-nutrition', nombre: 'Sachets Nutrition (muestra)', emoji: '📦', cantidad: 6 },
  { id: 'flyer-campana', nombre: 'Flyers de campaña', emoji: '📄', cantidad: 4 },
  { id: 'catalogo', nombre: 'Catálogo impreso C6', emoji: '📖', cantidad: 1 },
];
