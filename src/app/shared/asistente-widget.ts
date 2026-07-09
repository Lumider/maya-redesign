import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsistenteService, NOMBRE_ASISTENTE } from './asistente';
import { Mascota } from './mascota';

/**
 * Yana en pantalla: el asistente vive en toda la plataforma, no es un botón.
 * Tres capas sobre la esquina inferior DERECHA (la izquierda es del conmutador
 * demo): el ancla con la mascota siempre visible, la burbuja proactiva que
 * reacciona a cada navegación con el consejo del contexto, y el panel con el
 * detalle de "qué hacer para llegar a tu meta" (progreso, brechas y acciones).
 *
 * La burbuja se auto-oculta y no repite el mismo consejo: acompaña sin
 * estorbar. "No molestar" la apaga del todo; la mascota permanece.
 */
@Component({
  selector: 'app-asistente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Mascota],
  template: `
    @if (estatico() || srv.visible()) {
      <div class="asis" [class.asis--estatico]="estatico()">
        <!-- Burbuja proactiva: una frase, un gancho. role=status para que los
             lectores de pantalla la anuncien sin robar el foco. -->
        <div role="status">
          @if (burbuja() && consejo(); as c) {
            <button class="asis__burbuja card" (click)="abrir()">
              <strong>{{ nombre }}:</strong> {{ c.burbuja }}
            </button>
          }
        </div>

        @if (abierto() && consejo(); as c) {
          <section
            class="asis__panel card"
            role="dialog"
            [attr.aria-label]="'Consejo de ' + nombre"
            (keydown.escape)="cerrar()"
          >
            <header class="asis__head">
              <app-mascota [expresion]="c.expresion" [size]="40" />
              <div class="asis__headtxt">
                <span class="asis__kicker">{{ nombre }} te acompaña</span>
                <h2 class="asis__titulo">{{ c.titulo }}</h2>
              </div>
              <button
                class="asis__cerrar"
                #cerrarBtn
                (click)="cerrar()"
                aria-label="Cerrar consejo"
              >
                ×
              </button>
            </header>

            @if (c.meta; as m) {
              <div class="asis__meta">
                <div class="asis__metatop">
                  <span>{{ m.etiqueta }}</span>
                  <strong>{{ fmt(m.actual, m.unidad) }} / {{ fmt(m.objetivo, m.unidad) }}</strong>
                </div>
                <div
                  class="asis__barra"
                  role="progressbar"
                  [attr.aria-valuenow]="pct(m)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-label]="m.etiqueta"
                >
                  <div class="asis__fill" [style.width.%]="pct(m)"></div>
                </div>
              </div>
            }

            <ul class="asis__reqs">
              @for (b of c.brechas; track b.texto) {
                <li class="asis__req">
                  <span class="asis__check" [class.asis__check--ok]="b.cumple" aria-hidden="true">
                    {{ b.cumple ? '✓' : '!' }}
                  </span>
                  <div>
                    <span class="asis__reqtxt">{{ b.texto }}</span>
                    @if (b.detalle) {
                      <span class="asis__reqdet">{{ b.detalle }}</span>
                    }
                  </div>
                </li>
              }
            </ul>

            @if (c.acciones.length) {
              <span class="asis__grupo">Qué hacer hoy</span>
              <div class="asis__accs">
                @for (a of c.acciones; track a.texto) {
                  <a class="asis__acc" [routerLink]="a.ruta" (click)="cerrar()">
                    <span class="asis__emoji" aria-hidden="true">{{ a.emoji }}</span>
                    <span class="asis__acctxt">
                      {{ a.texto }}
                      @if (a.impacto) {
                        <span class="asis__impacto">{{ a.impacto }}</span>
                      }
                    </span>
                    @if (a.urgente) {
                      <span class="badge badge--danger">Hoy</span>
                    }
                  </a>
                }
              </div>
            }

            <footer class="asis__pie">
              <label class="asis__silencio">
                <input
                  type="checkbox"
                  [checked]="srv.silencio()"
                  (change)="srv.setSilencio(!srv.silencio())"
                />
                No molestar (sin burbujas automáticas)
              </label>
            </footer>
          </section>
        }

        <!-- Ancla: la mascota siempre presente. Abre/cierra el panel. -->
        <button
          class="asis__ancla"
          #anclaBtn
          (click)="alternar()"
          [attr.aria-expanded]="abierto()"
          [attr.aria-label]="'Asistente ' + nombre"
        >
          <app-mascota [expresion]="consejo()?.expresion ?? 'normal'" [size]="42" />
        </button>
      </div>
    }
  `,
  styles: [
    `
      .asis {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 70;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      /* Modo galería (/ui): el mismo widget, sin flotar ni burbujear. */
      .asis--estatico {
        position: static;
        align-items: flex-start;
      }

      .asis__ancla {
        width: 54px;
        height: 54px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        box-shadow: var(--shadow-l);
        cursor: pointer;
        transition:
          transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.2s ease;
      }
      .asis__ancla:hover {
        transform: translateY(-2px) scale(1.04);
      }

      .asis__burbuja {
        max-width: min(280px, calc(100vw - 96px));
        padding: 10px 13px;
        font-size: 13px;
        line-height: 1.45;
        text-align: left;
        color: var(--ink);
        border-radius: 14px 14px 4px 14px;
        box-shadow: var(--shadow-l);
        cursor: pointer;
        animation: asis-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .asis__burbuja strong {
        color: var(--brand-600);
      }

      .asis__panel {
        width: min(330px, calc(100vw - 32px));
        max-height: min(70vh, 520px);
        overflow: auto;
        padding: 14px;
        box-shadow: var(--shadow-l);
        animation: asis-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .asis__head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .asis__headtxt {
        flex: 1;
        min-width: 0;
      }
      .asis__kicker {
        display: block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--brand-600);
      }
      .asis__titulo {
        margin: 2px 0 0;
        font-size: 14.5px;
        line-height: 1.3;
        font-weight: 800;
      }
      .asis__cerrar {
        border: 0;
        background: none;
        color: var(--ink-2);
        font-size: 20px;
        line-height: 1;
        padding: 2px 8px;
        border-radius: var(--radius-s);
        cursor: pointer;
      }
      .asis__cerrar:hover {
        background: var(--sand);
      }

      .asis__meta {
        margin-top: 12px;
      }
      .asis__metatop {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 11.5px;
        color: var(--ink-2);
        margin-bottom: 5px;
      }
      .asis__metatop strong {
        color: var(--ink);
        white-space: nowrap;
      }
      .asis__barra {
        height: 8px;
        border-radius: 99px;
        background: var(--sand);
        overflow: hidden;
      }
      .asis__fill {
        height: 100%;
        border-radius: 99px;
        background: var(--brand-grad-strong);
        transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .asis__reqs {
        list-style: none;
        margin: 12px 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .asis__req {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .asis__check {
        flex: none;
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 800;
        background: var(--warning-bg);
        color: var(--warning);
      }
      .asis__check--ok {
        background: var(--success-bg);
        color: var(--success);
      }
      .asis__reqtxt {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.35;
      }
      .asis__reqdet {
        display: block;
        font-size: 11.5px;
        color: var(--ink-3);
        line-height: 1.35;
      }

      .asis__grupo {
        display: block;
        margin-top: 14px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .asis__accs {
        margin-top: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .asis__acc {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        text-decoration: none;
        color: var(--ink);
        transition:
          border-color 0.15s ease,
          background 0.15s ease;
      }
      .asis__acc:hover {
        border-color: var(--brand-400);
        background: var(--brand-50);
      }
      .asis__emoji {
        font-size: 15px;
        line-height: 1.3;
      }
      .asis__acctxt {
        flex: 1;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.35;
      }
      .asis__impacto {
        display: block;
        font-size: 11.5px;
        font-weight: 500;
        color: var(--ink-3);
      }

      .asis__pie {
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid var(--line);
      }
      .asis__silencio {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11.5px;
        color: var(--ink-2);
        cursor: pointer;
      }

      @keyframes asis-pop {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }

      /* Móvil: por encima del bottom-nav fijo (mismo ajuste que el conmutador). */
      @media (max-width: 720px) {
        .asis {
          bottom: calc(72px + env(safe-area-inset-bottom));
        }
        .asis--estatico {
          bottom: auto;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .asis__burbuja,
        .asis__panel {
          animation: none;
        }
        .asis__ancla,
        .asis__fill {
          transition: none;
        }
      }
    `,
  ],
})
export class AsistenteWidget {
  protected readonly srv = inject(AsistenteService);
  protected readonly nombre = NOMBRE_ASISTENTE;

