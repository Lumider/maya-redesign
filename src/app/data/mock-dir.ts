/**
 * Perfiles por estatus de la Audiencia Directoras — la misma Gabriela (Líder de
 * la vista nueva) encarnada en cada etapa: JNR → SNR → SSE → REG.
 * Cifras reales del PAR+ 2026 Perú (docs de conocimiento):
 *  · Cuadrante A por estatus: JNR S/22,500+3 PPED · SNR S/28,200+3 · SSE/REG S/34,000+4.
 *  · Estrellas (crecimiento de Grupo Familiar): E1 JNR 23,500 · E2 SNR 70,000 ·
 *    E3 SSE 190,000 (Punta Cana) · E4 REG 355,000 (Jamaica).
 *  · Generaciones: SNR 5%+0.3% · SSE 5.5%+0.5% · REG 6%+0.75%.
 *  · Autos desde SSE: Toyota Raize · REG: Toyota Rush.
 */

export type EstatusDir = 'JNR' | 'SNR' | 'SSE' | 'REG';

export const ESTATUS_DIR_ORDEN: EstatusDir[] = ['JNR', 'SNR', 'SSE', 'REG'];

export interface PerfilDir {
  estatus: EstatusDir;
  nombreNivel: string;
  resumen: string;
  capacidades: { equipo: boolean; auto: boolean };
  /** Vara del Cuadrante A para este estatus (venta pública GP + PPED). */
  cuadranteA: { venta: number; pped: number };
  /** Genealogía: hijas directoras (null si aún no forma). */
  hijas: { total: number; enA: number } | null;
  /** % de comisión por generaciones (null para JNR). */
  generaciones: { gen1: number; gen2: number } | null;
  /**
   * La salud del negocio ESTA campaña. Cada estatus muestra un cuadrante
   * distinto a propósito: la demo recorre los 4 estados de la matriz
   * (JNR en C · SNR en B · SSE en D · REG en A).
   */
  negocio: {
    cuadrante: 'A' | 'B' | 'C' | 'D';
    badge: string;
    tone: 'success' | 'brand' | 'warning' | 'danger';
    titulo: string;
    mensaje: string;
    icono: string;
    ventaGP: number;
    pped: number;
    bono: number;
    morosidad: { im: number; deudaGP: number; pagoNecesario: number; miDeuda: number };
    credito: { estado: string; utilizado: number; disponible: number; total: number };
  };
  /** Composición de la ganancia campañal (referencial). */
  ganancia: { total: number; fuentes: { label: string; monto: number }[] };
  /** Meta PAR+ 2026 del estatus. */
  par: {
    estrella: number;
    premio: string;
    kicker: string;
    crecimientoMeta: number;
    crecimientoActual: number;
    requisitos: string[];
  };
  /** El norte de carrera: qué la asciende. */
  norte: { titulo: string; detalle: string };
  /** Escalera de ascensos (3 peldaños visibles). */
  escalera: { sigla: string; nota: string; estado: 'aqui' | 'siguiente' | 'futuro' }[];
  auto?: { modelo: string; avance: number };
}

