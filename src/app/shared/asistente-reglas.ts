import { Injectable } from '@angular/core';
import { CAMINO_CES, CAMPANA_CES, GANAMAS_NIVELES, PERFILES } from '../data/mock-ces';
import { PERFILES_DIR, type EstatusDir, type PerfilDir } from '../data/mock-dir';
import {
  CAMPANA_BDM,
  DIRECTORAS_BDM,
  GESTION_BDM,
  cuadranteDe,
  esPoderosa,
  esPotencialFormadora,
} from '../data/mock-bdm';
import type { Estatus } from './estatus';
import type {
  AccionConsejo,
  BrechaConsejo,
  CerebroAsistente,
  Consejo,
  ContextoAsistente,
} from './asistente';

/**
 * Cerebro fase 1 del asistente: reglas deterministas sobre los datos mock.
 * No inventa cifras — ENVUELVE la materia prima que ya existe en el repo
 * (perfiles por estatus, funciones de cuadrante, banners de brecha) y la
 * convierte en un Consejo por contexto: ruta × audiencia × estatus.
 *
 * Estructura: un builder por página clave y audiencia; toda ruta sin regla
 * propia cae al consejo de inicio de su audiencia (el consejo "de campaña"
 * sirve en cualquier página — p. ej. /n/herramientas).
 */
@Injectable({ providedIn: 'root' })
export class MotorReglas implements CerebroAsistente {
  consejosPara(ctx: ContextoAsistente): Consejo[] {
    switch (ctx.audiencia) {
      case 'emprendedora':
        return [this.emprendedora(ctx.ruta, ctx.estatus as Estatus)];
      case 'directora':
        return [this.directora(ctx.ruta, ctx.estatus as EstatusDir)];
      default:
        return [this.bdm(ctx.ruta)];
    }
  }

  /* ========================= Emprendedoras (CNS→ASP) ========================
   * PERFILES ya modela "qué te falta para tu meta" por estatus: alerta,
   * requisitos con progreso y acciones redactadas. El motor mapea casi 1:1. */

  private emprendedora(ruta: string, e: Estatus): Consejo {
    switch (ruta) {
      case '/n/campana':
        return this.empCampana(e);
      case '/n/grupo':
      case '/n/incorpora':
        return this.empGrupo(e, ruta);
      case '/n/camino':
        return this.empCamino(e);
      default:
        return this.empInicio(e);
    }
  }

  /** Consejo base de la Emprendedora: su paso de carrera, tal como lo juega hoy. */
  private empInicio(e: Estatus): Consejo {
    const p = PERFILES[e];
    return {
      id: `emp-${e}-inicio`,
      burbuja: p.alerta.titulo,
      titulo: p.paso.titulo,
      tono: p.alerta.tone,
      expresion: this.expresionDe(p.alerta.tone, p.acciones),
      meta: this.metaEmp(e),
      brechas: p.paso.requisitos,
      acciones: p.acciones,
    };
  }

  /** En Mi campaña el foco es el cierre: cuántos días quedan y qué asegura la meta. */
  private empCampana(e: Estatus): Consejo {
    const p = PERFILES[e];
    const dias = CAMPANA_CES.diasCierre;
    const pendientes = p.paso.requisitos.filter((r) => !r.cumple);
    const burbuja = pendientes.length
      ? `Quedan ${dias} días de ${CAMPANA_CES.actual}: ${pendientes.length} requisito${pendientes.length > 1 ? 's' : ''} por cumplir.`
      : `Quedan ${dias} días de ${CAMPANA_CES.actual} — ¡vas cumpliendo todo!`;
    return {
      id: `emp-${e}-campana`,
      burbuja,
      titulo: `Cierra ${CAMPANA_CES.actual} con tu meta lograda`,
      tono: pendientes.length ? 'warning' : 'success',
      expresion: pendientes.length ? 'normal' : 'celebra',
      meta: this.metaEmp(e),
      brechas: p.paso.requisitos,
      acciones: this.prioriza(p.acciones, '/n/campana'),
    };
  }

