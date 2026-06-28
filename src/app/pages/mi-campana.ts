import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { CAMPANA, PAR_ESTRELLAS } from '../data/mock';

@Component({
  selector: 'app-mi-campana',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <nav class="crumbs" aria-label="Ruta de navegación"><a routerLink="/inicio">Inicio</a> / Mi Campaña</nav>
          <h1 class="page-title">Mi Campaña</h1>
        </div>
        <div class="tabs">
          @for (t of data.tabs; track t) {
            <button class="tabs__tab" [class.tabs__tab--active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
          }
        </div>
      </header>

      <div class="grid">
        <!-- Columna principal -->
        <div class="col">
          <!-- Meta de venta -->
          <section class="card pad">
            <div class="row-between">
              <h2 class="card-title">🎯 Meta de venta {{ tab() }} <span class="muted-light">(MRM)</span></h2>
              <button class="btn btn--ghost btn--sm">Detalle de meta</button>
            </div>
            <div class="meta">
              <div>
                <div class="tiny">Venta GP actual</div>
                <div class="big">\${{ data.ventaActual | number }}</div>
              </div>
              <div>
                <div class="tiny">Te falta</div>
                <div class="big big--muted">\${{ data.faltante | number }}</div>
              </div>
              <div>
                <div class="tiny">Meta {{ tab() }}</div>
                <div class="big big--muted">\${{ data.meta | number }}</div>
              </div>
            </div>
            <div class="progress"><div class="progress__fill" [style.width.%]="avanceMeta()"></div></div>
            <div class="tiny" style="margin-top:6px">{{ avanceMeta() }}% de avance</div>
          </section>

          <!-- Activas -->
          <section class="card pad card--activas">
            <div class="row-between">
              <h2 class="card-title">👩🏽‍🤝‍👩🏻 Activas GP: {{ data.activas.total }} <span class="muted-light">/ meta {{ data.activas.meta }}</span></h2>
              <span class="badge badge--neutral">{{ data.activas.estatus }}</span>
            </div>
            <div class="trio">
              <a class="trio__item" routerLink="/grupo-personal">
                <div class="trio__label">Retenidas</div>
                <div class="trio__value">{{ data.retenidas.valor }} <span>/ {{ data.retenidas.meta }}</span></div>
                <div class="progress"><div class="progress__fill" [style.width.%]="pct(data.retenidas.valor, data.retenidas.meta)"></div></div>
              </a>
              <a class="trio__item" routerLink="/grupo-personal">
                <div class="trio__label">Reactivadas</div>
                <div class="trio__value">{{ data.reactivadas.valor }} <span>/ {{ data.reactivadas.meta }}</span></div>
                <div class="progress"><div class="progress__fill" [style.width.%]="pct(data.reactivadas.valor, data.reactivadas.meta)"></div></div>
              </a>
              <a class="trio__item" routerLink="/grupo-personal">
                <div class="trio__label">Primeros pedidos</div>
                <div class="trio__value">{{ data.primerosPedidos.valor }} <span>/ {{ data.primerosPedidos.meta }}</span></div>
                <div class="progress"><div class="progress__fill" [style.width.%]="pct(data.primerosPedidos.valor, data.primerosPedidos.meta)"></div></div>
              </a>
            </div>
          </section>

          <!-- Premios -->
          <section class="card pad">
            <h2 class="card-title">🎁 Premios Ganamás</h2>
            <div class="duo">
              <div class="duo__item">
                <span>Premios calificados (Retener)</span>
                <strong>{{ data.premios.calificados }} CNS</strong>
              </div>
              <div class="duo__item">
                <span>Cerca del premio (Activas)</span>
                <strong>{{ data.premios.cercaDelPremio }} CNS</strong>
              </div>
            </div>
            <div class="subcard">
              <div class="row-between">
                <span>Mis premios {{ tab() }}: <strong>{{ data.premios.misPremios }}</strong></span>
                <span>Venta personal: <strong>\${{ data.premios.ventaPersonal | number }}</strong></span>
              </div>
              <div class="alert alert--warning">
                <app-icon name="alert" [size]="16" />
                Pasa tu pedido personal al N1 Gana Más y califica a un premio.
              </div>
            </div>
          </section>

          <!-- Cuadrante -->
          <section class="card pad">
            <div class="row-between">
              <h2 class="card-title">📊 Cuadrante actual: <span class="q-badge">{{ data.cuadrante.actual }}</span></h2>
              <a class="see-all" routerLink="/cuadrante">Ver detalle <app-icon name="arrow-right" [size]="14" /></a>
            </div>
            <p class="muted">
              Para subir a Cuadrante A y ganar el Bono de Desempeño de
              <strong>\${{ data.cuadrante.bono | number }}</strong>, necesitas:
            </p>
            <div class="duo">
              <div class="duo__col">
                <div class="tiny">MRM (venta requerida): \${{ data.cuadrante.ventaRequerida | number }}</div>
                <div class="pill pill--danger">Te falta \${{ data.cuadrante.faltaVenta | number }} para lograrlo</div>
              </div>
              <div class="duo__col">
                <div class="tiny">Primeros pedidos (PPED) requeridos: {{ data.cuadrante.ppedRequeridos }}</div>
                <div class="pill pill--danger">Necesitas {{ data.cuadrante.ppedFaltantes }} PPED más para calificar</div>
              </div>
            </div>
          </section>

          <!-- Morosidad -->
          <section class="card pad">
            <div class="row-between">
              <h2 class="card-title">🟠 Morosidad y deuda</h2>
              <button class="btn btn--ghost btn--sm">Contactar deudoras ({{ data.morosidad.deudoras }})</button>
            </div>
            <div class="meta">
              <div>
                <div class="tiny">IM Riesgoso</div>
                <div class="big big--danger">{{ data.morosidad.im }}%</div>
              </div>
              <div>
                <div class="tiny">Deuda GP</div>
                <div class="big">\${{ data.morosidad.deudaGP | number }}</div>
              </div>
            </div>
            <div class="alert alert--warning">
              <app-icon name="alert" [size]="16" />
              Tu grupo necesita pagar \${{ data.morosidad.pagoNecesario | number }} para lograr un IM saludable.
            </div>
            <div class="links">
              <button class="link-row"><strong>Mejora tu IM</strong> y protege tu ganancia <span>Ver calculadora ↗</span></button>
              <button class="link-row">Revisa el estado de las deudas <span>Estado de deuda ↗</span></button>
              <button class="link-row">Mi deuda: <strong>\${{ data.morosidad.miDeuda | number }}</strong> <span>→</span></button>
            </div>
          </section>

          <!-- Crédito -->
          <section class="card pad">
            <h2 class="card-title">💳 Crédito</h2>
            <div class="meta">
              <div>
                <div class="tiny">Mi crédito</div>
                <span class="badge badge--teal">{{ data.credito.estado }}</span>
              </div>
              <div>
                <div class="tiny">Utilizado</div>
                <div class="big big--muted">\${{ data.credito.utilizado | number }}</div>
              </div>
              <div>
                <div class="tiny">Disponible</div>
                <div class="big big--success">\${{ data.credito.disponible | number }}</div>
              </div>
            </div>
            <div class="progress progress--success">
              <div class="progress__fill" [style.width.%]="pct(data.credito.utilizado, data.credito.total)"></div>
            </div>
            <div class="tiny" style="margin-top:6px">Crédito total: \${{ data.credito.total | number }}</div>
          </section>

          <!-- Productivas -->
          <section class="card pad card--celebrate">
            <div>
              <h2 class="card-title">Consultoras Productivas: {{ data.productivas.valor }}</h2>
              <span class="badge badge--success">Meta: {{ data.productivas.meta }} · ¡Lo lograste! 🎉</span>
            </div>
            <div class="celebrate-emoji">💪🏽</div>
          </section>
        </div>

        <!-- Sidebar PAR+ -->
        <aside class="side">
          <section class="card par">
            <div class="par__cover">🌴</div>
            <div class="par__body">
              <div class="tiny">{{ data.par.nivel }}</div>
              <h2>{{ data.par.sueno }}</h2>

              <div class="par__stats">
                <div class="row-between">
                  <span>Estrella actual</span>
                  <strong>{{ data.par.estrellaActual }} ⭐</strong>
                </div>
                <div class="row-between">
                  <span>Venta {{ tab() }}</span>
                  <strong>\${{ data.par.ventaC6 | number }}</strong>
                </div>
                <div class="row-between">
                  <span>Meta Sueño PAR+</span>
                  <strong>\${{ data.par.metaSueno | number }}</strong>
                </div>
                <div class="progress">
                  <div class="progress__fill" [style.width.%]="pct(data.par.ventaC6, data.par.metaSueno)"></div>
                </div>
              </div>

              @if (!data.par.cumpliendo) {
                <div class="alert alert--warning">
                  <app-icon name="alert" [size]="16" />
                  No estás cumpliendo con el monto de venta para lograr tu sueño PAR+.
                </div>
              }

              <div class="tiny" style="margin-top:12px">Recuerda que también necesitas:</div>
              <ul class="par__req">
                @for (r of data.par.requisitos; track r) {
                  <li>{{ r }}</li>
                }
              </ul>

              <div class="tiny" style="margin-top:14px">Niveles de Estrella 2026 (excluyentes):</div>
              <div class="par__trail">
                @for (e of estrellas; track e.n) {
                  <div class="par__star" [class.par__star--target]="e.n === 3" [title]="e.hito">
                    <span>{{ e.n }}⭐</span>
                    <small>{{ e.hito }}</small>
                  </div>
                }
              </div>

              <a class="btn btn--ghost par__cta" routerLink="/externa/par">Ir a Reporte PAR+</a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 22px;
      }
      .crumbs { font-size: 12.5px; color: var(--ink-3); margin-bottom: 4px; }
      .crumbs a:hover { color: var(--brand-600); }

      .tabs {
        display: inline-flex;
        background: var(--sand);
        border-radius: 99px;
        padding: 4px;
        gap: 2px;
      }
      .tabs__tab {
        border: 0;
        background: none;
        border-radius: 99px;
        padding: 7px 22px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .tabs__tab--active { background: var(--ink); color: var(--on-ink); box-shadow: var(--shadow-s); }

      .grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 18px;
        align-items: start;
      }
      .col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

      .pad { padding: 20px; }
      .card-title { font-size: 17px; margin: 0 0 4px; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      .muted-light { color: var(--ink-3); font-size: 14px; font-weight: 500; }

      .meta { display: flex; gap: 36px; flex-wrap: wrap; margin: 12px 0 14px; }
      .big { font-family: var(--font-display); font-size: 24px; font-weight: 700; }
      .big--muted { color: var(--ink-2); }
      .big--danger { color: var(--danger); }
      .big--success { color: var(--success); }

      .btn--sm { padding: 7px 14px; font-size: 13px; }

      /* Naranjas fijos (no dependen del tema) para garantizar texto blanco AA en claro y oscuro */
      .card--activas {
        background: linear-gradient(135deg, #c2410c, #92330b);
        border: 0;
        color: #fff;
      }
      .card--activas .card-title, .card--activas h3 { color: #fff; }
      .card--activas .badge--neutral { background: rgba(255, 255, 255, 0.18); color: #fff; }
      .trio { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
      .trio__item {
        background: rgba(255, 255, 255, 0.95);
        border-radius: var(--radius-s);
        padding: 12px 14px;
        color: var(--ink);
        transition: transform 0.15s ease;
      }
      .trio__item:hover { transform: translateY(-2px); }
      .trio__label { font-size: 12px; font-weight: 600; color: var(--ink-2); }
      .trio__value { font-size: 19px; font-weight: 800; margin: 2px 0 8px; }
      .trio__value span { font-size: 13px; font-weight: 600; color: var(--ink-3); }

      .duo { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 10px 0; }
      .duo__item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: var(--bg);
        border-radius: var(--radius-s);
        padding: 12px 14px;
        font-size: 13px;
        color: var(--ink-2);
      }
      .duo__item strong { font-size: 18px; color: var(--ink); }
      .duo__col { display: flex; flex-direction: column; gap: 6px; }

      .subcard { background: var(--bg); border-radius: var(--radius-s); padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }

      .q-badge {
        display: inline-grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: var(--danger-bg);
        color: var(--danger);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 800;
      }
      .pill {
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 8px;
        padding: 8px 12px;
      }
      .pill--danger { background: var(--danger-bg); color: var(--danger); }

      .see-all { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--brand-600); }

      .links { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
      .link-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        text-align: left;
        background: var(--bg);
        border: 0;
        border-radius: var(--radius-s);
        padding: 11px 14px;
        font-size: 13.5px;
        color: var(--ink-2);
        transition: background 0.15s ease;
      }
      .link-row:hover { background: var(--sand); }
      .link-row span { color: var(--brand-600); font-weight: 700; white-space: nowrap; }

      .card--celebrate {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(120deg, var(--brand-100), var(--brand-50));
      }
      .celebrate-emoji { font-size: 42px; }

      /* PAR+ */
      .side { position: sticky; top: 150px; }
      .par { overflow: hidden; }
      .par__cover {
        height: 110px;
        display: grid;
        place-items: center;
        font-size: 48px;
        background: linear-gradient(120deg, #0e7490, #06b6d4 60%, #facc15);
      }
      .par__body { padding: 18px; }
      .par__body h3 { font-size: 20px; margin: 2px 0 12px; }
      .par__stats { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--ink-2); margin-bottom: 12px; }
      .par__stats strong { color: var(--ink); }
      .par__req { margin: 6px 0 0; padding-left: 18px; font-size: 13px; color: var(--ink-2); }
      .par__trail { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
      .par__star {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-size: 12px;
        color: var(--ink-3);
        padding: 4px 8px;
        border-radius: 8px;
      }
      .par__star span { font-weight: 700; white-space: nowrap; }
      .par__star small { font-size: 12px; }
      .par__star--target {
        background: var(--brand-50);
        color: var(--brand-700);
        border: 1px solid var(--brand-200);
      }
      .par__cta { width: 100%; justify-content: center; margin-top: 16px; }

      @media (max-width: 1000px) {
        .grid { grid-template-columns: 1fr; }
        .side { position: static; }
        .trio { grid-template-columns: 1fr; }
        .duo { grid-template-columns: 1fr; }
        .meta { gap: 20px; }
      }
    `,
  ],
})
export class MiCampanaPage {
  protected readonly data = CAMPANA;
  protected readonly estrellas = PAR_ESTRELLAS;
  protected readonly tab = signal(CAMPANA.actual);
  protected readonly avanceMeta = computed(() => this.pct(this.data.ventaActual, this.data.meta));

  protected pct(valor: number, meta: number): number {
    if (!meta) return 0;
    return Math.min(100, Math.round((valor / meta) * 100));
  }
}
