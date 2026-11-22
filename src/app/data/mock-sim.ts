/**
 * Simulador de carrera / formación (microsite fuera de Maya, rutas /sim/...).
 *
 * CONFIG ÚNICO compartido por las dos vistas (carrera y formación): mismas
 * etapas, montos y reparto de campañas. Todas las cifras son placeholder del
 * prototipo — TODO validar con Comercial antes de cualquier uso real:
 *  · ganancia estimada por campaña de cada etapa,
 *  · reparto de campañas por etapa según ritmo y nivel de partida,
 *  · bono de formación (monto y condiciones: momento de pago, retención),
 *  · campaña actual (configurable, nunca hardcodeada en las vistas).
 */

/** Nivel de partida de quien simula su carrera (audiencias del simulador). */
export type NivelSim = 'CNS' | 'CEM' | 'CES';

/** Etapas que el plan puede recorrer hasta la Directoría. */
export type EtapaId = 'CEM' | 'CEMSR' | 'ASP' | 'FND';

/** Nombres visibles de cada nivel — nunca siglas en textos de cara a la usuaria. */
export const NIVEL_NOMBRE: Record<NivelSim, string> = {
  CNS: 'Consultora',
  CEM: 'Consultora Emprendedora',
  CES: 'CEM Senior',
};

export interface EtapaDef {
  id: EtapaId;
  /** Nivel cuya ganancia estimada se percibe MIENTRAS se juega la etapa. */
  gana: 'CNS' | 'CEM' | 'CEMSR' | 'ASP';
  emoji: string;
  /** Voz de la consultora (vista carrera): título + qué lograr. */
  titulo: string;
  logro: string;
  /** Voz de la Directora (vista formación): título + las dos voces Ella/Tú. */
  tituloDir: string;
  ella: string;
  tu: string;
}

/** Las etapas, en orden de carrera. El plan de cada nivel toma su subconjunto. */
export const ETAPAS_SIM: EtapaDef[] = [
  {
    id: 'CEM',
    gana: 'CNS',
    emoji: '🌱',
    titulo: 'Conviértete en Emprendedora',
    logro:
      'Logra tu venta en Nivel 1 e incorpora a tu primera consultora activa — en la misma campaña.',
    tituloDir: 'Se vuelve Emprendedora',
    ella: 'Logra su venta en Nivel 1 e incorpora a su primera consultora activa.',
    tu: 'Ayúdala a pensar en 3 conocidas que venderían bien y acompaña esa primera incorporación.',
  },
  {
    id: 'CEMSR',
    gana: 'CEM',
    emoji: '⭐',
    titulo: 'Sube a CEM Senior',
    logro:
      'Logra tus 4 requisitos en una misma campaña: venta en Nivel 1, 2 primeros pedidos, 5 activas y venta de tu Grupo Personal.',
    tituloDir: 'Sube a CEM Senior',
    ella: 'Logra sus 4 requisitos en una misma campaña: venta en Nivel 1, 2 primeros pedidos, 5 activas y venta de su Grupo Personal.',
    tu: 'Preséntale la Carrera en un semillero y acompaña sus requisitos campaña a campaña.',
  },
  {
    id: 'ASP',
    gana: 'CEMSR',
    emoji: '🎓',
    titulo: 'Postula y sé Aspirante',
    logro:
      'Completa tus 8 cursos (5 de negocio + 3 de habilidades) y pasa la entrevista con el acompañamiento de tu Directora.',
    tituloDir: 'Postula y es Aspirante',
    ella: 'Completa sus 8 cursos (5 de negocio + 3 de habilidades) y pasa la entrevista.',
    tu: 'Preséntala en el Núcleo y acompáñala en su postulación y entrevista.',
  },
  {
    id: 'FND',
    gana: 'ASP',
    emoji: '👑',
    titulo: 'Fórmate y asciende a Directora',
    logro: 'Programa Fórmate como Directora: de 2 a 4 campañas con tu BDT.',
    tituloDir: 'Se forma como Nueva Directora',
    ella: 'Programa Fórmate como Directora con la BDT: primeros pedidos, desarrollo de su grupo.',
    tu: 'Suelta con red: transfiérele la gestión y trabaja tu crecimiento paralelo.',
  },
];