  /** En Mi grupo / Incorpora el foco son las personas: activas y primeros pedidos. */
  private empGrupo(e: Estatus, ruta: string): Consejo {
    const p = PERFILES[e];
    const gente = p.paso.requisitos.filter(
      (r) =>
        r.texto.includes('activas') || r.texto.includes('pedido') || r.texto.includes('consultora'),
    );
    const faltan = gente.filter((r) => !r.cumple);
    return {
      id: `emp-${e}-grupo`,
      burbuja: faltan[0]?.detalle ?? p.alerta.titulo,
      titulo: 'Tu gente te acerca a la meta',
      tono: faltan.length ? 'warning' : 'success',
      expresion: faltan.length ? 'normal' : 'celebra',
      brechas: gente.length ? gente : p.paso.requisitos,
      acciones: this.prioriza(p.acciones, ruta),
    };
  }

  /** En Mi camino el foco es la carrera: los requisitos del paso que juega. */
  private empCamino(e: Estatus): Consejo {
    const p = PERFILES[e];
    // CES juega su calificación (4 requisitos); ASP mira la postulación ya jugada
    // en su paso de graduación. CNS/CEM usan los requisitos de su propio paso.
    const brechas: BrechaConsejo[] = e === 'CES' ? CAMINO_CES.requisitosCes : p.paso.requisitos;
    const todo = brechas.every((r) => r.cumple);
    return {
      id: `emp-${e}-camino`,
      burbuja: todo
        ? `¡${p.paso.titulo} — ya cumples todo!`
        : `${p.paso.titulo}: llevas ${brechas.filter((r) => r.cumple).length} de ${brechas.length} requisitos.`,
      titulo: p.paso.titulo,
      tono: todo ? 'success' : 'info',
      expresion: todo ? 'celebra' : 'normal',
      meta: this.metaEmp(e),
      brechas,
      acciones: this.prioriza(p.acciones, '/n/camino'),
    };
  }

  /** Progreso principal de la Emprendedora: venta GP si ya tiene red; si no,
   *  venta personal contra el siguiente nivel Ganamás (su meta de campaña). */
  private metaEmp(e: Estatus): Consejo['meta'] {
    const p = PERFILES[e];
    if (p.ventaGP) {
      return {
        etiqueta: `Venta GP · ${p.ventaGP.etiquetaMeta}`,
        actual: p.ventaGP.actual,
        objetivo: p.ventaGP.meta,
        unidad: 'S/',
      };
    }
    const sig = GANAMAS_NIVELES.find((n) => n.desde > p.ventaPersonal);
    if (!sig) return undefined;
    return {
      etiqueta: `Venta personal → nivel ${sig.nivel} (${sig.descuento}%)`,
      actual: p.ventaPersonal,
      objetivo: sig.desde,
      unidad: 'S/',
    };
  }

  /* ========================== Directoras (JNR→REG) ==========================
   * La meta campañal de la Directora es el Cuadrante A (venta GP + PPED) y su
   * bono; la de carrera, el PAR+. Las brechas se calculan igual que en
   * nueva/inicio-n.ts: max(0, vara − real). */

  private directora(ruta: string, e: EstatusDir): Consejo {
    switch (ruta) {
      case '/n/negocio':
        return this.dirNegocio(e);
      case '/n/equipo':
        return this.dirEquipo(e);
      case '/n/carrera':
        return this.dirCarrera(e);
      case '/n/campana':
      case '/n/pedidos':
        return this.dirCampana(e, ruta);
      default:
        return this.dirInicio(e);
    }
  }

  private dirInicio(e: EstatusDir): Consejo {
    const p = PERFILES_DIR[e];
    const { faltaVenta, faltanPped } = this.brechaCuadrante(p);
    const enA = p.negocio.cuadrante === 'A';
    return {
      id: `dir-${e}-inicio`,
      burbuja: enA
        ? `¡Cuadrante A! Tu bono de ${soles(p.negocio.bono)} está asegurado.`
        : `Te falta${this.plural(faltaVenta, faltanPped)} ${this.faltantes(faltaVenta, faltanPped)} para el Cuadrante A.`,
      titulo: p.negocio.titulo,
      tono: this.tonoDir(p),
      expresion: enA ? 'celebra' : p.negocio.cuadrante === 'D' ? 'alerta' : 'normal',
      meta: this.metaDir(p),
      brechas: this.brechasCuadrante(p),
      acciones: this.accionesDir(p, faltaVenta, faltanPped),
    };
  }

