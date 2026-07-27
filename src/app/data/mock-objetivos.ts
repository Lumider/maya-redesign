/**
 * Seguimiento unificado de objetivos de la Líder — datos de la propuesta `/n/objetivos`.
 *
 * Modela el tablero "Gestión de Liderazgo" (Kaori, jul 2026) y el spec
 * `docs/seguimiento-objetivos-lider.md`: los 5 frentes (PAR+, Formaciones, Medallas,
 * Autos, Ascensos), cada uno con progreso (anual y campañal) y recomendación faseada,
 * más la recomendación 360 que reconcilia lo declarado en el Business Plan con lo que
 * el plan realmente exige ("dijiste 3 formaciones, necesitas 4").
 *
 * Coherencia con el resto del mock: la venta GF acumulada y la meta del sueño viven en
 * `PERFILES_DIR[estatus].par` (mock-dir.ts) — aquí solo se añade lo nuevo: escalones de
 * estrella por estatus (metas oficiales PAR+ 2026 Perú), reparto entre hijas (nombres de
 * `DIRECTORAS`), cadena de formación y estructura de ascenso. Las reglas de Autos no
 * tienen folleto oficial (spec §7.1): los montos son ilustrativos y la card lo declara.
 */

import { EstatusDir } from './mock-dir';

/** Un escalón de la escalera PAR+ del estatus (montos oficiales PAR+ 2026 Perú). */
export interface EscalonPar {
  estrella: number;
  nombre: string;
  meta: number;
  lograda: boolean;
}

/** "Partir la torta": qué se le pide a cada hija para la meta conjunta (spec §4.3). */
export interface RepartoHija {
  nombre: string;
  iniciales: string;
  /** Estrella a la que la Líder debe llevar a esta hija (su sueño BP). */
  estrellaObjetivo: number;
  /** Venta de esta campaña: pedida por el plan vs. lograda. */
  ventaPedida: number;
  ventaReal: number;
}

/** Eslabón de la cadena de formación: semillero → CEM → CES → ASP (spec §4.4). */
export interface EtapaFormacion {
  etapa: 'CEM' | 'CES' | 'ASP';
  n: number;
  nota: string;
}

/** Movimiento de estructura que pide el ascenso, con gente concreta (spec §3.5). */
export interface MovimientoAscenso {
  quien: string;
  accion: string;
  estado: 'logrado' | 'en-curso' | 'pendiente';
}

export interface ObjetivosLider {
  /** Lo DECLARADO en el Business Plan (C11 del año pasado): la vara de toda la página. */
  bp: {
    suenoPersonal: string;
    estrellaSueno: number;
    formaciones: number;
    medallaGP: 'Oro' | 'Plata' | 'Bronce';
    medallaLiderazgo: 'Oro' | 'Plata' | 'Bronce' | null;
    ascenso: string;
    /** Conteo en paralelo: ascender y ganar el auto a la vez. */
    conAuto: boolean;
  };
  /** Recomendación 360: reconcilia los frentes entre sí (spec §4.1). */
  r360: {
    tono: 'success' | 'warning' | 'danger';
    resumen: string;
    detalle: { frente: string; texto: string }[];
  };
  par: {
    escalones: EscalonPar[];
    /** Corte campañal: crecimiento GF de esta campaña vs. el ritmo que pide el sueño. */
    crecimientoCampanal: { logrado: number; requerido: number };
    reparto: RepartoHija[];
    notaReparto: string | null;
  };
  formaciones: {
    plan: number;
    /** Lo que el plan 360 exige de verdad (estrella + ascenso), no lo declarado. */
    requeridas: number;
    enCurso: number;
    logradas: number;
    cadena: EtapaFormacion[];
    /** Banner de origen: si la cadena está vacía, la acción es el semillero (§6.1). */
    origen: string | null;
    campanal: string;
  };
  medallas: {
    gp: { proyeccion: 'Oro' | 'Plata' | 'Bronce' | '—'; cumplidas: number; margen: string };
    liderazgo: {
      proyeccion: 'Oro' | 'Plata' | 'Bronce' | '—';
      cumplidas: number;
      hijasEnA: number;
      hijasObjetivo: number;
      margen: string;
    } | null;
    campanal: string;
  };
  auto: {
    modelo: string;
    conteo: { etiqueta: string; logrado: number; meta: number }[];
    campanasOk: number;
    campanasDe: number;
    campanal: string;
  } | null;
  ascenso: {
    a: string;
    estructuraActual: string;
    estructuraObjetivo: string;
    estructuraFaltante: string;
    movimientos: MovimientoAscenso[];
    ventana: string;
    campanal: string;
  };
}

