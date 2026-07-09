import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PERFILES } from '../data/mock-ces';
import { PERFIL_BDM } from '../data/mock-bdm';
import { ESTATUS_DIR_ORDEN, PERFILES_DIR, type EstatusDir } from '../data/mock-dir';
import {
  AudienciaService,
  ESTATUS_ORDEN,
  EstatusDirService,
  EstatusService,
  type Estatus,
} from './estatus';
import { AsistenteService, NOMBRE_ASISTENTE } from './asistente';

/**
 * Conmutador global de la demo: toda la carrera Yanbal en un solo panel.
 * Encarna a la usuaria en cualquier estatus — CNS→ASP (Emprendedoras) o
 * JNR→REG (Directoras) — y la app entera se adapta: audiencia, navegación,
 * indicadores y páginas. Si la ruta actual no existe para el estatus elegido
 * (p. ej. "Mi grupo" siendo CNS), regresa al inicio.
 */
@Component({
  selector: 'app-estatus-switch-global',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (abierto()) {
      <div class="sw card" role="group" aria-label="Cambiar estatus (demo)">
        <div class="sw__top">
          <span class="sw__title">Ver como <span class="sw__beta">demo</span></span>
          <button class="sw__min" (click)="abierto.set(false)" aria-label="Minimizar conmutador">
            –
          </button>
        </div>

        <span class="sw__grupo">Emprendedoras</span>
        <div class="sw__chips">
          @for (e of ordenEmp; track e) {
            <button
              class="sw__chip"
              [class.sw__chip--on]="actual() === e"
              (click)="verEmp(e)"
              [attr.aria-pressed]="actual() === e"
            >
              {{ e }}
            </button>
          }
        </div>

        <span class="sw__grupo">Directoras</span>
        <div class="sw__chips">
          @for (e of ordenDir; track e) {
            <button
              class="sw__chip"
              [class.sw__chip--on]="actual() === e"
              (click)="verDir(e)"
              [attr.aria-pressed]="actual() === e"
            >
              {{ e }}
            </button>
          }
        </div>

        <span class="sw__grupo">Staff de Ventas</span>
        <div class="sw__chips">
          <button
            class="sw__chip"
            [class.sw__chip--on]="actual() === 'BDM'"
            (click)="verBdm()"
            [attr.aria-pressed]="actual() === 'BDM'"
          >
            BDM
          </button>
        </div>

        <span class="sw__grupo">Asistente (proyecto Clippy)</span>
        <button
          class="sw__yana"
          [class.sw__yana--on]="asistente.activa()"
          (click)="asistente.toggleActiva()"
          [attr.aria-pressed]="asistente.activa()"
        >
          {{
            asistente.activa()
              ? '✨ ' + nombreAsistente + ' activada'
              : 'Activar ' + nombreAsistente
          }}
        </button>

        <p class="sw__desc">{{ descripcion() }}</p>
      </div>
    } @else {
      <button
        class="sw-mini card"
        (click)="abierto.set(true)"
        aria-label="Abrir conmutador de estatus"
      >
        👤 {{ actual() }}
      </button>
    }
  `,
  styles: [
    `
      .sw {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 70;
        width: 238px;
        padding: 12px 14px;
        box-shadow: var(--shadow-l);
      }
      .sw__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sw__title {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .sw__beta {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: var(--brand-100);
        color: var(--brand-700);
        padding: 1px 5px;
        border-radius: 99px;
      }
      .sw__min {
        border: 0;
        background: none;
        color: var(--ink-2);
        font-size: 16px;
        line-height: 1;
        padding: 2px 8px;
        border-radius: var(--radius-s);
      }
      .sw__min:hover {
        background: var(--sand);
      }
      .sw__grupo {
        display: block;
        margin-top: 10px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .sw__chips {
        display: flex;
        gap: 6px;
        margin-top: 5px;
      }
      .sw__chip {
        flex: 1;
        padding: 7px 0;
        border-radius: var(--radius-s);
        font-size: 12px;
        font-weight: 800;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .sw__chip:hover {
        border-color: var(--ink);
        color: var(--ink);
      }
      .sw__chip--on {
        background: var(--brand-grad-strong);
        border-color: transparent;
        color: #fff;
      }
      /* Interruptor de Yana: mismo lenguaje que los chips, a lo ancho. El estado
         encendido usa el gradiente de marca para leerse "en vivo" en la demo. */
      .sw__yana {
        width: 100%;
        margin-top: 5px;
        padding: 7px 0;
        border-radius: var(--radius-s);
        font-size: 12px;
        font-weight: 800;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .sw__yana:hover {
        border-color: var(--ink);
        color: var(--ink);
      }
      .sw__yana--on {
        background: var(--brand-grad-strong);
        border-color: transparent;
        color: #fff;
      }

      .sw__desc {
        margin: 9px 0 0;
        font-size: 11.5px;
        color: var(--ink-3);
        line-height: 1.4;
      }

      .sw-mini {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 70;
        padding: 9px 14px;
        font-size: 12.5px;
        font-weight: 800;
        border-radius: 99px;
        box-shadow: var(--shadow);
        color: var(--ink);
      }

      /* Móvil: por encima del bottom-nav fijo */
      @media (max-width: 720px) {
        .sw,
        .sw-mini {
          bottom: calc(72px + env(safe-area-inset-bottom));
        }
      }
    `,
  ],
})
export class EstatusSwitchGlobal {
  private readonly router = inject(Router);
  protected readonly audiencia = inject(AudienciaService);
  protected readonly emp = inject(EstatusService);
  protected readonly dir = inject(EstatusDirService);
  protected readonly asistente = inject(AsistenteService);
  protected readonly nombreAsistente = NOMBRE_ASISTENTE;

  protected readonly ordenEmp = ESTATUS_ORDEN;
  protected readonly ordenDir = ESTATUS_DIR_ORDEN;
  protected readonly abierto = signal(true);

  /** Estatus encarnado ahora mismo (de la audiencia activa). */
  protected readonly actual = computed(() => {
    switch (this.audiencia.tipo()) {
      case 'emprendedora':
        return this.emp.estatus();
      case 'bdm':
        return 'BDM';
      default:
        return this.dir.estatus();
    }
  });

  protected readonly descripcion = computed(() => {
    switch (this.audiencia.tipo()) {
      case 'emprendedora': {
        const p = PERFILES[this.emp.estatus()];
        return `${p.nombreNivel} — ${p.resumen}`;
      }
      case 'bdm':
        return `${PERFIL_BDM.nombreNivel} — ${PERFIL_BDM.resumen}`;
      default: {
        const p = PERFILES_DIR[this.dir.estatus()];
        return `${p.nombreNivel} — ${p.resumen}`;
      }
    }
  });

  protected verEmp(e: Estatus): void {
    this.emp.set(e);
    this.audiencia.set('emprendedora');
    this.regresarSiNoExiste([
      '/n/inicio',
      '/n/campana',
      ...(PERFILES[e].capacidades.grupo ? ['/n/grupo'] : []),
      ...(PERFILES[e].capacidades.incorpora ? ['/n/incorpora'] : []),
      '/n/camino',
    ]);
  }

  protected verDir(e: EstatusDir): void {
    this.dir.set(e);
    this.audiencia.set('directora');
    this.regresarSiNoExiste([
      '/n/inicio',
      '/n/negocio',
      '/n/campana',
      ...(PERFILES_DIR[e].capacidades.equipo ? ['/n/equipo'] : []),
      '/n/carrera',
      '/n/herramientas',
    ]);
  }

  /** Encarna a la BDM (Staff de Ventas): Inicio, Mi campaña y Mis Directoras. */
  protected verBdm(): void {
    this.audiencia.set('bdm');
    this.regresarSiNoExiste(['/n/inicio', '/n/campana', '/n/directoras', '/n/herramientas']);
  }

  /** Si la vista actual no existe para el estatus elegido, vuelve al inicio. */
  private regresarSiNoExiste(rutasValidas: string[]): void {
    if (!rutasValidas.includes(this.router.url)) {
      this.router.navigateByUrl('/n/inicio');
    }
  }
}