  /** En Mi negocio se suma la salud financiera: morosidad dentro del límite PAR+. */
  private dirNegocio(e: EstatusDir): Consejo {
    const p = PERFILES_DIR[e];
    const base = this.dirInicio(e);
    const m = p.negocio.morosidad;
    const imOk = m.im <= LIMITE_IM_PAR;
    return {
      ...base,
      id: `dir-${e}-negocio`,
      brechas: [
        ...base.brechas,
        {
          texto: `Morosidad ≤ ${LIMITE_IM_PAR.toFixed(2)}% (vara PAR+)`,
          cumple: imOk,
          detalle: imOk
            ? `IM ${m.im}% — dentro de la vara`
            : `IM ${m.im}% — un pago de ${soles(m.pagoNecesario)} del GP la ordena`,
        },
      ],
      acciones: imOk
        ? base.acciones
        : [
            {
              emoji: '💳',
              texto: `Gestiona el pago de ${soles(m.pagoNecesario)} en tu GP`,
              impacto: `Baja tu IM de ${m.im}% hacia la vara PAR+`,
              ruta: '/n/negocio',
              urgente: true,
            },
            ...base.acciones,
          ],
    };
  }

  /** En Mi equipo la meta se juega a través de las hijas directoras. */
  private dirEquipo(e: EstatusDir): Consejo {
    const p = PERFILES_DIR[e];
    if (!p.hijas) return this.dirInicio(e); // JNR aún no forma: su consejo es el general
    const todas = p.hijas.enA === p.hijas.total;
    return {
      id: `dir-${e}-equipo`,
      burbuja: todas
        ? `¡Tus ${p.hijas.total} hijas están en Cuadrante A!`
        : `${p.hijas.enA} de ${p.hijas.total} hijas en Cuadrante A — acompaña al resto.`,
      titulo: 'Tu equipo también juega la campaña',
      tono: todas ? 'success' : 'info',
      expresion: todas ? 'celebra' : 'normal',
      brechas: [
        {
          texto: 'Hijas directoras en Cuadrante A',
          actual: p.hijas.enA,
          meta: p.hijas.total,
          cumple: todas,
          detalle: `Generaciones: ${p.generaciones?.gen1}% G1 · ${p.generaciones?.gen2}% G2 — cobras de su venta`,
        },
      ],
      acciones: [
        {
          emoji: '🤝',
          texto: 'Agenda coaching con tus hijas fuera del Cuadrante A',
          impacto: 'Su venta alimenta tus generaciones',
          ruta: '/n/equipo',
        },
        {
          emoji: '🌱',
          texto: p.norte.titulo,
          impacto: 'Tu siguiente ascenso',
          ruta: '/n/carrera',
        },
      ],
    };
  }

