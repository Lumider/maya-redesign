import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { CAMPANA, CUADRANTE_HISTORIA, INDICADORES } from '../data/mock';

/** Mi negocio (mide): indicadores, cuadrante, MRM/PPED, deuda/crédito, reportes. */
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
          <a class="anchor" appAnchor="indicadores">Indicadores</a>
          <a class="anchor" appAnchor="deuda">Morosidad y deuda</a>
          <a class="anchor anchor--ext">Reportes</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Cuadrante: matriz 2x2 visual con punto -->
          <section id="cuadrante" class="card pad v2-section" appReveal>
            <div class="row-between">
              <h2 class="v2-h"><app-icon name="chart" [size]="18" /> ¿Dónde estás hoy?</h2>
              <span class="badge badge--danger">Cuadrante {{ c.cuadrante.actual }}</span>
            </div>
            <div class="matrix">
              <div class="matrix__cell matrix__cell--c"><span class="badge badge--warning">C · Recuperación</span><p>Cumple PPED · no MRM</p></div>
              <div class="matrix__cell matrix__cell--a"><span class="badge badge--success">A · Crecimiento</span><p>Cumple MRM + PPED</p></div>
              <div class="matrix__cell matrix__cell--d here"><span class="badge badge--danger">D · Riesgo</span><p>No cumple MRM ni PPED</p><span class="here__dot"></span></div>
              <div class="matrix__cell matrix__cell--b"><span class="badge badge--brand">B · Potencial</span><p>Cumple MRM · no PPED</p></div>
              <div class="matrix__axis matrix__axis--y">PPED →</div>
              <div class="matrix__axis matrix__axis--x">Venta (MRM) →</div>
            </div>
            <div class="cuad-prog">
              <div class="cuad-prog__ring">
                <app-ring [pct]="mrmPct" [size]="104" label="MRM" [expected]="100" />
                <span class="tiny">Faltan \${{ c.cuadrante.faltaVenta | number }}</span>
              </div>
              <div class="cuad-prog__pped">
                <div class="tiny" style="margin-bottom:6px">Primeros pedidos · {{ c.primerosPedidos.valor }} de {{ c.cuadrante.ppedRequeridos }}</div>
                <div class="dots">
                  @for (n of ppedSlots; track n) {
                    <span class="dot" [class.dot--on]="n <= c.primerosPedidos.valor">{{ n }}</span>
                  }
                </div>
                <div class="alert alert--warning" style="margin-top:12px">
                  <app-icon name="alert" [size]="16" /> Sube a Cuadrante A y gana el Bono de Desempeño de \${{ c.cuadrante.bono | number }}.
                </div>
              </div>
            </div>
            <div class="hist">
              <span class="tiny">Historial del año</span>
              <div class="hist__row">
                @for (h of historia; track h.campana) {
                  <div class="hist__item">
                    <span class="hist__box" [class.hist__box--a]="h.valor==='A'" [class.hist__box--d]="h.valor==='D'">{{ h.valor }}</span>
                    <span class="hist__c">{{ h.campana }}</span>
                  </div>
                }
              </div>
            </div>
          </section>

          <section id="indicadores" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="trending" [size]="18" /> Indicadores</h2>
            <div class="ind-grid">
              @for (i of indicadores; track i.label) {
                <div class="tile card">
                  <div class="tile__top"><span class="tile__label">{{ i.label }}</span><span class="sem" [class]="'sem--' + sem(i.tone)"></span></div>
                  <div class="tile__value">{{ i.valor }}</div>
                  <div class="tile__hint">{{ i.detalle }}</div>
                </div>
              }
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <div id="deuda" class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px"><app-icon name="wallet" [size]="16" /> Morosidad y deuda</h3>
            <div class="kv"><span>Índice de morosidad</span><strong class="warn">{{ c.morosidad.im }}%</strong></div>
            <div class="progress progress--im" style="margin:6px 0 10px"><div class="progress__fill" [style.width.%]="imPct"></div></div>
            <div class="kv"><span>Deuda del GP</span><strong>\${{ c.morosidad.deudaGP | number }}</strong></div>
            <div class="kv"><span>Tu deuda</span><strong class="bad">\${{ c.morosidad.miDeuda | number }}</strong></div>
            <div class="alert alert--warning" style="margin-top:10px"><app-icon name="alert" [size]="16" /> Tu grupo necesita pagar \${{ c.morosidad.pagoNecesario | number }} para un IM saludable.</div>
          </div>

          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="wallet" [size]="16" /> Crédito Yanbal</h3>
            <app-ring [pct]="credPct" [size]="96" label="usado" [expected]="0" />
            <div class="kv" style="margin-top:8px"><span>Disponible</span><strong>\${{ c.credito.disponible | number }}</strong></div>
            <div class="kv"><span>Total</span><strong>\${{ c.credito.total | number }}</strong></div>
          </div>

          <a class="card pad ext" appReveal [revealDelay]="140">
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
      .crumbs { margin-bottom: 6px; }
      .crumbs a { color: var(--ink-2); }
      .pad { padding: 18px 20px; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
      .matrix { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 0 26px 26px; }
      .matrix__cell { border-radius: var(--radius-s); padding: 14px; min-height: 88px; position: relative; }
      .matrix__cell p { margin: 8px 0 0; font-size: 12px; color: var(--ink-2); }
      .matrix__cell--a { background: var(--success-bg); }
      .matrix__cell--b { background: var(--brand-100); }
      .matrix__cell--c { background: var(--warning-bg); }
      .matrix__cell--d { background: var(--danger-bg); }
      .here { outline: 2.5px solid var(--danger); outline-offset: 2px; }
      .here__dot { position: absolute; right: 12px; bottom: 12px; width: 14px; height: 14px; border-radius: 99px; background: var(--danger); box-shadow: 0 0 0 4px color-mix(in srgb, var(--danger) 30%, transparent); }
      .matrix__axis { position: absolute; font-size: 10.5px; font-weight: 700; color: var(--ink-3); letter-spacing: 0.04em; }
      .matrix__axis--y { left: -2px; top: 40%; transform: rotate(-90deg); transform-origin: left; }
      .matrix__axis--x { left: 40%; bottom: 2px; }
      .cuad-prog { display: flex; gap: 22px; align-items: center; margin: 18px 0; flex-wrap: wrap; }
      .cuad-prog__ring { text-align: center; }
      .cuad-prog__pped { flex: 1; min-width: 220px; }
      .hist { border-top: 1px solid var(--line); padding-top: 12px; }
      .hist__row { display: flex; gap: 6px; overflow-x: auto; padding: 8px 2px 2px; }
      .hist__item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 0 0 auto; }
      .hist__box { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; font-weight: 800; font-size: 13px; background: var(--sand); color: var(--ink-3); }
      .hist__box--a { background: var(--success-bg); color: var(--success); }
      .hist__box--d { background: var(--danger-bg); color: var(--danger); }
      .hist__c { font-size: 10px; color: var(--ink-3); }
      .ind-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .tile__top { display: flex; align-items: center; justify-content: space-between; }
      .kv { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; padding: 3px 0; }
      .warn { color: var(--warning); } .bad { color: var(--danger); }
      .progress--im .progress__fill { background: linear-gradient(90deg, var(--warning), var(--danger)); }
      .ext { display: block; }
      @media (max-width: 720px) { .ind-grid { grid-template-columns: 1fr 1fr; } }
    `,
  ],
})
export class Negocio {
  protected readonly c = CAMPANA;
  protected readonly indicadores = INDICADORES;
  protected readonly historia = CUADRANTE_HISTORIA;
  protected readonly ppedSlots = [1, 2, 3, 4];
  protected readonly mrmPct = Math.round((CAMPANA.ventaActual / CAMPANA.cuadrante.ventaRequerida) * 100);
  protected readonly imPct = Math.min(100, Math.round((CAMPANA.morosidad.im / 6) * 100));
  protected readonly credPct = Math.round((CAMPANA.credito.utilizado / CAMPANA.credito.total) * 100);

  protected sem(t: string): string {
    return t === 'danger' ? 'bad' : t === 'warning' ? 'warn' : t === 'success' ? 'ok' : 'info';
  }
}
