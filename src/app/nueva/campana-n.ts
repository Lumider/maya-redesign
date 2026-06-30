import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { CAMPANA, PLAN_CAMPANA } from '../data/mock';

/** Mi campaña (ejecuta): plan/sueño, metas, acciones, venta MRM, activas, ritmo. */
@Component({
  selector: 'app-campana-n',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Ring, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi campaña</nav>
        <div class="row-between">
          <div><h1 class="v2-title">Mi campaña</h1><p class="v2-sub">Tu plan y lo que ejecutas semana a semana.</p></div>
          <div class="tabs">
            @for (t of c.tabs; track t) {
              <button class="tabs__tab" [class.tabs__tab--active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
            }
          </div>
        </div>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" appAnchor="plan">Mi plan</a>
          <a class="anchor" appAnchor="acciones">Acciones</a>
          <a class="anchor" appAnchor="venta">Venta y activas</a>
          <a class="anchor" appAnchor="ritmo">Ritmo</a>
          <a class="anchor anchor--ext">Mis pedidos</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <section id="plan" class="card pad plan v2-section" [class.plan--ok]="plan.estado!=='en-riesgo'" appReveal>
            <div class="plan__week"><div class="plan__wn">S{{ plan.semanaActual }}</div><div class="tiny">de {{ plan.totalSemanas }}</div></div>
            <div class="plan__main">
              <div class="row-between" style="margin-bottom:4px">
                <strong>{{ plan.estado==='en-riesgo' ? 'Vas por debajo del ritmo' : '¡Vas en ritmo!' }}</strong>
                <span class="badge" [class]="plan.estado==='en-riesgo' ? 'badge badge--warning' : 'badge badge--success'">{{ plan.estado==='en-riesgo' ? 'En riesgo' : 'En ritmo' }}</span>
              </div>
              <p class="muted">Tu sueño: <strong>"{{ plan.sueno }}"</strong> — necesita \${{ plan.gananciaObjetivo | number }} de ganancia.</p>
              <div class="progress" style="margin-top:10px"><div class="progress__fill" [style.width.%]="gananciaPct"></div></div>
            </div>
            <div class="plan__gain">
              <app-ring [pct]="gananciaPct" [size]="92" label="ganancia" [expected]="75" />
              <span class="tiny">\${{ plan.gananciaProyectada | number }}</span>
            </div>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="target" [size]="18" /> Tus metas <span class="tiny" style="font-weight:500">la línea marca dónde deberías ir hoy</span></h2>
            <div class="metas">
              @for (m of plan.metas; track m.id) {
                <div class="meta card pad">
                  <div class="row-between"><strong>{{ m.label }}</strong><span class="meta__n">{{ m.dinero ? '$' : '' }}{{ m.actual | number }} <span class="muted">/ {{ m.dinero ? '$' : '' }}{{ m.objetivo | number }}</span></span></div>
                  <div class="pace"><div class="progress" [class.progress--success]="pct(m.actual,m.objetivo) >= m.esperadoHoy*100"><div class="progress__fill" [style.width.%]="pct(m.actual,m.objetivo)"></div></div><div class="pace__mark" [style.left.%]="m.esperadoHoy*100"></div></div>
                  <span class="tiny" [class.bad]="detras(m)">{{ detras(m) ? '▼ detrás del ritmo' : '▲ en ritmo' }} · {{ m.detalle }}</span>
                </div>
              }
            </div>
          </section>

          <section id="acciones" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="check" [size]="18" /> Acciones de la semana <span class="tiny" style="font-weight:500">{{ hechas() }}/{{ plan.acciones.length }}</span></h2>
            <div class="card">
              @for (a of plan.acciones; track a.id) {
                <button class="acc" [class.acc--done]="done().has(a.id)" (click)="toggle(a.id)">
                  <span class="acc__check">@if (done().has(a.id)) { <app-icon name="check" [size]="13" /> }</span>
                  <span class="acc__body"><span class="acc__txt">{{ a.texto }}</span><span class="tiny">{{ a.impacto }}</span></span>
                </button>
              }
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <div id="venta" class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px"><app-icon name="trending" [size]="16" /> Meta de venta · MRM</h3>
            <div style="display:flex;gap:16px;align-items:center">
              <app-ring [pct]="ventaPct" [size]="92" label="del MRM" [expected]="100" />
              <div><div class="tile__value">\${{ c.ventaActual/1000 | number:'1.0-0' }}k</div><div class="tiny">de \${{ c.meta | number }} · faltan \${{ c.faltante | number }}</div></div>
            </div>
          </div>

          <div class="card pad" appReveal [revealDelay]="60">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="users" [size]="16" /> Activas · {{ c.activas.total }}/{{ c.activas.meta }}</h3>
            <div class="trio">
              <div class="trio__i"><span class="tiny">Retenidas</span><strong>{{ c.retenidas.valor }}<span class="muted">/{{ c.retenidas.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.retenidas.valor,c.retenidas.meta)"></div></div></div>
              <div class="trio__i"><span class="tiny">Reactivadas</span><strong>{{ c.reactivadas.valor }}<span class="muted">/{{ c.reactivadas.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.reactivadas.valor,c.reactivadas.meta)"></div></div></div>
              <div class="trio__i"><span class="tiny">1ros pedidos</span><strong>{{ c.primerosPedidos.valor }}<span class="muted">/{{ c.primerosPedidos.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.primerosPedidos.valor,c.primerosPedidos.meta)"></div></div></div>
            </div>
          </div>

          <div class="card pad" appReveal [revealDelay]="110">
            <h3 class="v2-h" style="font-size:15px">🎁 Premios Ganamás</h3>
            <div class="kv"><span>Calificados (retener)</span><strong>{{ c.premios.calificados }}</strong></div>
            <div class="kv"><span>Cerca del premio</span><strong>{{ c.premios.cercaDelPremio }}</strong></div>
            <div class="kv"><span>Consultoras productivas</span><strong class="ok">{{ c.productivas.valor }} / {{ c.productivas.meta }}</strong></div>
          </div>

          <div id="ritmo" class="card pad" appReveal [revealDelay]="150">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="chart" [size]="16" /> Ritmo semanal</h3>
            <div class="weeks">
              @for (s of plan.semanas; track s.n) {
                <div class="wk" [class.wk--cur]="s.n===plan.semanaActual">
                  <div class="wk__bars"><span class="wk__plan" [style.height.%]="alto(s.plan)"></span><span class="wk__real" [style.height.%]="alto(s.logrado)"></span></div>
                  <span class="tiny">S{{ s.n }}</span>
                </div>
              }
            </div>
          </div>

          <a class="card pad ext" appReveal [revealDelay]="190"><span class="badge badge--neutral">Externo</span><strong style="display:block;margin-top:6px">Mis pedidos</strong><span class="tiny">Realiza y revisa el estado de tus pedidos ↗</span></a>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .crumbs { margin-bottom: 6px; } .crumbs a { color: var(--ink-2); }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
      .pad { padding: 18px 20px; }
      .tabs { display: inline-flex; background: var(--sand); border-radius: 99px; padding: 4px; }
      .tabs__tab { border: 0; background: none; border-radius: 99px; padding: 7px 16px; font-weight: 700; font-size: 13px; color: var(--ink-2); }
      .tabs__tab--active { background: var(--ink); color: var(--on-ink); }
      .plan { display: flex; gap: 18px; align-items: center; border-color: var(--warning); flex-wrap: wrap; }
      .plan--ok { border-color: var(--success); }
      .plan__week { text-align: center; }
      .plan__wn { font-family: var(--font-display); font-size: 30px; font-weight: 800; width: 60px; height: 60px; border-radius: 99px; display: grid; place-items: center; background: var(--brand-grad-strong); color: #fff; }
      .plan__main { flex: 1; min-width: 220px; }
      .plan__main p { margin: 6px 0 0; font-size: 13px; }
      .plan__gain { text-align: center; }
      .metas { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .meta__n { font-weight: 800; font-size: 14px; }
      .pace { position: relative; margin: 10px 0 8px; }
      .pace__mark { position: absolute; top: -3px; bottom: -3px; width: 2.5px; border-radius: 2px; background: var(--ink); transform: translateX(-50%); }
      .bad { color: var(--danger); }
      .acc { display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--line); padding: 13px 16px; }
      .acc:last-child { border-bottom: 0; }
      .acc__check { width: 22px; height: 22px; flex-shrink: 0; border-radius: 6px; border: 1.5px solid var(--line-strong); display: grid; place-items: center; color: #fff; }
      .acc--done .acc__check { background: var(--fill-success); border-color: var(--fill-success); }
      .acc--done .acc__txt { text-decoration: line-through; color: var(--ink-3); }
      .acc__body { display: flex; flex-direction: column; gap: 2px; }
      .acc__txt { font-size: 13.5px; font-weight: 600; }
      .trio { display: flex; flex-direction: column; gap: 12px; }
      .trio__i strong { display: block; font-size: 16px; margin: 1px 0 5px; }
      .kv { display: flex; justify-content: space-between; font-size: 13.5px; padding: 3px 0; }
      .ok { color: var(--success); }
      .weeks { display: flex; gap: 10px; align-items: flex-end; justify-content: space-between; }
      .wk { flex: 1; text-align: center; }
      .wk__bars { display: flex; gap: 3px; align-items: flex-end; justify-content: center; height: 70px; }
      .wk__plan, .wk__real { width: 10px; border-radius: 4px 4px 0 0; }
      .wk__plan { background: var(--line-strong); }
      .wk__real { background: var(--brand-grad-strong); }
      .wk--cur .tiny { color: var(--brand-600); font-weight: 800; }
      .ext { display: block; }
      @media (max-width: 560px) { .metas { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CampanaN {
  protected readonly c = CAMPANA;
  protected readonly plan = PLAN_CAMPANA;
  protected readonly tab = signal(CAMPANA.actual);
  protected readonly done = signal(new Set(PLAN_CAMPANA.acciones.filter((a) => a.hecho).map((a) => a.id)));
  protected readonly ventaPct = Math.round((CAMPANA.ventaActual / CAMPANA.cuadrante.ventaRequerida) * 100);
  protected readonly gananciaPct = Math.round((PLAN_CAMPANA.gananciaProyectada / PLAN_CAMPANA.gananciaObjetivo) * 100);
  private readonly maxBar = Math.max(...PLAN_CAMPANA.semanas.flatMap((s) => [s.plan, s.logrado]));

  protected pct(a: number, b: number): number {
    return b ? Math.min(100, Math.round((a / b) * 100)) : 0;
  }
  protected detras(m: { actual: number; objetivo: number; esperadoHoy: number }): boolean {
    return this.pct(m.actual, m.objetivo) < m.esperadoHoy * 100;
  }
  protected alto(v: number): number {
    return Math.round((v / this.maxBar) * 100);
  }
  protected hechas(): number {
    return this.done().size;
  }
  protected toggle(id: string): void {
    const s = new Set(this.done());
    s.has(id) ? s.delete(id) : s.add(id);
    this.done.set(s);
  }
}
