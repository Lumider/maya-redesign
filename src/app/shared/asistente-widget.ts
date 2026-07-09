import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
 * La "vida" del personaje (referencia: cloudstudio.es) vive aquí, no en la
 * mascota: este contenedor escucha el cursor (rAF-throttled, solo mientras el
 * widget existe) y le entrega la mirada; escenifica la conversación con
 * puntos de "escribiendo…", texto a máquina, un salto de atención al hablar
 * y un saludo la primera vez que se activa. prefers-reduced-motion lo apaga.
 *
 * La burbuja se auto-oculta y no repite el mismo consejo: acompaña sin
 * estorbar. "No molestar" la apaga del todo; la mascota permanece.
 *
 * Dos colocaciones (`modo`): 'header' (oficial) integra el ancla en el header
 * nav del shell y despliega burbuja/panel como dropdown bajo él — Yana se
 * siente parte del producto y no tapa contenido ni bottom-nav; 'flotante'
 * (la colocación anterior, esquina inferior derecha) se conserva como
 * referencia del proceso FrYDA. El alcance es el mismo en ambas: el widget
 * vive en el shell y el cerebro es global.
 */
@Component({
  selector: 'app-asistente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Mascota],
  template: `
    @if (estatico() || srv.visible()) {
      <div class="asis" [class.asis--estatico]="estatico()" [class.asis--header]="enHeader()">
        <!-- Burbuja proactiva: una frase, un gancho. role=status para que los
             lectores anuncien el mensaje completo (span oculto) sin oír el
             goteo del efecto máquina de escribir, que es solo visual. -->
        <div role="status">
          @if (burbuja()) {
            <button
              class="asis__burbuja card"
              (click)="abrir()"
              [style.top.px]="enHeader() ? topDrop() : null"
            >
              <span class="sr-solo">{{ nombre }}: {{ burbujaTexto() }}</span>
              <span aria-hidden="true">
                <strong>{{ nombre }}:</strong>
                @if (escribiendo()) {
                  <span class="asis__dots"><i></i><i></i><i></i></span>
                } @else {
                  {{ texto() }}
                }
              </span>
            </button>
          }
        </div>

        @if (abierto() && consejo(); as c) {
          <section
            class="asis__panel card"
            role="dialog"
            [attr.aria-label]="'Consejo de ' + nombre"
            (keydown.escape)="cerrar()"
            [style.top.px]="enHeader() ? topDrop() : null"
          >
            <header class="asis__head">
              <app-mascota
                [expresion]="c.expresion"
                [size]="40"
                [animada]="!estatico()"
                [mirada]="mirada()"
              />
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
          [class.asis__ancla--salta]="salta()"
          #anclaBtn
          (click)="alternar()"
          [attr.aria-expanded]="abierto()"
          [attr.aria-label]="'Asistente ' + nombre"
        >
          <app-mascota
            [expresion]="consejo()?.expresion ?? 'normal'"
            [size]="enHeader() ? 30 : 42"
            [animada]="!estatico()"
            [mirada]="mirada()"
          />
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

      /* Modo header: el ancla entra al flujo del header nav; burbuja y panel
         se despliegan como dropdown bajo él (fixed — el header es sticky, así
         que la posición medida del ancla es estable y no depende del scroll). */
      .asis--header {
        position: static;
        display: inline-flex;
        align-items: center;
      }
      .asis--header .asis__ancla {
        width: 38px;
        height: 38px;
        box-shadow: none;
        border-color: var(--line);
        background: none;
      }
      .asis--header .asis__ancla:hover {
        transform: none;
        background: var(--sand);
      }
      .asis--header .asis__burbuja,
      .asis--header .asis__panel {
        position: fixed;
        right: 12px;
        z-index: 80;
      }
      .asis--header .asis__burbuja {
        border-radius: 4px 14px 14px 14px;
      }

      .sr-solo {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
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
      /* Salto de atención: la mascota "te llama" justo antes de hablar. */
      .asis__ancla--salta {
        animation: asis-salta 0.55s cubic-bezier(0.28, 1.6, 0.4, 1);
      }

      .asis__burbuja {
        max-width: min(280px, calc(100vw - 96px));
        min-width: 130px;
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

      /* "Escribiendo…": tres puntos que laten mientras Yana piensa. */
      .asis__dots {
        display: inline-flex;
        gap: 4px;
        margin-left: 4px;
        vertical-align: middle;
      }
      .asis__dots i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ink-3);
        animation: asis-dot 1s ease-in-out infinite;
      }
      .asis__dots i:nth-child(2) {
        animation-delay: 0.15s;
      }
      .asis__dots i:nth-child(3) {
        animation-delay: 0.3s;
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
      @keyframes asis-salta {
        0%,
        100% {
          transform: translateY(0);
        }
        35% {
          transform: translateY(-7px);
        }
        65% {
          transform: translateY(1px);
        }
      }
      @keyframes asis-dot {
        0%,
        100% {
          opacity: 0.35;
          transform: translateY(0);
        }
        40% {
          opacity: 1;
          transform: translateY(-2px);
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
        .asis__panel,
        .asis__ancla--salta,
        .asis__dots i {
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
  private readonly destroyRef = inject(DestroyRef);

  /** Modo galería (/ui): posición estática, panel abierto y sin burbuja automática. */
  readonly estatico = input(false);
  /** Colocación: 'header' (ancla en el header nav, dropdown) o 'flotante' (anterior). */
  readonly modo = input<'flotante' | 'header'>('flotante');
  protected readonly enHeader = computed(() => this.modo() === 'header' && !this.estatico());
  /** Borde superior del dropdown en modo header (bajo el ancla, medido). */
  protected readonly topDrop = signal(64);

  protected readonly abierto = signal(false);
  protected readonly burbuja = signal(false);
  /** Texto completo del mensaje vigente (para lectores de pantalla). */
  protected readonly burbujaTexto = signal('');
  /** Porción ya "escrita" del mensaje (efecto máquina, solo visual). */
  protected readonly texto = signal('');
  /** Fase de puntos "escribiendo…" previa al texto. */
  protected readonly escribiendo = signal(false);
  /** Salto de atención del ancla al anunciar un mensaje. */
  protected readonly salta = signal(false);
  /** Hacia dónde mira la mascota (vector normalizado ancla→cursor). */
  protected readonly mirada = signal<{ x: number; y: number } | null>(null);
  protected readonly consejo = computed(() => this.srv.principal());

  private readonly cerrarBtn = viewChild<ElementRef<HTMLButtonElement>>('cerrarBtn');
  private readonly anclaBtn = viewChild<ElementRef<HTMLButtonElement>>('anclaBtn');
  /** Último consejo burbujeado: la misma navegación no insiste dos veces. */
  private ultimoId = '';
  /** El saludo de activación se dice una sola vez por carga. */
  private saludo = false;
  /** El sistema pide quietud: sin typewriter, sin mirada, sin saltos. */
  private readonly quieto =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private tecleo?: ReturnType<typeof setInterval>;

  constructor() {
    this.destroyRef.onDestroy(() => this.pararTimers());

    // La burbuja reacciona al cambio de consejo (ruta/audiencia/estatus nuevos).
    // La primera vez que Yana existe, saluda antes del consejo contextual:
    // escenifica la "revelación" de la demo.
    effect(() => {
      const c = this.srv.principal();
      if (!c || this.estatico()) return;
      if (!this.srv.visible() || this.srv.silencio() || this.abierto()) return;
      if (c.id === this.ultimoId) return;
      this.ultimoId = c.id;
      if (!this.saludo) {
        this.saludo = true;
        this.di(`¡Hola! Soy ${this.nombre} 👋 Te acompaño a tu meta de campaña.`, 3800, () =>
          this.di(c.burbuja),
        );
      } else {
        this.di(c.burbuja);
      }
    });

    // Mirada al cursor: listener global SOLO mientras el widget flota visible.
    // rAF-throttle (un cálculo por frame como máximo) y regreso al frente tras
    // 2.5s de quietud. En táctil no hay pointermove sostenido: no aplica solo.
    effect((onCleanup) => {
      if (this.estatico() || !this.srv.visible() || this.quieto) {
        this.mirada.set(null);
        return;
      }
      let raf = 0;
      let reposo: ReturnType<typeof setTimeout> | undefined;
      const sigue = (e: PointerEvent) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const ancla = this.anclaBtn()?.nativeElement;
          if (!ancla) return;
          const r = ancla.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          this.mirada.set({
            x: Math.max(-1, Math.min(1, (e.clientX - cx) / 260)),
            y: Math.max(-1, Math.min(1, (e.clientY - cy) / 260)),
          });
          clearTimeout(reposo);
          reposo = setTimeout(() => this.mirada.set(null), 2500);
        });
      };
      document.addEventListener('pointermove', sigue, { passive: true });
      onCleanup(() => {
        document.removeEventListener('pointermove', sigue);
        cancelAnimationFrame(raf);
        clearTimeout(reposo);
      });
    });
  }

  /**
   * Escenifica un mensaje: salto de atención → puntos de "escribiendo…" →
   * texto a máquina → auto-ocultar (contado desde que TERMINA de escribir).
   * Con prefers-reduced-motion todo es instantáneo. `luego` encadena el
   * siguiente mensaje (saludo → consejo contextual).
   */
  private di(mensaje: string, visibleMs = 8000, luego?: () => void): void {
    this.pararTimers();
    this.ajustaTop();
    this.burbujaTexto.set(mensaje);
    this.burbuja.set(true);
    this.salta.set(true);
    this.timers.push(setTimeout(() => this.salta.set(false), 600));

    const despedir = () =>
      this.timers.push(
        setTimeout(() => {
          this.burbuja.set(false);
          luego?.();
        }, visibleMs),
      );

    if (this.quieto) {
      this.escribiendo.set(false);
      this.texto.set(mensaje);
      despedir();
      return;
    }

    this.texto.set('');
    this.escribiendo.set(true);
    this.timers.push(
      setTimeout(() => {
        this.escribiendo.set(false);
        let i = 0;
        this.tecleo = setInterval(() => {
          i++;
          this.texto.set(mensaje.slice(0, i));
          if (i >= mensaje.length) {
            clearInterval(this.tecleo);
            despedir();
          }
        }, 16);
      }, 400),
    );
  }

  private pararTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    clearInterval(this.tecleo);
  }

  protected alternar(): void {
    if (this.abierto()) this.cerrar();
    else this.abrir();
  }

  /** Mide dónde termina el ancla para colgar el dropdown justo debajo. */
  private ajustaTop(): void {
    if (!this.enHeader()) return;
    const r = this.anclaBtn()?.nativeElement.getBoundingClientRect();
    if (r) this.topDrop.set(Math.round(r.bottom + 10));
  }

  protected abrir(): void {
    this.pararTimers();
    this.ajustaTop();
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