  /** En Mi carrera el norte es el PAR+ (crecimiento del Grupo Familiar) y el ascenso. */
  private dirCarrera(e: EstatusDir): Consejo {
    const p = PERFILES_DIR[e];
    const falta = Math.max(0, p.par.crecimientoMeta - p.par.crecimientoActual);
    return {
      id: `dir-${e}-carrera`,
      burbuja: `Te faltan ${soles(falta)} de crecimiento para tu Estrella ${p.par.estrella} del PAR+.`,
      titulo: `${p.par.kicker} — ${p.par.premio}`,
      tono: 'info',
      expresion: 'normal',
      meta: {
        etiqueta: 'Crecimiento de Grupo Familiar (PAR+)',
        actual: p.par.crecimientoActual,
        objetivo: p.par.crecimientoMeta,
        unidad: 'S/',
      },
      brechas: [
        {
          texto: `Crecimiento de GF: ${soles(p.par.crecimientoMeta)}`,
          actual: p.par.crecimientoActual,
          meta: p.par.crecimientoMeta,
          cumple: falta === 0,
          detalle: falta ? `Llevas ${soles(p.par.crecimientoActual)}` : '¡Meta lograda!',
        },
        {
          texto: `IM de Grupo Familiar ≤ ${LIMITE_IM_PAR.toFixed(2)}%`,
          cumple: p.negocio.morosidad.im <= LIMITE_IM_PAR,
          detalle: `Hoy: ${p.negocio.morosidad.im}%`,
        },
        {
          texto: 'Cuadrante A en 1 de las últimas 3 campañas',
          cumple: p.negocio.cuadrante === 'A',
          detalle: `Esta campaña vas en Cuadrante ${p.negocio.cuadrante}`,
        },
      ],
      acciones: [
        {
          emoji: '🧭',
          texto: p.norte.titulo,
          impacto: p.par.premio,
          ruta: '/n/carrera',
        },
        {
          emoji: '📈',
          texto: 'Asegura el Cuadrante A de esta campaña',
          impacto: 'Requisito PAR+ y bono campañal',
          ruta: '/n/negocio',
        },
      ],
    };
  }

  /** En Mi campaña / Pedidos manda el cierre: lo que falta, con el reloj encima. */
  private dirCampana(e: EstatusDir, ruta: string): Consejo {
    const p = PERFILES_DIR[e];
    const base = this.dirInicio(e);
    const { faltaVenta, faltanPped } = this.brechaCuadrante(p);
    const enA = p.negocio.cuadrante === 'A';
    return {
      ...base,
      id: `dir-${e}-${ruta === '/n/pedidos' ? 'pedidos' : 'campana'}`,
      burbuja: enA
        ? `A ${DIAS_CIERRE_DIR} días del cierre, tu bono de ${soles(p.negocio.bono)} sigue asegurado.`
        : `A ${DIAS_CIERRE_DIR} días del cierre: ${this.faltantes(faltaVenta, faltanPped)} para tu bono.`,
      titulo: `Cierre de campaña en ${DIAS_CIERRE_DIR} días`,
      tono: enA ? 'success' : 'danger',
      expresion: enA ? 'celebra' : 'alerta',
    };
  }

  /** Brecha campañal de la Directora: la vara del Cuadrante A de su estatus. */
  private brechaCuadrante(p: PerfilDir): { faltaVenta: number; faltanPped: number } {
    return {
      faltaVenta: Math.max(0, p.cuadranteA.venta - p.negocio.ventaGP),
      faltanPped: Math.max(0, p.cuadranteA.pped - p.negocio.pped),
    };
  }

  private brechasCuadrante(p: PerfilDir): BrechaConsejo[] {
    const { faltaVenta, faltanPped } = this.brechaCuadrante(p);
    return [
      {
        texto: `Venta GP ≥ ${soles(p.cuadranteA.venta)} (MRM)`,
        actual: p.negocio.ventaGP,
        meta: p.cuadranteA.venta,
        cumple: faltaVenta === 0,
        detalle: faltaVenta ? `Faltan ${soles(faltaVenta)}` : '¡Cumplido!',
      },
      {
        texto: `${p.cuadranteA.pped} primeros pedidos`,
        actual: p.negocio.pped,
        meta: p.cuadranteA.pped,
        cumple: faltanPped === 0,
        detalle: faltanPped ? `Faltan ${faltanPped} — cada incorporada cuenta` : '¡Cumplido!',
      },
    ];
  }

  private accionesDir(p: PerfilDir, faltaVenta: number, faltanPped: number): AccionConsejo[] {
    const acciones: AccionConsejo[] = [];
    if (faltaVenta > 0) {
      acciones.push({
        emoji: '🛍️',
        texto: `Empuja ${soles(faltaVenta)} de venta en tu GP`,
        impacto: `Asegura tu bono de ${soles(p.negocio.bono)}`,
        ruta: '/n/negocio',
        urgente: p.negocio.cuadrante === 'D',
      });
    }
    if (faltanPped > 0) {
      acciones.push({
        emoji: '🎯',
        texto: `Asegura ${faltanPped} primer${faltanPped > 1 ? 'os' : ''} pedido${faltanPped > 1 ? 's' : ''} más`,
        impacto: 'Requisito del Cuadrante A',
        ruta: '/n/campana',
      });
    }
    acciones.push({
      emoji: '🧭',
      texto: p.norte.titulo,
      impacto: 'Tu siguiente paso de carrera',
      ruta: '/n/carrera',
    });
    return acciones;
  }

