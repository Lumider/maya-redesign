import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { Ring } from '../shared/ring';
import { EstatusService } from '../shared/estatus';
import { CAMPANA_CES, GANAMAS_NIVELES, PERFILES } from '../data/mock-ces';

/**
 * Mi campaña: la salud de la campaña de la EMPRENDEDORA, según el estatus
 * encarnado (conmutador demo). Replica el orden de la Maya real
 * (docs/referencia-vista-ces.md) pero con el lenguaje de la vista nueva:
 *  · El hero muestra venta del GP (CES/ASP) o venta personal (CNS/CEM).
 *  · Ganamás (mi nivel + bonificaciones) = una sola sección, del perfil.
 *  · Lo grupal (morosidad del GP, bonif del grupo) solo existe con grupo.
 *  · La ganancia se muestra SOLO al final, oculta por defecto (privacidad).
 */
@Component({
  selector: 'app-campana-ces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal, Anchor, Ring],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/e/inicio">Inicio</a> / Mi campaña</nav>
        <h1 class="v2-title">Mi campaña</h1>
        <p class="v2-sub">
          Cómo va tu {{ c.actual }} — semana {{ c.semana }} de {{ c.totalSemanas }}.
        </p>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" appAnchor="ganamas">Ganamás</a>
          <a class="anchor" appAnchor="morosidad">Morosidad y deuda</a>
          <a class="anchor" appAnchor="credito">Crédito</a>
          <a class="anchor" appAnchor="ganancia">Mi ganancia</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Hero: venta del GP (con grupo) o venta personal (CNS/CEM) -->
          <section class="card pad hero v2-section" appReveal>
            <img
              class="hero__img"
              src="icons/money-01.png"
              alt=""
              aria-hidden="true"
              width="64"
              height="64"
            />
            @if (p().ventaGP; as gp) {
              <div class="hero__body">
                <span class="tiny">Venta de tu Grupo Personal</span>
                <div class="hero__v">S/ {{ gp.actual | number: '1.0-2' }}</div>
                <div class="progress" style="margin:8px 0 4px">
                  <div class="progress__fill" [style.width.%]="ventaPct()"></div>
                </div>
                <span class="tiny">{{ ventaPct() }}% de la {{ gp.etiquetaMeta }}</span>
              </div>
              <div class="hero__act">
                <span class="badge badge--neutral">{{ c.activas.estatus }}</span>
                <div class="hero__chips">
                  <span class="mini card"
                    >Activas <strong>{{ c.activas.total }}</strong></span
                  >
                  <span class="mini card"
                    >Retenidas <strong>{{ c.retenidas }}</strong></span
                  >
                  <span class="mini card"
                    >Reactivadas <strong>{{ c.reactivadas }}</strong></span
                  >
                  <span class="mini card"
                    >1eros pedidos <strong>{{ c.ppedDirectos }}</strong></span
                  >
                </div>
              </div>
            } @else {
              <div class="hero__body">
                <span class="tiny">Tu venta personal</span>
                <div class="hero__v">S/ {{ p().ventaPersonal | number: '1.0-2' }}</div>
                <div class="progress" style="margin:8px 0 4px">
                  <div class="progress__fill" [style.width.%]="nivelPct()"></div>
                </div>
                <span class="tiny"
                  >Nivel {{ p().nivelGanamas }} · {{ p().descuento }}% de descuento — el detalle
                  está en Ganamás ↓</span
                >
              </div>
            }
          </section>

          <!-- Ganamás: mi nivel + mis bonificaciones (premios en producto) -->
          <section id="ganamas" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="gift" [size]="18" /> Bonificaciones Ganamás</h2>

            <div class="nivel">
              <app-ring
                [pct]="nivelPct()"
                [size]="86"
                [label]="'al ' + siguiente().nivel"
                [expected]="60"
              />
              <div class="nivel__body">
                <strong
                  >Tu venta personal: S/ {{ p().ventaPersonal | number: '1.0-2' }} · nivel
                  {{ p().nivelGanamas }} ({{ p().descuento }}% de descuento)</strong
                >
                <p class="muted" style="margin:4px 0 8px">
                  Completa S/ {{ faltaSiguiente() | number: '1.0-2' }} más y llegas al
                  {{ siguiente().nivel }}: {{ siguiente().descuento }}% de descuento y más premios.
                </p>
                <div class="escala" role="list" aria-label="Niveles Ganamás">
                  @for (n of niveles; track n.nivel) {
                    <span
                      class="escala__n"
                      role="listitem"
                      [class.escala__n--on]="p().ventaPersonal >= n.desde"
                    >
                      {{ n.nivel }}<span class="tiny">{{ n.descuento }}%</span>
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="bonif">
              @for (b of c.bonificaciones; track b.tipo) {
                <div class="bonif__card card">
                  <span class="badge badge--info">Calificado</span>
                  <strong>{{ b.tipo }}</strong>
                  <span class="tiny">{{ b.premio }}</span>
                  <ol class="bonif__pasos">
                    @for (p of b.pasos; track p.campana) {
                      <li>
                        <strong>{{ p.campana }}:</strong> {{ p.estado }}
                      </li>
                    }
                  </ol>
                </div>
              }
            </div>

            @if (p().capacidades.grupo) {
              <p class="muted gp-bonif">
                En tu grupo:
                <strong>{{ c.bonifGP.calificadas }} consultoras ya calificaron</strong> su
                bonificación y {{ c.bonifGP.cerca }} están cerca —
                <a routerLink="/e/grupo" class="link">ayúdalas a llegar</a>.
              </p>
            }
          </section>

          <!-- Morosidad y deuda: el veredicto + la acción con cifra exacta -->
          <section id="morosidad" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="alert" [size]="18" /> Morosidad y deuda</h2>
            @if (p().capacidades.grupo) {
              <div class="im">
                <div>
                  <span class="tiny">IM No Cobro</span>
                  <div class="im__v" [class.im__v--bad]="c.morosidad.im > c.morosidad.limite">
                    {{ c.morosidad.im }}%
                  </div>
                  <span class="tiny">límite: {{ c.morosidad.limite }}%</span>
                </div>
                <div>
                  <span class="tiny">Deuda del grupo</span>
                  <div class="im__n">S/ {{ c.morosidad.deudaGP | number: '1.0-2' }}</div>
                  <span class="tiny">{{ c.morosidad.deudoras }} deudora</span>
                </div>
                <a class="btn btn--ghost btn--sm" routerLink="/e/grupo"
                  >Contactar deudoras ({{ c.morosidad.deudoras }})</a
                >
              </div>
              <div class="alert alert--warning" role="status" style="margin-top:12px">
                ⚠️ Tu grupo necesita pagar
                <strong>&nbsp;S/ {{ c.morosidad.pagoNecesario | number: '1.0-2' }}&nbsp;</strong>
                para lograr un IM de {{ c.morosidad.limite }}%.
              </div>
            }
            <div class="mideuda" [class.mideuda--sola]="!p().capacidades.grupo">
              <span
                >Mi deuda: <strong>S/ {{ c.morosidad.miDeuda | number: '1.0-2' }}</strong>
                <span class="tiny">vence {{ c.morosidad.miDeudaVence }}</span></span
              >
            </div>
          </section>

          <!-- Crédito -->
          <section id="credito" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="wallet" [size]="18" /> Crédito</h2>
            <div class="cred">
              <span class="badge badge--success">{{ c.credito.estado }}</span>
              <span
                >Utilizado: <strong>S/ {{ c.credito.utilizado | number: '1.0-2' }}</strong></span
              >
              <span
                >Disponible: <strong>S/ {{ c.credito.disponible | number: '1.0-2' }}</strong></span
              >
              <span class="muted">Total: S/ {{ c.credito.total | number: '1.0-2' }}</span>
            </div>
            <div class="progress" style="margin-top:10px" aria-hidden="true">
              <div class="progress__fill" [style.width.%]="credPct"></div>
            </div>
          </section>

          <!-- Ganancia: oculta por defecto — es SU dinero, en pantallas a veces compartidas -->
          <section id="ganancia" class="card pad gana v2-section" appReveal>
            <div class="gana__top">
              <div>
                <span class="tiny">Ganancia estimada actual</span>
                <div class="gana__v">
                  @if (verGanancia()) {
                    S/ {{ p().ganancia.total | number: '1.0-2' }}
                  } @else {
                    S/ ______
                  }
                </div>
              </div>
              <button
                class="btn btn--primary btn--sm"
                (click)="verGanancia.set(!verGanancia())"
                [attr.aria-pressed]="verGanancia()"
              >
                👁 {{ verGanancia() ? 'Ocultar' : 'Mostrar ganancia' }}
              </button>
            </div>
            <div class="gana__comp">
              <span class="tiny" style="width:100%">Composición de la ganancia:</span>
              <span class="mini card"
                >Escala {{ p().descuento }}% dscto.
                <strong>{{ verGanancia() ? 'S/ ' + p().ganancia.escala : 'S/ ___' }}</strong></span
              >
              @if (p().capacidades.incorpora) {
                <span class="mini card"
                  >Incorpora y Gana
                  <strong>{{
                    verGanancia() ? 'S/ ' + p().ganancia.incorporaYGana : 'S/ ___'
                  }}</strong></span
                >
              }
              @if (p().capacidades.red) {
                <span class="mini card"
                  >Ganancia de red
                  <strong>{{ verGanancia() ? 'S/ ' + p().ganancia.red : 'S/ ___' }}</strong></span
                >
              }
            </div>
            @if (verGanancia() && p().capacidades.incorpora && p().ganancia.incorporaYGana === 0) {
              <p class="muted" style="margin:10px 0 0; font-size:13px">
                💡 Aún no sumas por Incorpora y Gana este {{ c.actual }} —
                <a class="link" routerLink="/e/incorpora">un primer pedido pagado son S/ 50</a>.
              </p>
            }
            @if (verGanancia() && !p().capacidades.incorpora) {
              <p class="muted" style="margin:10px 0 0; font-size:13px">
                💡 Como CEM sumarías S/ 50 por cada incorporada activa —
                <a class="link" routerLink="/e/camino">mira cómo dar el paso</a>.
              </p>
            }
          </section>
        </main>

        <aside class="v2-aside">
          @if (p().capacidades.grupo) {
            <div class="card pad" appReveal>
              <h3 class="v2-h" style="font-size:15px">
                <app-icon name="target" [size]="16" /> Mi calificación {{ p().estatus }}
              </h3>
              <div class="tiles" style="grid-template-columns:1fr 1fr">
                <div class="tile card">
                  <span class="tile__label">PPED directos</span
                  ><span class="tile__value"
                    >{{ c.ppedDirectos
                    }}<span class="muted" style="font-size:14px">/{{ c.metaPped }}</span></span
                  >
                </div>
                <div class="tile card">
                  <span class="tile__label">Activas directas</span
                  ><span class="tile__value"
                    >{{ c.activasDirectas
                    }}<span class="muted" style="font-size:14px"
                      >/{{ c.metaActivasDirectas }}</span
                    ></span
                  >
                </div>
              </div>
              <a class="link tiny" routerLink="/e/camino" style="display:block;margin-top:10px"
                >Ver los requisitos completos →</a
              >
            </div>
          } @else {
            <div class="card pad" appReveal>
              <h3 class="v2-h" style="font-size:15px">
                <app-icon name="target" [size]="16" /> Mi paso actual
              </h3>
              <p class="tiny" style="margin:0 0 8px">{{ p().paso.titulo }}</p>
              <a class="link tiny" routerLink="/e/camino">Ver mis requisitos →</a>
            </div>
          }

          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="calendar" [size]="16" /> Campañas anteriores
            </h3>
            @for (t of historial; track t.campana) {
              <div class="row-h">
                <span class="row-h__c">{{ t.campana }}</span>
                <span class="tiny">{{ t.nota }}</span>
                <span class="badge" [class]="'badge--' + t.tone">{{ t.resultado }}</span>
              </div>
            }
          </div>

          <div class="card pad tipcard" appReveal [revealDelay]="140">
            <img src="icons/file.png" alt="" aria-hidden="true" width="40" height="40" />
            <p class="tiny" style="margin:0">
              El catálogo {{ c.actual }} y el material para incorporar están en
              <a class="link" routerLink="/externa/reportes">Mis Herramientas ↗</a>
            </p>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .pad {
        padding: 18px 20px;
      }
      .btn--sm {
        padding: 8px 14px;
        font-size: 13px;
      }
      .link {
        color: var(--brand-600);
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .hero {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 18px;
        align-items: center;
      }
      .hero__img {
        grid-row: span 2;
      }
      .hero__v {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 800;
        line-height: 1.1;
      }
      .hero__act {
        grid-column: 2;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 6px;
      }
      .hero__chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .mini {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        font-size: 12.5px;
        color: var(--ink-2);
      }
      .mini strong {
        color: var(--ink);
        font-size: 14px;
      }

      .nivel {
        display: flex;
        gap: 18px;
        align-items: center;
        margin-bottom: 16px;
      }
      .escala {
        display: flex;
        gap: 8px;
      }
      .escala__n {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        min-width: 52px;
        padding: 7px 10px;
        border-radius: var(--radius-s);
        border: 1.5px dashed var(--line-strong);
        color: var(--ink-3);
        font-weight: 800;
        font-size: 13px;
      }
      .escala__n--on {
        border-style: solid;
        border-color: var(--success);
        background: var(--success-bg);
        color: var(--success);
      }
      .escala__n--on .tiny {
        color: var(--success);
      }

      .bonif {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .bonif__card {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px 16px;
        align-items: flex-start;
      }
      .bonif__pasos {
        margin: 6px 0 0;
        padding-left: 18px;
        font-size: 12.5px;
        color: var(--ink-2);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .gp-bonif {
        margin: 14px 0 0;
        font-size: 13.5px;
      }

      .im {
        display: flex;
        align-items: center;
        gap: 28px;
        flex-wrap: wrap;
      }
      .im .btn {
        margin-left: auto;
      }
      .im__v {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 800;
        line-height: 1.1;
      }
      .im__v--bad {
        color: var(--danger);
      }
      .im__n {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 800;
        margin-top: 4px;
      }
      .mideuda {
        border-top: 1px solid var(--line);
        margin-top: 14px;
        padding-top: 12px;
        font-size: 13.5px;
      }
      /* Sin grupo (CNS/CEM) la sección solo tiene la deuda propia */
      .mideuda--sola {
        border-top: 0;
        margin-top: 0;
        padding-top: 0;
      }

      .cred {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
        font-size: 13.5px;
      }

      .gana {
        background: var(--info-bg);
        border-color: transparent;
      }
      .gana__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .gana__v {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 800;
      }
      .gana__comp {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .gana__comp .mini {
        background: var(--surface);
      }

      .row-h {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 0;
        border-bottom: 1px solid var(--line);
      }
      .row-h:last-child {
        border-bottom: 0;
      }
      .row-h__c {
        font-weight: 800;
        width: 30px;
      }
      .row-h .tiny {
        flex: 1;
      }

      .tipcard {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      @media (max-width: 720px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .hero__img {
          grid-row: auto;
        }
        .hero__act {
          grid-column: 1;
        }
        .bonif {
          grid-template-columns: 1fr;
        }
        .nivel {
          flex-direction: column;
          align-items: flex-start;
        }
        .im .btn {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class CampanaCes {
  private readonly estatusSrv = inject(EstatusService);

  protected readonly c = CAMPANA_CES;
  protected readonly niveles = GANAMAS_NIVELES;

  /** Perfil del estatus encarnado — de aquí sale lo variable de la página. */
  protected readonly p = computed(() => PERFILES[this.estatusSrv.estatus()]);

  /** La ganancia arranca oculta: es dinero personal en pantallas a veces compartidas. */
  protected readonly verGanancia = signal(false);

  protected readonly ventaPct = computed(() => {
    const gp = this.p().ventaGP;
    return gp ? Math.round((gp.actual / gp.meta) * 100) : 0;
  });
  protected readonly credPct = Math.round(
    (CAMPANA_CES.credito.utilizado / CAMPANA_CES.credito.total) * 100,
  ); // 48

  /** Siguiente nivel Ganamás por alcanzar (el último si ya está en el tope). */
  protected readonly siguiente = computed(
    () =>
      GANAMAS_NIVELES.find((n) => this.p().ventaPersonal < n.desde) ??
      GANAMAS_NIVELES[GANAMAS_NIVELES.length - 1],
  );
  protected readonly faltaSiguiente = computed(() =>
    Math.max(0, this.siguiente().desde - this.p().ventaPersonal),
  );
  protected readonly nivelPct = computed(() =>
    Math.min(100, Math.round((this.p().ventaPersonal / this.siguiente().desde) * 100)),
  );

  /** Historial corto: el resultado de calificación de las últimas campañas. */
  protected readonly historial = [
    { campana: 'C6', nota: 'Calificaste CES · GP S/ 6,410', resultado: 'CES', tone: 'success' },
    { campana: 'C5', nota: 'Calificaste CES · GP S/ 6,180', resultado: 'CES', tone: 'success' },
    { campana: 'C4', nota: 'Sin 2 PPED directos', resultado: 'CNS', tone: 'warning' },
  ];
}