export const OBJETIVOS_LIDER: Record<EstatusDir, ObjetivosLider> = {
  // ── JNR · el caso "cadena vacía": el plan pide formar y no hay emprendedoras ──
  JNR: {
    bp: {
      suenoPersonal: 'La cuota inicial del departamento',
      estrellaSueno: 1,
      formaciones: 1,
      medallaGP: 'Plata',
      medallaLiderazgo: null,
      ascenso: 'Directora Senior (SNR)',
      conAuto: false,
    },
    r360: {
      tono: 'warning',
      resumen:
        'Tu plan pide 1 formación y hoy no tienes ninguna emprendedora. Todo empieza por un semillero: sin CEM no hay a quién formar.',
      detalle: [
        { frente: 'Ascensos', texto: 'Senior = 1 hija directora → necesitas 1 formación.' },
        { frente: 'Formaciones', texto: 'Cadena vacía (0 CEM · 0 CES): convoca un semillero.' },
        { frente: 'Medallas', texto: 'C6 va en Cuadrante C — te faltan S/ 3,600 para que sume.' },
      ],
    },
    par: {
      escalones: [
        { estrella: 1, nombre: 'Bono S/ 1,300', meta: 23500, lograda: false },
        { estrella: 2, nombre: 'Bono S/ 3,000', meta: 47000, lograda: false },
      ],
      crecimientoCampanal: { logrado: 1420, requerido: 1950 },
      reparto: [],
      notaReparto:
        'Aún sin hijas directoras: tu crecimiento de Grupo Familiar depende solo de tu Grupo Personal.',
    },
    formaciones: {
      plan: 1,
      requeridas: 1,
      enCurso: 0,
      logradas: 0,
      cadena: [
        { etapa: 'CEM', n: 0, nota: 'Sin emprendedoras' },
        { etapa: 'CES', n: 0, nota: 'Sin CEM Senior' },
        { etapa: 'ASP', n: 0, nota: 'Sin aspirantes' },
      ],
      origen:
        'No tienes ninguna emprendedora: convoca un semillero esta campaña y detecta 2 candidatas a CEM.',
      campanal: 'Convoca tu semillero — junta a tus consultoras y véndeles la oportunidad.',
    },
    medallas: {
      gp: {
        proyeccion: 'Plata',
        cumplidas: 4,
        margen: 'Perdiste C2 y C6 va en C: si no la recuperas, quedas sin margen para la Plata.',
      },
      liderazgo: null,
      campanal: 'C6 va en Cuadrante C: faltan S/ 3,600 de venta GP para que la campaña sume.',
    },
    auto: null,
    ascenso: {
      a: 'Directora Senior (SNR)',
      estructuraActual: 'Sin hijas directoras',
      estructuraObjetivo: '1 hija directora',
      estructuraFaltante: '1 formación (desde cero)',
      movimientos: [
        {
          quien: 'Tú',
          accion: 'Formar tu 1ª directora — empieza por el semillero',
          estado: 'pendiente',
        },
      ],
      ventana: 'Plazo realista: 6 campañas (semillero → CEM → CES → ASP)',
      campanal: 'Paso 1 de la cadena: el semillero de esta campaña.',
    },
  },

  // ── SNR · plan de formaciones justo, pero la medalla se bloquea por su cuadrante ──
  SNR: {
    bp: {
      suenoPersonal: 'El estudio de arte de mi hija',
      estrellaSueno: 2,
      formaciones: 1,
      medallaGP: 'Oro',
      medallaLiderazgo: 'Bronce',
      ascenso: 'Directora Súper Senior (SSE)',
      conAuto: true,
    },
    r360: {
      tono: 'warning',
      resumen:
        'Tu plan de formaciones cierra justo (1 declarada, 1 requerida) pero sin margen: si tu aspirante se cae, no asciendes. Y tu Cuadrante B bloquea la Medalla de Liderazgo aunque tus hijas ya cumplan.',
      detalle: [
        { frente: 'Ascensos', texto: 'SSE = 3 hijas: tienes 2 y 1 ASP en curso — sin plan B.' },
        {
          frente: 'Medallas',
          texto: 'Tus hijas cumplen (1 de 2 en A) pero tu Cuadrante B impide que C6 sume.',
        },
        { frente: 'PAR+', texto: 'Tu Estrella 2 no exige formación — el apuro es del ascenso.' },
      ],
    },
    par: {
      escalones: [
        { estrella: 1, nombre: 'Bono S/ 1,300', meta: 47000, lograda: false },
        { estrella: 2, nombre: 'Bono S/ 3,000', meta: 70000, lograda: false },
      ],
      crecimientoCampanal: { logrado: 4100, requerido: 5500 },
      reparto: [
        {
          nombre: 'Verónica Ríos',
          iniciales: 'VR',
          estrellaObjetivo: 2,
          ventaPedida: 16000,
          ventaReal: 17200,
        },
        {
          nombre: 'Lucía Herrera',
          iniciales: 'LH',
          estrellaObjetivo: 1,
          ventaPedida: 14000,
          ventaReal: 11800,
        },
      ],
      notaReparto: null,
    },
    formaciones: {
      plan: 1,
      requeridas: 1,
      enCurso: 1,
      logradas: 0,
      cadena: [
        { etapa: 'CEM', n: 2, nota: '2 emprendedoras activas' },
        { etapa: 'CES', n: 1, nota: '1 CEM Senior calificando' },
        { etapa: 'ASP', n: 1, nota: 'Carmen T. · campaña 2 de 4' },
      ],
      origen: null,
      campanal: 'Acompaña a Carmen (ASP): le faltan 3 cursos de Créana y 4 activas.',
    },
    medallas: {
      gp: {
        proyeccion: 'Oro',
        cumplidas: 5,
        margen: 'Vas 5 de 5, pero C6 va en B: recupérala o el Oro (13 de 13) se pierde aquí.',
      },
      liderazgo: {
        proyeccion: 'Bronce',
        cumplidas: 3,
        hijasEnA: 1,
        hijasObjetivo: 1,
        margen: 'Hijas OK (1 de 2 en A cumple la tabla) — el bloqueo es tu propio Cuadrante B.',
      },
      campanal: 'Asegura 2 primeros pedidos y C6 suma doble: Excelencia GP y Liderazgo.',
    },
    auto: null,
    ascenso: {
      a: 'Directora Súper Senior (SSE)',
      estructuraActual: '2 hijas directoras',
      estructuraObjetivo: '3 hijas directoras',
      estructuraFaltante: '1 hija (tu ASP en curso)',
      movimientos: [
        { quien: 'Tú', accion: 'Formar a Carmen T. (ASP, cierra en C9)', estado: 'en-curso' },
      ],
      ventana: 'Este año — con el conteo del Toyota Raize en paralelo',
      campanal: 'Empuja la postulación: Carmen necesita 4 activas más este cierre.',
    },
  },

  // ── SSE · el caso canónico de la reunión: "declaraste 2, tu plan real es 4" ──
  SSE: {
    bp: {
      suenoPersonal: 'Punta Cana con mi familia',
      estrellaSueno: 3,
      formaciones: 2,
      medallaGP: 'Oro',
      medallaLiderazgo: 'Plata',
      ascenso: 'Directora Regional (REG)',
      conAuto: true,
    },
    r360: {
      tono: 'warning',
      resumen:
        'Declaraste 2 formaciones, pero tu plan real es 4 en la genealogía: tu Estrella 3 pide 1 tuya y tu ascenso a Regional exige además que 2 hijas formen sus nietas. Hoy solo hay 1 aspirante en toda la red.',
      detalle: [
        { frente: 'PAR+', texto: 'Estrella 3 exige 1 Nueva Directora calificada — tuya.' },
        {
          frente: 'Ascensos',
          texto: 'REG pide 1 hija más y 2 nietas nuevas → 1 formación tuya + 2 de tus hijas.',
        },
        {
          frente: 'Formaciones',
          texto: 'Declarado: 2 · requerido: 4 · en curso: 1 (Carmen, CES).',
        },
        {
          frente: 'Medallas',
          texto: 'C6 va en D: si no la recuperas, el Oro se va y la Plata queda sin margen.',
        },
      ],
    },
    par: {
      escalones: [
        { estrella: 1, nombre: 'Bono S/ 1,300', meta: 95000, lograda: true },
        { estrella: 2, nombre: 'Bono S/ 3,000', meta: 140000, lograda: false },
        { estrella: 3, nombre: 'Punta Cana', meta: 190000, lograda: false },
      ],
      crecimientoCampanal: { logrado: 9300, requerido: 12800 },
      reparto: [
        {
          nombre: 'Verónica Ríos',
          iniciales: 'VR',
          estrellaObjetivo: 5,
          ventaPedida: 17500,
          ventaReal: 18900,
        },
        {
          nombre: 'Lucía Herrera',
          iniciales: 'LH',
          estrellaObjetivo: 4,
          ventaPedida: 16000,
          ventaReal: 16300,
        },
        {
          nombre: 'Paola Vásquez',
          iniciales: 'PV',
          estrellaObjetivo: 3,
          ventaPedida: 13000,
          ventaReal: 12100,
        },
        {
          nombre: 'Andrea Quispe',
          iniciales: 'AQ',
          estrellaObjetivo: 3,
          ventaPedida: 11000,
          ventaReal: 7600,
        },
        {
          nombre: 'Rosa Maldonado',
          iniciales: 'RM',
          estrellaObjetivo: 2,
          ventaPedida: 10000,
          ventaReal: 4900,
        },
      ],
      notaReparto: null,
    },
    formaciones: {
      plan: 2,
      requeridas: 4,
      enCurso: 1,
      logradas: 0,
      cadena: [
        { etapa: 'CEM', n: 6, nota: '6 emprendedoras activas en el GP' },
        { etapa: 'CES', n: 2, nota: 'Carmen T. y Silvia P. calificando' },
        { etapa: 'ASP', n: 1, nota: 'Karen N. · campaña 3 de 4' },
      ],
      origen: null,
      campanal: 'Postula a Carmen (CES) al aspirantado: su GP ya está al 60% del MRM.',
    },
    medallas: {
      gp: {
        proyeccion: 'Plata',
        cumplidas: 5,
        margen:
          'Si C6 no cierra en A, ya no puedes fallar ninguna de las 7 restantes para la Plata (11 de 13).',
      },
      liderazgo: {
        proyeccion: 'Plata',
        cumplidas: 4,
        hijasEnA: 3,
        hijasObjetivo: 3,
        margen:
          'Hijas OK (3 de 5 en A cumple la tabla) — tu Cuadrante D es lo único que impide que C6 sume.',
      },
      campanal: 'Te faltan S/ 2,720 y 4 PPED: recuperar C6 salva las dos medallas a la vez.',
    },
    auto: {
      modelo: 'Toyota Raize',
      conteo: [
        { etiqueta: 'Venta campañal (C6)', logrado: 31280, meta: 34000 },
        { etiqueta: 'Venta del trimestre (C4–C6)', logrado: 98400, meta: 102000 },
        { etiqueta: 'Venta total del conteo', logrado: 410000, meta: 1170000 },
      ],
      campanasOk: 5,
      campanasDe: 6,
      campanal: 'Te faltan S/ 2,720 esta campaña para no romper el conteo del Raize.',
    },
    ascenso: {
      a: 'Directora Regional (REG)',
      estructuraActual: '5 hijas (2 SNR · 3 JNR)',
      estructuraObjetivo: '6 hijas · 2 nietas nuevas',
      estructuraFaltante: '1 hija + 2 nietas (formadas por tus hijas)',
      movimientos: [
        {
          quien: 'Tú',
          accion: 'Formar 1 hija más (Karen N., ASP, cierra en C8)',
          estado: 'en-curso',
        },
        {
          quien: 'Verónica Ríos',
          accion: 'Formar 1 directora — su nieta te suma estructura',
          estado: 'pendiente',
        },
        {
          quien: 'Lucía Herrera',
          accion: 'Formar 1 directora y encaminarse a SSE',
          estado: 'pendiente',
        },
      ],
      ventana: 'Próximas 3 campañas (C7–C9) para que el conteo cierre en el año',
      campanal: 'Agenda coaching con Verónica: su formación es la más próxima de las 2 que faltan.',
    },
  },

  // ── REG · el plan consistente: declarado y requerido coinciden, todo en verde ──
  REG: {
    bp: {
      suenoPersonal: 'Jamaica y la cuota de la casa propia',
      estrellaSueno: 4,
      formaciones: 3,
      medallaGP: 'Oro',
      medallaLiderazgo: 'Oro',
      ascenso: 'Directora Regional Estrella (EST)',
      conAuto: false,
    },
    r360: {
      tono: 'success',
      resumen:
        'Tu plan está alineado: las 3 formaciones declaradas cubren tu Estrella 4 y tu ascenso, y vas 6 de 6 camino al Oro. El foco de esta campaña: sostener el ritmo de venta GF (vas arriba del requerido).',
      detalle: [
        { frente: 'Formaciones', texto: 'Declarado: 3 · requerido: 3 · 2 en curso, 1 lograda.' },
        {
          frente: 'Ascensos',
          texto: 'EST pide 1 hija en SSE: Verónica está a 1 formación de lograrlo.',
        },
        {
          frente: 'Medallas',
          texto: '6 de 6 en A — el Oro exige las 13: no hay margen, pero vas perfecta.',
        },
      ],
    },
    par: {
      escalones: [
        { estrella: 1, nombre: 'Bono S/ 1,300', meta: 165000, lograda: false },
        { estrella: 2, nombre: 'Bono S/ 3,000', meta: 235000, lograda: false },
        { estrella: 3, nombre: 'Punta Cana', meta: 285000, lograda: false },
        { estrella: 4, nombre: 'Jamaica', meta: 355000, lograda: false },
      ],
      crecimientoCampanal: { logrado: 33500, requerido: 31000 },
      reparto: [
        {
          nombre: 'Verónica Ríos',
          iniciales: 'VR',
          estrellaObjetivo: 5,
          ventaPedida: 19000,
          ventaReal: 21400,
        },
        {
          nombre: 'Lucía Herrera',
          iniciales: 'LH',
          estrellaObjetivo: 4,
          ventaPedida: 17000,
          ventaReal: 17600,
        },
        {
          nombre: 'Paola Vásquez',
          iniciales: 'PV',
          estrellaObjetivo: 3,
          ventaPedida: 14500,
          ventaReal: 14900,
        },
        {
          nombre: 'Andrea Quispe',
          iniciales: 'AQ',
          estrellaObjetivo: 3,
          ventaPedida: 12000,
          ventaReal: 9800,
        },
        {
          nombre: 'Rosa Maldonado',
          iniciales: 'RM',
          estrellaObjetivo: 2,
          ventaPedida: 10500,
          ventaReal: 8200,
        },
      ],
      notaReparto: 'Mostrando 5 de tus 8 hijas — las 3 restantes van al ritmo pedido.',
    },
    formaciones: {
      plan: 3,
      requeridas: 3,
      enCurso: 2,
      logradas: 1,
      cadena: [
        { etapa: 'CEM', n: 9, nota: '9 emprendedoras activas en el GP' },
        { etapa: 'CES', n: 4, nota: '4 CEM Senior calificando' },
        { etapa: 'ASP', n: 2, nota: 'Ambas cierran formación en C8' },
      ],
      origen: null,
      campanal: 'Sostén a tus 2 aspirantes: ambas cierran formación en C8.',
    },
    medallas: {
      gp: {
        proyeccion: 'Oro',
        cumplidas: 6,
        margen: 'Vas perfecta: 6 de 6 en A. El Oro exige las 13 — cada campaña cuenta.',
      },
      liderazgo: {
        proyeccion: 'Oro',
        cumplidas: 6,
        hijasEnA: 5,
        hijasObjetivo: 5,
        margen: 'Cumples justo la tabla (5 de 8 en A): si una hija cae, la campaña deja de sumar.',
      },
      campanal: 'C6 ya suma doble. Vigila a Andrea y Rosa: son el margen de tu 60%.',
    },
    auto: {
      modelo: 'Toyota Rush',
      conteo: [
        { etiqueta: 'Venta campañal (C6)', logrado: 35950, meta: 34000 },
        { etiqueta: 'Venta del trimestre (C4–C6)', logrado: 106000, meta: 102000 },
        { etiqueta: 'Venta total del conteo', logrado: 720000, meta: 1200000 },
      ],
      campanasOk: 6,
      campanasDe: 6,
      campanal: 'Conteo al día: 60% del total del Rush cumplido.',
    },
    ascenso: {
      a: 'Directora Regional Estrella (EST)',
      estructuraActual: '8 hijas (1 SSE · 4 SNR · 3 JNR)',
      estructuraObjetivo: '8 hijas con 2 en SSE',
      estructuraFaltante: '1 hija más en SSE',
      movimientos: [
        {
          quien: 'Verónica Ríos',
          accion: 'Pasar a SSE — le falta formar 1 directora',
          estado: 'en-curso',
        },
      ],
      ventana: 'Este año — el conteo EST arranca cuando Verónica cierre',
      campanal: 'Verónica está a 1 formación de SSE: tu ascenso pasa por su coaching.',
    },
  },
};
