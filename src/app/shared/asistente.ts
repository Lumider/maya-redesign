import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import type { EstatusDir } from '../data/mock-dir';
import {
  AudienciaService,
  EstatusDirService,
  EstatusService,
  type Audiencia,
  type Estatus,
} from './estatus';
import { MotorReglas } from './asistente-reglas';

/**
 * Nombre visible del asistente (proyecto interno "Clippy"). Vive en una sola
 * constante para poder renombrarlo sin tocar componentes ni reglas: el copy
 * de burbuja, panel y conmutador lo referencian desde aquí.
 */
export const NOMBRE_ASISTENTE = 'Yana';

/**
 * Contexto que ve el asistente en cada momento: dónde está la usuaria (ruta),
 * quién es (audiencia) y en qué peldaño de su carrera está (estatus). Con estas
 * tres piezas el cerebro decide qué consejo dar — la misma página dice cosas
 * distintas a una CNS que a una Directora Regional.
 */
export interface ContextoAsistente {
  /** Path limpio, sin query ni hash (p. ej. '/n/negocio'). */
  ruta: string;
  audiencia: Audiencia;
  /** Estatus fino de la audiencia activa (CNS→ASP, JNR→REG o BDM). */
  estatus: Estatus | EstatusDir | 'BDM';
}

/** Requisito o brecha hacia la meta: qué pide, cómo va y si ya está cumplido. */
export interface BrechaConsejo {
  texto: string;
  actual?: number;
  meta?: number;
  cumple: boolean;
  detalle?: string;
}

/** Acción concreta y accionable: qué hacer, qué impacto tiene y a dónde lleva. */
export interface AccionConsejo {
  emoji: string;
  texto: string;
  impacto?: string;
  ruta: string;
  urgente?: boolean;
}

/**
 * Un consejo completo del asistente. La `burbuja` es la frase proactiva que
 * aparece al navegar (una sola línea, gancho); el resto alimenta el panel
 * expandido: el detalle de "qué hacer para llegar a tu meta".
 */
export interface Consejo {
  /** Identidad del consejo (ruta+estatus): evita re-mostrar la misma burbuja. */
  id: string;
  burbuja: string;
  titulo: string;
  tono: 'success' | 'warning' | 'danger' | 'info';
  /** Qué cara pone la mascota al darlo. */
  expresion: 'normal' | 'celebra' | 'alerta';
  /** Progreso principal hacia la meta de campaña (barra del panel). */
  meta?: { etiqueta: string; actual: number; objetivo: number; unidad?: string };
  brechas: BrechaConsejo[];
  acciones: AccionConsejo[];
}

/**
 * Contrato del cerebro del asistente — el único punto de swap de la fase 2.
 * Fase 1: MotorReglas (determinista y síncrono sobre los datos mock).
 * Fase 2 (LLM): mantener este contrato y resolver la asincronía DENTRO del
 * servicio (resource/signal que se actualiza al llegar la respuesta), para que
 * el widget siga leyendo `consejos()` sin enterarse del cambio de cerebro.
 */
export interface CerebroAsistente {
  consejosPara(ctx: ContextoAsistente): Consejo[];
}

const KEY_ACTIVA = 'maya-asistente-activo';
const KEY_SILENCIO = 'maya-asistente-silencio';

/**
 * Estado global del asistente: contexto reactivo (ruta × audiencia × estatus),
 * consejos vigentes y preferencias de la demo. Servicio único para que la
 * burbuja, el panel y el botón "Activar Yana" del conmutador compartan estado.
 *
 * `activa` arranca en false a propósito: la app carga como hoy y en la
 * presentación se enciende el asistente en vivo (efecto revelación). Ambas
 * preferencias se recuerdan por dispositivo, como el resto de la demo.
 */
@Injectable({ providedIn: 'root' })
export class AsistenteService {
  private readonly router = inject(Router);
  private readonly audiencia = inject(AudienciaService);
  private readonly emp = inject(EstatusService);
  private readonly dir = inject(EstatusDirService);
  /** Cerebro vigente. Cambiar esta línea (o proveer otro CerebroAsistente) es
   *  todo lo que pide la fase 2 — el resto del servicio y el widget no se tocan. */
  private readonly motor: CerebroAsistente = inject(MotorReglas);

  /** URL actual como signal (mismo patrón que el shell en app.ts). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** El asistente está encendido (botón "Activar Yana" del conmutador demo). */
  readonly activa = signal<boolean>(this.leer(KEY_ACTIVA));
  /** "No molestar": apaga solo la burbuja proactiva; la mascota queda. */
  readonly silencio = signal<boolean>(this.leer(KEY_SILENCIO));

  readonly contexto = computed<ContextoAsistente>(() => {
    const ruta = (this.url().split(/[?#]/)[0] || '/').replace(/\/$/, '') || '/';
    const audiencia = this.audiencia.tipo();
    const estatus =
      audiencia === 'bdm'
        ? 'BDM'
        : audiencia === 'emprendedora'
          ? this.emp.estatus()
          : this.dir.estatus();
    return { ruta, audiencia, estatus };
  });

  /** Consejos vigentes para el contexto actual (el primero es el principal). */
  readonly consejos = computed<Consejo[]>(() => this.motor.consejosPara(this.contexto()));
  readonly principal = computed<Consejo | undefined>(() => this.consejos()[0]);

  /** Visible solo activada Y en la vista nueva — una regla cubre /ui, /externa
   *  y toda la vista actual, que quedan intactas. */
  readonly visible = computed(() => this.activa() && this.contexto().ruta.startsWith('/n/'));

  setActiva(v: boolean): void {
    this.activa.set(v);
    this.guardar(KEY_ACTIVA, v);
  }

  toggleActiva(): boolean {
    const v = !this.activa();
    this.setActiva(v);
    return v;
  }

  setSilencio(v: boolean): void {
    this.silencio.set(v);
    this.guardar(KEY_SILENCIO, v);
  }

  private leer(key: string): boolean {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  }

  private guardar(key: string, v: boolean): void {
    try {
      localStorage.setItem(key, v ? '1' : '0');
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