  private metaDir(p: PerfilDir): Consejo['meta'] {
    return {
      etiqueta: 'Venta GP → Cuadrante A',
      actual: p.negocio.ventaGP,
      objetivo: p.cuadranteA.venta,
      unidad: 'S/',
    };
  }

  private tonoDir(p: PerfilDir): Consejo['tono'] {
    // El mock usa 'brand' para el Cuadrante B; el asistente lo trata como info.
    return p.negocio.tone === 'brand' ? 'info' : p.negocio.tone;
  }

  /* ========================= BDM (Staff de Ventas) ==========================
   * La meta de la BDM es el Delta del equipo (bono trimestral) y el BP. Sus
   * brechas ya vienen redactadas en CAMPANA_BDM; en Mis Directoras se derivan
   * en vivo con las funciones puras de mock-bdm (cuadranteDe, esPoderosa…). */

  private bdm(ruta: string): Consejo {
    switch (ruta) {
      case '/n/campana':
        return this.bdmCampana();
      case '/n/directoras':
        return this.bdmDirectoras();
      default:
        return this.bdmInicio();
    }
  }

  private bdmInicio(): Consejo {
    const frentes = GESTION_BDM.filter((g) => !g.positivo);
    return {
      id: 'bdm-inicio',
      burbuja: CAMPANA_BDM.delta.banner,
      titulo: `${frentes.length} frentes piden tu gestión hoy`,
      tono: 'warning',
      expresion: 'normal',
      meta: {
        etiqueta: 'Prom. trimestral de DIR en Cuadrante A',
        actual: CAMPANA_BDM.delta.promTrimestral,
        objetivo: CAMPANA_BDM.delta.bonoTramos[2].prom,
        unidad: '%',
      },
      brechas: GESTION_BDM.map((g) => ({
        texto: `${g.etiqueta}: ${g.valor}`,
        cumple: !!g.positivo,
        detalle: `Frente ${g.frente}`,
      })),
      acciones: [
        {
          emoji: '🧭',
          texto: 'Gestiona tus directoras por frente',
          impacto: 'Cuadrante, Meta, Formaciones, PAR+ y Poderosas',
          ruta: '/n/directoras',
        },
        {
          emoji: '📊',
          texto: 'Revisa las 6 cards de tu campaña',
          impacto: 'Delta, Capitalización, PAR+, Poderosas y BP',
          ruta: '/n/campana',
        },
      ],
    };
  }

  /** En Mi campaña, los banners de brecha de las cards ya dicen qué falta. */
  private bdmCampana(): Consejo {
    const c = CAMPANA_BDM;
    return {
      id: 'bdm-campana',
      burbuja: c.bp.banner,
      titulo: 'Tus bonos se juegan en estas brechas',
      tono: 'warning',
      expresion: 'alerta',
      meta: {
        etiqueta: 'Venta Neta vs Business Plan',
        actual: c.bp.real,
        objetivo: c.bp.meta,
        unidad: 'S/',
      },
      brechas: [
        { texto: c.delta.banner, cumple: false, detalle: 'Delta Campañal' },
        { texto: c.crecimiento.banner, cumple: false, detalle: 'Capitalización DIR' },
        { texto: c.par.banner, cumple: false, detalle: 'PAR+' },
        { texto: c.poderosas.banner, cumple: false, detalle: 'Líderes Poderosas' },
      ],
      acciones: [
        {
          emoji: '🎯',
          texto: 'Prioriza las DIR que mueven tu Delta',
          impacto: `Bono trimestral de hasta ${c.delta.bonoTramos[2].bono}%`,
          ruta: '/n/directoras',
          urgente: true,
        },
        {
          emoji: '🌱',
          texto: 'Impulsa a tus Potenciales Formadoras',
          impacto: c.crecimiento.banner,
          ruta: '/n/directoras',
        },
      ],
    };
  }