export interface PlanNivel {
  /** Los tres ritmos que ofrece el chip (nº total de campañas a Directora). */
  ritmos: [number, number, number];
  /** Reparto de campañas por etapa para cada ritmo (las llaves de `ritmos`). */
  reparto: Record<number, Partial<Record<EtapaId, number>>>;
}

export const SIM_CONFIG = {
  /** Campaña en curso (C del año actual) — configurable, llega a los chips de inicio. */
  campanaActual: 11,
  anioActual: 2026,
  campaniasPorAnio: 13,

  /** Ganancia estimada S/ por campaña mientras se juega cada etapa (placeholder). */
  gananciaEtapa: { CNS: 440, CEM: 600, CEMSR: 970, ASP: 1400 } as Record<EtapaDef['gana'], number>,
  /** La única cifra de carrera visible: siempre "desde", siempre "por campaña". */
  gananciaDirectora: 1820,

  /** Bono de formación de la Directora (TODO condiciones reales: pago, retención). */
  bonoFormacion: 750,

  /**
   * Reparto de campañas por etapa según nivel de partida y ritmo elegido.
   * El de CEM viene de la spec; CNS y CES son SUPUESTOS del prototipo que
   * mantienen Fórmate como Directora dentro de sus 2–4 campañas (TODO validar).
   */
  planes: {
    CNS: {
      ritmos: [10, 12, 14],
      reparto: {
        10: { CEM: 1, CEMSR: 3, ASP: 3, FND: 3 },
        12: { CEM: 2, CEMSR: 4, ASP: 3, FND: 3 },
        14: { CEM: 2, CEMSR: 4, ASP: 4, FND: 4 },
      },
    },
    CEM: {
      ritmos: [9, 11, 13],
      reparto: {
        9: { CEMSR: 3, ASP: 3, FND: 3 },
        11: { CEMSR: 4, ASP: 4, FND: 3 },
        13: { CEMSR: 5, ASP: 4, FND: 4 },
      },
    },
    CES: {
      ritmos: [6, 8, 10],
      reparto: {
        6: { ASP: 3, FND: 3 },
        8: { ASP: 5, FND: 3 },
        10: { ASP: 6, FND: 4 },
      },
    },
  } as Record<NivelSim, PlanNivel>,
};

/* ========================================================================
   Datos demo (fallback cuando el deep link no trae parámetros).
   Vista carrera: ?nombre=&nivel=&ganancia_actual=&sueno=&meta=&dir_nombre=&dir_tel=
   Vista formación: ?dir_nombre=&bono=&nombre=&tel_wa=&nivel=&venta_gp=&activas=
                    &pped=&potencial=&interes=&sueno=
   ======================================================================== */

export interface UsuariaSim {
  nombre: string;
  nivel: NivelSim;
  /** Ganancia estimada actual S/ por campaña (contexto, no cálculo). */
  ganancia: number;
  sueno: string;
  /** Meta en S/ asociada al sueño. */
  meta: number;
  dirNombre: string;
  /** Teléfono WhatsApp de su Directora (formato internacional sin +). */
  dirTel: string;
}

export const DEMO_CARRERA: UsuariaSim = {
  nombre: 'Luciana',
  nivel: 'CEM',
  ganancia: 440,
  sueno: 'Comprar mi casa',
  meta: 8000,
  dirNombre: 'Rosa',
  dirTel: '51999999999',
};

export interface CandidataSim {
  nombre: string;
  /** Nombre corto para los mensajes ("Luciana"). */
  corto: string;
  tel: string;
  nivel: NivelSim;
  ventaGp: number | null;
  activas: number | null;
  pped: number | null;
  potencial: 'alto' | 'medio' | 'bajo' | null;
  interes: boolean;
  sueno: string | null;
}

export interface FormacionSim {
  dirNombre: string;
  bono: number;
  candidata: CandidataSim;
}

export const DEMO_FORMACION: FormacionSim = {
  dirNombre: 'Rosa',
  bono: SIM_CONFIG.bonoFormacion,
  candidata: {
    nombre: 'Luciana Grande',
    corto: 'Luciana',
    tel: '51999999999',
    nivel: 'CES',
    ventaGp: 18500,
    activas: 22,
    pped: 3,
    potencial: 'alto',
    interes: true,
    sueno: 'Comprar mi casa',
  },
};
