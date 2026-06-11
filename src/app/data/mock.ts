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
  { label: 'Cuadrante', valor: 'D', icon: 'chart', tone: 'danger', detalle: 'A 9% del cuadrante A' },
  { label: 'Índice de morosidad', valor: '4.2%', icon: 'wallet', tone: 'warning', detalle: 'IM saludable: < 3%' },
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
  { label: 'Retener', count: 29, tone: 'info', hint: 'En riesgo de inactividad' },
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
    gradiente: 'linear-gradient(120deg, #b6450f, #e8590c 55%, #f47b3f)',
    emoji: '📖',
  },
  {
    titulo: 'Yanbal Business',
    texto: 'Empieza a construir tu camino hoy y descubre lo que puedes lograr.',
    cta: 'Síguenos en Instagram',
    gradiente: 'linear-gradient(120deg, #8a6a52, #c2a184 60%, #e3cdb4)',
    emoji: '📱',
  },
  {
    titulo: 'Viaje PAR+',
    texto: 'Hay un lugar reservado para ti, junto a las mejores.',
    cta: 'Mira tu progreso',
    gradiente: 'linear-gradient(120deg, #0e7490, #06b6d4 60%, #67e8f9)',
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
  { titulo: 'Carrera de Liderazgo', tag: 'Nuevo', gradiente: 'linear-gradient(160deg, #e8590c, #b6450f)', emoji: '🚀' },
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
    nivel: 'Sueño PAR+ Estrella 3',
    estrellaActual: 0,
    ventaC6: 703044,
    metaSueno: 1324211,
    requisitos: ['Promedio IM anual: 3%', 'Formación: 1'],
    cumpliendo: false,
  },
};

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
  { titulo: 'Product Book C6', categoria: 'Productos', subcategoria: 'Lanzamiento', gradiente: 'linear-gradient(150deg, #e8590c, #b6450f)', emoji: '📖' },
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