  /** Modo galería (/ui): posición estática, panel abierto y sin burbuja automática. */
  readonly estatico = input(false);

  protected readonly abierto = signal(false);
  protected readonly burbuja = signal(false);
  protected readonly consejo = computed(() => this.srv.principal());

  private readonly cerrarBtn = viewChild<ElementRef<HTMLButtonElement>>('cerrarBtn');
  private readonly anclaBtn = viewChild<ElementRef<HTMLButtonElement>>('anclaBtn');
  /** Último consejo burbujeado: la misma navegación no insiste dos veces. */
  private ultimoId = '';

  constructor() {
    // La burbuja reacciona al cambio de consejo (ruta/audiencia/estatus nuevos).
    // Vive en un effect con cleanup para no filtrar timers al navegar rápido.
    effect((onCleanup) => {
      const c = this.srv.principal();
      if (!c || this.estatico()) return;
      if (!this.srv.visible() || this.srv.silencio() || this.abierto()) return;
      if (c.id === this.ultimoId) return;
      this.ultimoId = c.id;
      this.burbuja.set(true);
      const timer = setTimeout(() => this.burbuja.set(false), 8000);
      onCleanup(() => clearTimeout(timer));
    });
    // En la galería el panel se muestra abierto de entrada.
    effect(() => {
      if (this.estatico()) this.abierto.set(true);
    });
  }

  protected alternar(): void {
    if (this.abierto()) this.cerrar();
    else this.abrir();
  }

  protected abrir(): void {
    this.burbuja.set(false);
    this.abierto.set(true);
    // El foco entra al panel (botón cerrar) cuando ya está en el DOM.
    setTimeout(() => this.cerrarBtn()?.nativeElement.focus());
  }

  protected cerrar(): void {
    this.abierto.set(false);
    if (!this.estatico()) this.anclaBtn()?.nativeElement.focus();
  }

  /** % de avance hacia la meta, acotado a 100. */
  protected pct(m: { actual: number; objetivo: number }): number {
    if (!m.objetivo) return 0;
    return Math.min(100, Math.round((m.actual / m.objetivo) * 100));
  }

  /** Formatea la cifra de la meta con su unidad (S/ delante; % detrás). */
  protected fmt(n: number, unidad?: string): string {
    const v = n.toLocaleString('es-PE');
    if (unidad === 'S/') return `S/ ${v}`;
    return unidad ? `${v}${unidad}` : v;
  }
}