  /** En Mis Directoras las brechas se calculan en vivo, directora por directora. */
  private bdmDirectoras(): Consejo {
    const enD = DIRECTORAS_BDM.filter((d) => cuadranteDe(d) === 'D').length;
    const sinMeta = DIRECTORAS_BDM.filter((d) => d.activas < d.activasMeta).length;
    const formadoras = DIRECTORAS_BDM.filter(esPotencialFormadora).length;
    const poderosas = DIRECTORAS_BDM.filter(esPoderosa).length;
    return {
      id: 'bdm-directoras',
      burbuja: `Prioriza a tus ${enD} directoras en Cuadrante D — la campaña aún alcanza.`,
      titulo: 'Tu gestión de hoy, directora por directora',
      tono: enD ? 'danger' : 'success',
      expresion: enD ? 'alerta' : 'celebra',
      brechas: [
        {
          texto: 'Directoras en Cuadrante D',
          actual: enD,
          meta: 0,
          cumple: enD === 0,
          detalle: 'Sin MRM ni PPED: visita de asesoría esta semana',
        },
        {
          texto: 'Directoras bajo su meta de activas',
          actual: sinMeta,
          meta: 0,
          cumple: sinMeta === 0,
          detalle: 'Su Business Plan define la meta de cada una',
        },
        {
          texto: 'Potenciales Formadoras identificadas',
          actual: formadoras,
          cumple: formadoras > 0,
          detalle: 'Venta ≥ 1.5× MRM o CA con ASP — mueven tu Capitalización',
        },
        {
          texto: 'Líderes Poderosas',
          actual: poderosas,
          cumple: poderosas > 0,
          detalle: 'Ejemplo + Liderazgo en SSE+',
        },
      ],
      acciones: [
        {
          emoji: '🚨',
          texto: `Agenda asesoría con las ${enD} DIR en Cuadrante D`,
          impacto: 'Cada DIR que sube a CA mueve tu Delta',
          ruta: '/n/directoras',
          urgente: enD > 0,
        },
        {
          emoji: '🌱',
          texto: `Acompaña a tus ${formadoras} Potenciales Formadoras`,
          impacto: 'Capitalización: tu bono trimestral del 30%',
          ruta: '/n/directoras',
        },
      ],
    };
  }

  /* ------------------------------- utilitarios ------------------------------ */

  /** Cara de la mascota: celebra en éxito; alerta solo si hay algo urgente. */
  private expresionDe(
    tone: 'success' | 'warning',
    acciones: AccionConsejo[],
  ): Consejo['expresion'] {
    if (tone === 'success') return 'celebra';
    return acciones.some((a) => a.urgente) ? 'alerta' : 'normal';
  }

  /** Reordena las acciones del perfil: primero las de la página que se mira. */
  private prioriza(acciones: AccionConsejo[], ruta: string): AccionConsejo[] {
    return [...acciones].sort((a, b) => Number(b.ruta === ruta) - Number(a.ruta === ruta));
  }

  private faltantes(faltaVenta: number, faltanPped: number): string {
    const partes: string[] = [];
    if (faltaVenta > 0) partes.push(`${soles(faltaVenta)} de venta`);
    if (faltanPped > 0) partes.push(`${faltanPped} PPED`);
    return partes.join(' y ');
  }

  private plural(faltaVenta: number, faltanPped: number): string {
    return faltaVenta > 0 && faltanPped > 0 ? 'n' : '';
  }
}

/** Vara de morosidad del PAR+ 2026 (IM de Grupo Familiar ≤ 3.00%). */
const LIMITE_IM_PAR = 3.0;

/** Días al cierre de la campaña Directora — misma constante demo que usa
 *  nueva/inicio-n.ts (C6-S3; el calendario real vive en docs/). */
const DIAS_CIERRE_DIR = 9;

/** Montos en soles con separador de miles peruano. */
function soles(n: number): string {
  return `S/ ${n.toLocaleString('es-PE')}`;
}
