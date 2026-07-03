import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { EstatusDirService } from '../shared/estatus';
import { CAMPANA, CUADRANTE_HISTORIA, RECONOCIMIENTOS } from '../data/mock';
import { PERFILES_DIR } from '../data/mock-dir';

/**
 * Mi negocio (mide): la salud del negocio de la DIRECTORA esta campaña, con la
 * vara del Cuadrante A de su estatus (PAR+ 2026 Perú). Cada estatus de la demo
 * muestra un cuadrante distinto — la matriz completa se recorre con el conmutador.
 * Cada cifra vive en un solo lugar:
 *  · El Cuadrante se muestra una vez (hero + su posición en la matriz).
 *  · Un único % grande = el MRM (define cuadrante y bono).
 *  · Deuda / IM / crédito viven solo en el lateral.
 *  · "Resultados clave" = solo lo que no está en el hero ni el lateral.
 */
@Component({
  selector: 'app-negocio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Ring, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi negocio</nav>
        <h1 class="v2-title">Mi negocio</h1>
        <p class="v2-sub">Cómo está la salud de tu negocio esta campaña.</p>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" appAnchor="cuadrante">Cuadrante</a>
          <a class="anchor" appAnchor="resultados">Resultados clave</a>
          <a class="anchor" appAnchor="deuda">Morosidad y deuda</a>
          <a class="anchor anchor--ext">Reportes</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Hero de estado: el Cuadrante como veredicto (una sola vez, grande) + CTA -->
          <section
            id="cuadrante"
            class="card pad hero-estado v2-section"
            [class]="'hero-estado--' + n().tone"
            appReveal
          >
            <div class="hero-estado__q">{{ n().cuadrante }}</div>
            <div class="hero-estado__body">
              <span class="badge" [class]="'badge--' + n().tone">{{ n().badge }}</span>
              <h2 class="hero-estado__t">{{ n().titulo }}</h2>
              <p class="muted">{{ n().mensaje }}</p>
            </div>
            <img class="hero-estado__ill" [src]="n().icono" alt="" />
          </section>

          <!-- Matriz (posición) + anillo del MRM (único % grande) + puntos PPED -->
          <section class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="chart" [size]="18" /> ¿Dónde estás hoy?</h2>
            <div class="matrix">
              <div class="matrix__cell matrix__cell--c" [class.here]="n().cuadrante === 'C'">
                <span class="badge badge--warning">C · Recuperación</span>
                <p>Cumple PPED · no MRM</p>
                @if (n().cuadrante === 'C') {
                  <span class="here__dot"></span>
                }
              </div>
              <div class="matrix__cell matrix__cell--a" [class.here]="n().cuadrante === 'A'">
                <span class="badge badge--success">A · Crecimiento</span>
                <p>Cumple MRM + PPED</p>
                @if (n().cuadrante === 'A') {
                  <span class="here__dot"></span>
                }
              </div>
              <div class="matrix__cell matrix__cell--d" [class.here]="n().cuadrante === 'D'">
                <span class="badge badge--danger">D · Riesgo</span>
                <p>No cumple MRM ni PPED</p>
                @if (n().cuadrante === 'D') {
                  <span class="here__dot"></span>
                }
              </div>
              <div class="matrix__cell matrix__cell--b" [class.here]="n().cuadrante === 'B'">
                <span class="badge badge--brand">B · Potencial</span>
                <p>Cumple MRM · no PPED</p>
                @if (n().cuadrante === 'B') {
                  <span class="here__dot"></span>
                }
              </div>
              <div class="matrix__axis matrix__axis--y">PPED →</div>
              <div class="matrix__axis matrix__axis--x">Venta (MRM) →</div>
            </div>
            <div class="cuad-prog">
              <div class="cuad-prog__ring">
                <app-ring [pct]="mrmPct()" [size]="104" label="del MRM" [expected]="100" />
                <span class="tiny">
                  @if (faltaVenta() > 0) {
                    Faltan S/ {{ faltaVenta() | number }} (MRM S/ {{ vara().venta | number }})
                  } @else {
                    ¡MRM cumplido! (S/ {{ vara().venta | number }})
                  }
                </span>
              </div>
              <div class="cuad-prog__pped">
                <div
                  class="tiny"
                  [class.bad]="n().pped === 0"
                  [class.ok]="ppedListo()"
                  style="margin-bottom:6px;font-weight:700"
                >
                  Primeros pedidos · {{ n().pped }} de {{ vara().pped }} ·
                  {{
                    ppedListo()
                      ? 'requisito cumplido'
                      : n().pped === 0
                        ? 'te mantiene fuera del Cuadrante A'
                        : 'requisito de tu estatus'
                  }}
                </div>
                <div class="dots" [class.dots--bad]="n().pped === 0">
                  @for (s of ppedSlots(); track s) {
                    <span class="dot" [class.dot--on]="s <= n().pped">{{ s }}</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Resultados clave: solo lo que no está en el hero ni el lateral -->
          <section id="resultados" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="trending" [size]="18" /> Resultados clave</h2>
            <div class="ind-grid">
              @for (r of resultados(); track r.label) {
                <div class="tile card">
                  <div class="tile__top">
                    <span class="tile__label">{{ r.label }}</span
                    ><span class="sem" [class]="'sem--' + r.tone"></span>
                  </div>
                  <div class="tile__value">{{ r.valor }}</div>
                  <div class="tile__hint">{{ r.detalle }}</div>
                </div>
              }
            </div>
          </section>

          <!-- Historial del año -->
          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="chart" [size]="18" /> Historial del año</h2>
            <div class="card pad">
              <div class="row-between" style="margin-bottom:6px">
                <span class="tiny" style="font-weight:700"
                  >{{ enA }} de {{ completadas }} campañas en Cuadrante A</span
                >
                <span class="badge badge--brand"
                  >Excelencia GP · {{ rec.excelenciaGP.medalla }}</span
                >
              </div>
              <div class="hist__row">
                @for (h of historia; track h.campana) {
                  <div class="hist__item">
                    <span
                      class="hist__box"
                      [class.hist__box--a]="h.valor === 'A'"
                      [class.hist__box--d]="h.valor === 'D'"
                      >{{ h.valor }}</span
                    >
                    <span class="hist__c">{{ h.campana }}</span>
                  </div>
                }
              </div>
              <span class="tiny"
                >Medalla por {{ rec.excelenciaGP.cumplidas }} de {{ rec.excelenciaGP.de }} campañas
                en Cuadrante A.</span
              >
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <div id="deuda" class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="wallet" [size]="16" /> Morosidad y deuda
            </h3>
            <div class="kv">
              <span>Índice de morosidad</span
              ><strong [class.warn]="n().morosidad.im > 3" [class.ok]="n().morosidad.im <= 3"
                >{{ n().morosidad.im }}%</strong
              >
            </div>
            <div class="progress progress--im" style="margin:6px 0 10px">
              <div class="progress__fill" [style.width.%]="imPct()"></div>
            </div>
            <div class="kv">
              <span>Deuda del GP</span><strong>S/ {{ n().morosidad.deudaGP | number }}</strong>
            </div>
            <div class="kv">
              <span>Tu deuda</span
              ><strong class="bad">S/ {{ n().morosidad.miDeuda | number }}</strong>
            </div>
            @if (n().morosidad.pagoNecesario > 0) {
              <div class="alert alert--warning" style="margin:10px 0">
                <app-icon name="alert" [size]="16" /> Tu grupo necesita pagar S/
                {{ n().morosidad.pagoNecesario | number }} para un IM saludable.
              </div>
            } @else {
              <div class="alert alert--info" style="margin:10px 0">
                <app-icon name="check" [size]="16" /> IM saludable — dentro de la meta PAR+ (3%).
              </div>
            }
            <div class="acc">
              <a class="acc__link" routerLink="/n/equipo"
                ><app-icon name="wallet" [size]="15" /> Créditos por aprobar →</a
              >
              <a class="acc__link"><app-icon name="users" [size]="15" /> Contactar deudoras</a>
              <a class="acc__link"><app-icon name="chart" [size]="15" /> Calculadora de IM</a>
            </div>
          </div>

          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="wallet" [size]="16" /> Crédito Yanbal
            </h3>
            <div class="row-between">
              <span class="badge badge--success">{{ n().credito.estado }}</span>
            </div>
            <div style="display:flex;gap:16px;align-items:center;margin-top:10px">
              <app-ring [pct]="credPct()" [size]="92" label="usado" [expected]="0" />
              <div>
                <div class="kv">
                  <span>Disponible</span><strong>S/ {{ n().credito.disponible | number }}</strong>
                </div>
                <div class="kv">
                  <span>Total</span><strong>S/ {{ n().credito.total | number }}</strong>
                </div>
              </div>
            </div>
          </div>

          <a class="card pad ext" appReveal [revealDelay]="140">
            <img class="ext__ill" src="icons/file.png" alt="" />
            <span class="badge badge--neutral">Externo</span>
            <strong style="margin-top:6px;display:block">Reportes PAR+</strong>
            <span class="tiny">Detalle de ventas, recaudo y comisiones ↗</span>
          </a>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .crumbs {
        margin-bottom: 6px;
      }
      .crumbs a {
        color: var(--ink-2);
      }
      .pad {
        padding: 18px 20px;
      }
      .row-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      /* Hero de estado — el color acompaña al cuadrante del estatus */
      .hero-estado {
        display: flex;
        gap: 18px;
        align-items: center;
      }
      .hero-estado--danger {
        border-color: var(--danger);
      }
      .hero-estado--danger .hero-estado__q {
        color: var(--danger);
        background: var(--danger-bg);
        border-color: var(--danger);
      }
      .hero-estado--warning {
        border-color: var(--warning);
      }
      .hero-estado--warning .hero-estado__q {
        color: var(--warning);
        background: var(--warning-bg);
        border-color: var(--warning);
      }
      .hero-estado--brand {
        border-color: var(--brand-600);
      }
      .hero-estado--brand .hero-estado__q {
        color: var(--brand-700);
        background: var(--brand-100);
        border-color: var(--brand-600);
      }
      .hero-estado--success {
        border-color: var(--success);
      }
      .hero-estado--success .hero-estado__q {
        color: var(--success);
        background: var(--success-bg);
        border-color: var(--success);
      }
      .hero-estado__ill {
        width: 56px;
        height: 56px;
        object-fit: contain;
        margin-left: auto;
        flex-shrink: 0;
      }
      .hero-estado__q {
        flex-shrink: 0;
        width: 84px;
        height: 84px;
        border-radius: var(--radius);
        display: grid;
        place-items: center;
        font-family: var(--font-display);
        font-size: 46px;
        font-weight: 800;
        border: 2px solid var(--line-strong);
        background: var(--sand);
      }
      .hero-estado__body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .hero-estado__t {
        font-size: 18px;
        margin: 2px 0;
      }
      .hero-estado__body p {
        margin: 0;
        font-size: 13.5px;
      }

      .matrix {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 0 0 26px 26px;
        margin-top: 4px;
      }
      .matrix__cell {
        border-radius: var(--radius-s);
        padding: 14px;
        min-height: 88px;
        position: relative;
      }
      .matrix__cell p {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--ink-2);
      }
      .matrix__cell--a {
        background: var(--success-bg);
      }
      .matrix__cell--b {
        background: var(--brand-100);
      }
      .matrix__cell--c {
        background: var(--warning-bg);
      }
      .matrix__cell--d {
        background: var(--danger-bg);
      }
      /* Marcador de posición: neutro (el tono ya lo da la celda) */
      .here {
        outline: 2.5px solid var(--ink);
        outline-offset: 2px;
      }
      .here__dot {
        position: absolute;
        right: 12px;
        bottom: 12px;
        width: 14px;
        height: 14px;
        border-radius: 99px;
        background: var(--ink);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 25%, transparent);
      }
      .matrix__axis {
        position: absolute;
        font-size: 10.5px;
        font-weight: 700;
        color: var(--ink-3);
        letter-spacing: 0.04em;
      }
      .matrix__axis--y {
        left: -2px;
        top: 40%;
        transform: rotate(-90deg);
        transform-origin: left;
      }
      .matrix__axis--x {
        left: 40%;
        bottom: 2px;
      }
      .cuad-prog {
        display: flex;
        gap: 22px;
        align-items: center;
        margin-top: 16px;
        flex-wrap: wrap;
      }
      .cuad-prog__ring {
        text-align: center;
      }
      .cuad-prog__pped {
        flex: 1;
        min-width: 220px;
      }
      /* PPED en 0/4 = crítico (rojo), no ámbar */
      .dots--bad .dot {
        border-color: var(--danger);
        color: var(--danger);
      }

      .hist__row {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 8px 2px;
      }
      .hist__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
      }
      .hist__box {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 13px;
        background: var(--sand);
        color: var(--ink-3);
      }
      .hist__box--a {
        background: var(--success-bg);
        color: var(--success);
      }
      .hist__box--d {
        background: var(--danger-bg);
        color: var(--danger);
      }
      .hist__c {
        font-size: 10px;
        color: var(--ink-3);
      }

      .ind-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .tile__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .kv {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13.5px;
        padding: 3px 0;
      }
      .warn {
        color: var(--warning);
      }
      .bad {
        color: var(--danger);
      }
      .ok {
        color: var(--success);
      }
      .progress--im .progress__fill {
        background: linear-gradient(90deg, var(--warning), var(--danger));
      }
      .acc {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 4px;
        border-top: 1px solid var(--line);
        padding-top: 8px;
      }
      .acc__link {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink);
        padding: 7px 0;
      }
      .acc__link:hover {
        color: var(--brand-600);
      }
      .ext {
        display: block;
        position: relative;
      }
      .ext__ill {
        position: absolute;
        top: 14px;
        right: 16px;
        width: 34px;
        height: 34px;
        object-fit: contain;
      }
      @media (max-width: 560px) {
        .hero-estado__ill {
          display: none;
        }
      }

      @media (max-width: 720px) {
        .ind-grid {
          grid-template-columns: 1fr;
        }
        .hero-estado__q {
          width: 64px;
          height: 64px;
          font-size: 34px;
        }
      }
    `,
  ],
})
export class Negocio {
  private readonly estatusDirSrv = inject(EstatusDirService);

  protected readonly c = CAMPANA;
  protected readonly historia = CUADRANTE_HISTORIA;
  protected readonly rec = RECONOCIMIENTOS;

  /** Perfil del estatus encarnado: su negocio y su vara de Cuadrante A. */
  protected readonly p = computed(() => PERFILES_DIR[this.estatusDirSrv.estatus()]);
  protected readonly n = computed(() => this.p().negocio);
  protected readonly vara = computed(() => this.p().cuadranteA);

  /** Único % grande de la vista: venta sobre el mínimo (MRM) del estatus. */
  protected readonly mrmPct = computed(() =>
    Math.min(100, Math.round((this.n().ventaGP / this.vara().venta) * 100)),
  );
  protected readonly faltaVenta = computed(() => Math.max(0, this.vara().venta - this.n().ventaGP));
  protected readonly ppedListo = computed(() => this.n().pped >= this.vara().pped);
  protected readonly ppedSlots = computed(() =>
    Array.from({ length: this.vara().pped }, (_, i) => i + 1),
  );
  /** IM sobre el límite de morosidad del país (6%). */
  protected readonly imPct = computed(() =>
    Math.min(100, Math.round((this.n().morosidad.im / 6) * 100)),
  );
  protected readonly credPct = computed(() =>
    Math.round((this.n().credito.utilizado / this.n().credito.total) * 100),
  );

  protected readonly completadas = CUADRANTE_HISTORIA.filter((h) => h.valor !== '-').length; // 6
  protected readonly enA = CUADRANTE_HISTORIA.filter((h) => h.valor === 'A').length; // 5

  /** Severidad: verde=bien · ámbar=atrasado · rojo=crítico. */
  protected readonly resultados = computed(() => [
    {
      label: 'Venta GP',
      valor: 'S/ ' + this.n().ventaGP.toLocaleString('es-PE'),
      detalle: `${this.mrmPct()}% del MRM de tu estatus (S/ ${this.vara().venta.toLocaleString('es-PE')})`,
      tone: this.mrmPct() >= 100 ? 'ok' : 'warn',
    },
    {
      label: 'Activas GP',
      valor: `${CAMPANA.activas.total} / ${CAMPANA.activas.meta}`,
      detalle: 'meta campañal de activas',
      tone: 'warn',
    },
    {
      label: 'Primeros pedidos',
      valor: `${this.n().pped} / ${this.vara().pped}`,
      detalle: 'requisito de Cuadrante A',
      tone: this.ppedListo() ? 'ok' : this.n().pped === 0 ? 'bad' : 'warn',
    },
  ]);
}