export const PERFILES_DIR: Record<EstatusDir, PerfilDir> = {
  JNR: {
    estatus: 'JNR',
    nombreNivel: 'Directora Junior',
    resumen: 'Gestiona su Grupo Personal — aún sin hijas directoras',
    capacidades: { equipo: false, auto: false },
    cuadranteA: { venta: 22500, pped: 3 },
    hijas: null,
    generaciones: null,
    negocio: {
      cuadrante: 'C',
      badge: 'En recuperación',
      tone: 'warning',
      titulo: 'Cuadrante C · cumples PPED, falta venta',
      mensaje:
        'Ya cumples tus 3 primeros pedidos. Te faltan S/ 3,600 de venta del GP para el Cuadrante A y tu bono de S/ 400.',
      icono: 'icons/growth.png',
      ventaGP: 18900,
      pped: 3,
      bono: 400,
      morosidad: { im: 4.2, deudaGP: 3120, pagoNecesario: 410, miDeuda: 890 },
      credito: { estado: 'Aprobado', utilizado: 890, disponible: 4110, total: 5000 },
    },
    ganancia: {
      total: 2000,
      fuentes: [
        { label: 'Venta personal (N1GM)', monto: 220 },
        { label: '10% del Grupo Personal', monto: 1380 },
        { label: 'Bono Cuadrante A', monto: 400 },
      ],
    },
    par: {
      estrella: 1,
      premio: '¡Bono PAR+ de S/ 1,300!',
      kicker: 'PAR+ 2026 · Estrella 1',
      crecimientoMeta: 23500,
      crecimientoActual: 9870,
      requisitos: [
        'Crecimiento de Grupo Familiar: S/ 23,500',
        'IM de Grupo Familiar ≤ 3.00%',
        'Cuadrante A en 1 de las últimas 3 campañas',
      ],
    },
    norte: {
      titulo: 'Forma tu 1ª directora → Senior',
      detalle:
        'La Formación de Nueva Directora (FND) te asciende y te paga bono. Identifica a tu consultora con perfil: Yanbal premia a quien forma.',
    },
    escalera: [
      { sigla: 'JNR', nota: 'Estás aquí', estado: 'aqui' },
      { sigla: 'SNR', nota: 'Forma 1 hija directora', estado: 'siguiente' },
      { sigla: 'SSE', nota: '3 hijas · tu primer auto', estado: 'futuro' },
    ],
  },
  SNR: {
    estatus: 'SNR',
    nombreNivel: 'Directora Senior',
    resumen: '+ Lidera a sus primeras hijas directoras',
    capacidades: { equipo: true, auto: false },
    cuadranteA: { venta: 28200, pped: 3 },
    hijas: { total: 2, enA: 1 },
    generaciones: { gen1: 5, gen2: 0.3 },
    negocio: {
      cuadrante: 'B',
      badge: 'Potencial riesgo',
      tone: 'brand',
      titulo: 'Cuadrante B · vendes, pero no incorporas',
      mensaje:
        'Tu venta ya supera el MRM. Asegura 2 primeros pedidos más y ganas tu bono de S/ 400 — sin incorporación no hay crecimiento futuro.',
      icono: 'icons/goals.png',
      ventaGP: 29450,
      pped: 1,
      bono: 400,
      morosidad: { im: 3.6, deudaGP: 4480, pagoNecesario: 320, miDeuda: 1240 },
      credito: { estado: 'Aprobado', utilizado: 1240, disponible: 6760, total: 8000 },
    },
    ganancia: {
      total: 3200,
      fuentes: [
        { label: 'Venta personal (N1GM)', monto: 220 },
        { label: '10% del Grupo Personal', monto: 1500 },
        { label: 'Bono Cuadrante A', monto: 400 },
        { label: 'Generaciones (5% G1 · 0.3% G2)', monto: 1080 },
      ],
    },
    par: {
      estrella: 2,
      premio: '¡Bono PAR+ de S/ 3,000!',
      kicker: 'PAR+ 2026 · Estrella 2',
      crecimientoMeta: 70000,
      crecimientoActual: 31500,
      requisitos: [
        'Crecimiento de Grupo Familiar: S/ 70,000',
        'IM de Grupo Familiar ≤ 3.00%',
        'Cuadrante A en 1 de las últimas 3 campañas',
      ],
    },
    norte: {
      titulo: 'Forma 2 hijas más → Súper Senior',
      detalle:
        'Con 3 hijas directoras llegas a SSE: sube tu comisión de generaciones y estrenas tu Toyota Raize — el primer auto de la carrera.',
    },
    escalera: [
      { sigla: 'SNR', nota: 'Estás aquí', estado: 'aqui' },
      { sigla: 'SSE', nota: '2 hijas más · Toyota Raize', estado: 'siguiente' },
      { sigla: 'REG', nota: 'Líder consolidada', estado: 'futuro' },
    ],
  },
  SSE: {
    estatus: 'SSE',
    nombreNivel: 'Directora Súper Senior',
    resumen: 'Líder: lidera líderes y estrena auto',
    capacidades: { equipo: true, auto: true },
    cuadranteA: { venta: 34000, pped: 4 },
    hijas: { total: 5, enA: 3 },
    generaciones: { gen1: 5.5, gen2: 0.5 },
    negocio: {
      cuadrante: 'D',
      badge: 'En riesgo',
      tone: 'danger',
      titulo: 'Cuadrante D · sin MRM ni PPED',
      mensaje:
        'Te faltan S/ 2,720 de venta y 4 primeros pedidos para el Cuadrante A y tu bono de S/ 600 — esta campaña aún alcanza.',
      icono: 'icons/alert-02.png',
      ventaGP: 31280,
      pped: 0,
      bono: 600,
      morosidad: { im: 4.2, deudaGP: 6980, pagoNecesario: 940, miDeuda: 3180 },
      credito: { estado: 'Aprobado', utilizado: 3180, disponible: 10820, total: 14000 },
    },
    ganancia: {
      total: 6200,
      fuentes: [
        { label: 'Venta personal (N1GM)', monto: 250 },
        { label: '10% del Grupo Personal', monto: 1800 },
        { label: 'Bono Cuadrante A', monto: 600 },
        { label: 'Generaciones (5.5% G1 · 0.5% G2)', monto: 3550 },
      ],
    },
    par: {
      estrella: 3,
      premio: '¡Viaje a Punta Cana!',
      kicker: 'PAR+ 2026 · Estrella 3',
      crecimientoMeta: 190000,
      crecimientoActual: 100700,
      requisitos: [
        'Crecimiento de Grupo Familiar: S/ 190,000',
        'IM de Grupo Familiar ≤ 3.00%',
        'Formación: 1 Nueva Directora',
        'Cuadrante A en 1 de las últimas 3 campañas',
      ],
    },
    norte: {
      titulo: 'Regional: forma 1 hija más y sostén tu estructura',
      detalle:
        'Como REG tu comisión de Gen 1 sube a 6% y el auto escala a Toyota Rush. La clave: que tus hijas también formen (nietas).',
    },
    escalera: [
      { sigla: 'SSE', nota: 'Estás aquí', estado: 'aqui' },
      { sigla: 'REG', nota: 'Forma 1 hija más', estado: 'siguiente' },
      { sigla: 'EST', nota: 'Líder de líderes', estado: 'futuro' },
    ],
    auto: { modelo: 'Toyota Raize', avance: 35 },
  },
  REG: {
    estatus: 'REG',
    nombreNivel: 'Directora Regional',
    resumen: '+ Estructura amplia y camino a Elite',
    capacidades: { equipo: true, auto: true },
    cuadranteA: { venta: 34000, pped: 4 },
    hijas: { total: 8, enA: 5 },
    generaciones: { gen1: 6, gen2: 0.75 },
    negocio: {
      cuadrante: 'A',
      badge: 'Crecimiento',
      tone: 'success',
      titulo: 'Cuadrante A · ¡bono asegurado!',
      mensaje:
        'Cumples MRM y primeros pedidos: tu bono de S/ 700 está asegurado. Sostén el ritmo — cada campaña en A suma a tu Medalla de Excelencia.',
      icono: 'icons/check.png',
      ventaGP: 35950,
      pped: 5,
      bono: 700,
      morosidad: { im: 2.8, deudaGP: 5410, pagoNecesario: 0, miDeuda: 1980 },
      credito: { estado: 'Aprobado', utilizado: 4520, disponible: 15480, total: 20000 },
    },
    ganancia: {
      total: 9400,
      fuentes: [
        { label: 'Venta personal (N1GM)', monto: 250 },
        { label: '10% del Grupo Personal', monto: 2000 },
        { label: 'Bono Cuadrante A', monto: 700 },
        { label: 'Generaciones (6% G1 · 0.75% G2)', monto: 6450 },
      ],
    },
    par: {
      estrella: 4,
      premio: '¡Viaje a Jamaica!',
      kicker: 'PAR+ 2026 · Estrella 4',
      crecimientoMeta: 355000,
      crecimientoActual: 138400,
      requisitos: [
        'Crecimiento de Grupo Familiar: S/ 355,000',
        'IM de Grupo Familiar ≤ 3.00%',
        'Formación: 1 Nueva Directora',
        'Cuadrante A en 1 de las últimas 3 campañas',
      ],
    },
    norte: {
      titulo: 'Regional Estrella: entra a las Líderes de Líderes',
      detalle:
        'Desde EST cobras también por bisnietas (Gen 3) y compites en el Ranking Mundial. El techo: Elite Diamante, con hasta 4 opciones de auto.',
    },
    escalera: [
      { sigla: 'REG', nota: 'Estás aquí', estado: 'aqui' },
      { sigla: 'EST', nota: 'Líder de líderes', estado: 'siguiente' },
      { sigla: 'MAS', nota: 'Gen 3 + Ranking Mundial', estado: 'futuro' },
    ],
    auto: { modelo: 'Toyota Rush', avance: 60 },
  },
};
