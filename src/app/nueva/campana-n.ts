import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { CAMPANA, PLAN_CAMPANA, CUADRANTE_HISTORIA, RECONOCIMIENTOS } from '../data/mock';

/**
 * Mi campaña (ejecuta): ¿voy a tiempo y qué hago esta campaña?
 * Metas con capa de gamificación sobre recompensas REALES de Yanbal
 * (misión Cuadrante A, bono, racha, checkpoints, medalla) — nunca puntos inventados.
 * Cuadrante/IM/crédito viven en Mi negocio; el sueño PAR+ en Mi carrera: solo se enlazan.
 */
@Component({
  selector: 'app-campana-n',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Ring, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi campaña</nav>
        <div class="row-between">
          <div><h1 class="v2-title">Mi campaña</h1><p class="v2-sub">¿Voy a tiempo y qué hago esta campaña?</p></div>
          <div class="tabs">
            @for (t of c.tabs; track t) {
              <button class="tabs__tab" [class.tabs__tab--active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
            }
          </div>
        </div>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" appAnchor="plan">Mi plan</a>
          <a class="anchor" appAnchor="mision">Misión</a>
          <a class="anchor" appAnchor="acciones">Acciones</a>
          <a class="anchor" appAnchor="ritmo">Ritmo</a>
          <a class="anchor anchor--ext">Mis pedidos</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Mi plan · tu sueño (ancla; el plan completo se ejecuta aquí abajo) -->
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

          <!-- Metas gamificadas: la Misión de la campaña -->
          <section id="mision" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="target" [size]="18" /> Misión de {{ tab() }} <span class="tiny" style="font-weight:500">recompensas reales, no puntos</span></h2>

            <!-- Misión + premio al frente -->
            <div class="card pad mission" [class.mission--won]="cuadranteListo()">
              <div class="mission__head">
                <div>
                  <span class="badge" [class]="cuadranteListo() ? 'badge badge--success' : 'badge badge--warning'">{{ cuadranteListo() ? 'Premio desbloqueado' : 'Misión en curso' }}</span>
                  <h3 class="mission__title">Sube a Cuadrante A</h3>
                  <p class="tiny">Cumple los 2 checkpoints y ganas el Bono de Desempeño de {{ tab() }}.</p>
                </div>
                <div class="reward" [class.reward--locked]="!cuadranteListo()">
                  <span class="reward__emoji">🏆</span>
                  <div>
                    <div class="reward__val">\${{ c.cuadrante.bono | number }}</div>
                    <div class="tiny">Bono de Desempeño</div>
                  </div>
                  @if (!cuadranteListo()) { <span class="reward__lock" aria-label="Bloqueado">🔒</span> }
                </div>
              </div>

              <!-- Racha (aversión a la pérdida, en tono de aliento) -->
              <div class="streak">
                <div class="streak__top">
                  <strong><app-icon name="trending" [size]="15" /> Racha: {{ rachaCumplidas }} campañas en Cuadrante A</strong>
                  <span class="tiny streak__msg">{{ tab() }} en riesgo — aún estás a tiempo de no romperla 💪</span>
                </div>
                <div class="streak__row" role="img" [attr.aria-label]="rachaCumplidas + ' campañas en Cuadrante A, ' + tab() + ' pendiente'">
                  @for (h of racha; track h.campana) {
                    <span
                      class="streak__dot"
                      [class.streak__dot--on]="h.valor==='A'"
                      [class.streak__dot--risk]="h.campana===c.actual && h.valor!=='A'"
                      [title]="h.campana + ': ' + (h.valor==='A' ? 'Cuadrante A' : h.campana===c.actual ? 'En riesgo' : h.valor)"
                    >
                      @if (h.valor==='A') { <app-icon name="check" [size]="12" /> } @else { {{ h.campana===c.actual ? '!' : h.valor }} }
                      <small>{{ h.campana }}</small>
                    </span>
                  }
                </div>
              </div>

              <!-- Camino de checkpoints que desbloquean el premio -->
              <div class="checks">
                <!-- Checkpoint 1: Venta (MRM vs meta C6, claramente diferenciadas) -->
                <div class="check" [class.check--ok]="ventaMrmPct>=100" [class.check--warn]="ventaMrmPct<100">
                  <span class="check__ic"><app-icon [name]="ventaMrmPct>=100 ? 'check' : 'trending'" [size]="15" /></span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>Venta · MRM</strong>
                      <span class="check__n">{{ ventaMrmPct }}% <span class="muted">· casi</span></span>
                    </div>
                    <div class="progress" [class.progress--success]="ventaMrmPct>=100"><div class="progress__fill" [style.width.%]="ventaMrmPct"></div></div>
                    <div class="check__foot tiny">
                      Mínimo para calificar: \${{ c.cuadrante.ventaRequerida | number }} · faltan <strong>\${{ c.cuadrante.faltaVenta | number }}</strong>
                    </div>
                    <div class="stretch tiny">
                      <span class="stretch__bar"><span class="stretch__fill" [style.width.%]="ventaC6Pct"></span></span>
                      Meta {{ tab() }} (reto): \${{ c.meta | number }} · vas {{ ventaC6Pct }}%
                    </div>
                  </div>
                </div>

                <!-- Checkpoint 2: Primeros pedidos -->
                <div class="check" [class.check--ok]="ppedListo()" [class.check--bad]="!ppedListo()">
                  <span class="check__ic"><app-icon [name]="ppedListo() ? 'check' : 'box'" [size]="15" /></span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>Primeros pedidos</strong>
                      <span class="check__n">{{ c.primerosPedidos.valor }}/{{ c.primerosPedidos.meta }} <span class="muted">· pendiente</span></span>
                    </div>
                    <div class="progress"><div class="progress__fill" [style.width.%]="ppedPct"></div></div>
                    <div class="check__foot tiny">Requisito de Cuadrante A · te faltan <strong>{{ c.cuadrante.ppedFaltantes }}</strong></div>
                  </div>
                </div>

                <!-- Desbloqueo -->
                <div class="check check--unlock" [class.check--ok]="cuadranteListo()">
                  <span class="check__ic">{{ cuadranteListo() ? '🎉' : '🔒' }}</span>
                  <div class="check__body">
                    <strong>Cuadrante A + Bono \${{ c.cuadrante.bono | number }}</strong>
                    <div class="tiny">{{ cuadranteListo() ? '¡Lo lograste! Tu bono está asegurado.' : 'Se desbloquea al cumplir los 2 checkpoints.' }}</div>
                  </div>
                </div>
              </div>

              <!-- Reto de la semana + Trofeo del año -->
              <div class="mission__foot">
                <a class="foot-card" appAnchor="acciones">
                  <app-ring [pct]="retoPct()" [size]="58" [label]="'reto'" [expected]="100" />
                  <div><strong class="tiny2">Reto de la semana</strong><div class="tiny">{{ hechas() }}/{{ plan.acciones.length }} acciones hechas</div></div>
                </a>
                <div class="foot-card">
                  <span class="trophy">🥇</span>
                  <div><strong class="tiny2">Medalla Excelencia GP</strong><div class="tiny">{{ recon.excelenciaGP.medalla }} · {{ recon.excelenciaGP.cumplidas }}/{{ recon.excelenciaGP.de }} campañas del año</div></div>
                </div>
              </div>

              <!-- Ancla al sueño: el bono es un paso, no el destino -->
              <a class="dream" routerLink="/n/carrera">
                <span>🌴</span>
                <p>El bono no es la meta final: es un paso hacia <strong>{{ c.par.sueno }}</strong>. Míralo en Mi carrera.</p>
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </div>
          </section>

          <!-- Acciones de la semana -->
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
          <!-- Activas: única casa de retenidas/reactivadas/1ros pedidos -->
          <div class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px"><app-icon name="users" [size]="16" /> Activas · {{ c.activas.total }}/{{ c.activas.meta }}</h3>
            <div class="trio">
              <div class="trio__i"><span class="tiny">Retenidas</span><strong>{{ c.retenidas.valor }}<span class="muted">/{{ c.retenidas.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.retenidas.valor,c.retenidas.meta)"></div></div></div>
              <div class="trio__i"><span class="tiny">Reactivadas</span><strong>{{ c.reactivadas.valor }}<span class="muted">/{{ c.reactivadas.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.reactivadas.valor,c.reactivadas.meta)"></div></div></div>
              <div class="trio__i"><span class="tiny">1ros pedidos</span><strong>{{ c.primerosPedidos.valor }}<span class="muted">/{{ c.primerosPedidos.meta }}</span></strong><div class="progress"><div class="progress__fill" [style.width.%]="pct(c.primerosPedidos.valor,c.primerosPedidos.meta)"></div></div></div>
            </div>
          </div>

          <div class="card pad" appReveal [revealDelay]="60">
            <h3 class="v2-h" style="font-size:15px">🎁 Premios Ganamás</h3>
            <div class="kv"><span>Calificados (retener)</span><strong>{{ c.premios.calificados }}</strong></div>
            <div class="kv"><span>Cerca del premio</span><strong>{{ c.premios.cercaDelPremio }}</strong></div>
            <div class="kv"><span>Consultoras productivas</span><strong class="ok">{{ c.productivas.valor }} / {{ c.productivas.meta }}</strong></div>
          </div>

          <div id="ritmo" class="card pad" appReveal [revealDelay]="110">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="chart" [size]="16" /> Ritmo semanal</h3>
            <div class="weeks">
              @for (s of plan.semanas; track s.n) {
                <div class="wk" [class.wk--cur]="s.n===plan.semanaActual">
                  <div class="wk__bars"><span class="wk__plan" [style.height.%]="alto(s.plan)"></span><span class="wk__real" [style.height.%]="alto(s.logrado)"></span></div>
                  <span class="tiny">S{{ s.n }}</span>
                  @if (s.logrado>=s.plan && s.logrado>0) { <span class="wk__hit tiny">✓</span> }
                </div>
              }
            </div>
          </div>

          <!-- Relacionado: solo enlaces a la vista dueña -->
          <div class="card pad" appReveal [revealDelay]="150">
            <h3 class="v2-h" style="font-size:15px">Relacionado</h3>
            <a class="rel" routerLink="/n/negocio">
              <app-icon name="chart" [size]="16" />
              <div><strong>Tu Cuadrante</strong><div class="tiny">Cuadrante, IM y crédito en Mi negocio</div></div>
              <app-icon name="arrow-right" [size]="15" />
            </a>
            <a class="rel" routerLink="/n/carrera">
              <app-icon name="star" [size]="16" />
              <div><strong>Tu Sueño PAR+</strong><div class="tiny">Estrellas, viaje y medallas en Mi carrera</div></div>
              <app-icon name="arrow-right" [size]="15" />
            </a>
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

      /* Plan / sueño */
      .plan { display: flex; gap: 18px; align-items: center; border-color: var(--warning); flex-wrap: wrap; }
      .plan--ok { border-color: var(--success); }
      .plan__week { text-align: center; }
      .plan__wn { font-family: var(--font-display); font-size: 30px; font-weight: 800; width: 60px; height: 60px; border-radius: 99px; display: grid; place-items: center; background: var(--brand-grad-strong); color: #fff; }
      .plan__main { flex: 1; min-width: 220px; }
      .plan__main p { margin: 6px 0 0; font-size: 13px; }
      .plan__gain { text-align: center; }

      /* ---- Misión (gamificación) ---- */
      .mission { border-color: var(--brand-200); }
      .mission--won { border-color: var(--success); }
      .mission__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
      .mission__title { font-size: 20px; margin: 6px 0 2px; }
      .mission__head .tiny { margin: 0; }

      .reward { display: flex; align-items: center; gap: 10px; background: var(--brand-grad-strong); color: #fff; border-radius: var(--radius); padding: 12px 16px; position: relative; }
      .reward__emoji { font-size: 26px; }
      .reward__val { font-family: var(--font-display); font-size: 20px; font-weight: 800; line-height: 1; }
      .reward .tiny { color: rgba(255, 255, 255, 0.85); }
      .reward--locked { filter: saturate(0.7) brightness(0.92); }
      .reward__lock { position: absolute; top: -8px; right: -8px; font-size: 15px; background: var(--surface); border-radius: 99px; padding: 3px 5px; box-shadow: var(--shadow-s); }

      /* Racha */
      .streak { margin: 16px 0; padding: 14px 16px; background: var(--sand); border-radius: var(--radius); }
      .streak__top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
      .streak__top strong { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
      .streak__msg { color: var(--warning); font-weight: 600; }
      .streak__row { display: flex; gap: 7px; flex-wrap: wrap; }
      .streak__dot { position: relative; width: 34px; height: 34px; border-radius: 99px; display: grid; place-items: center; background: var(--surface); border: 1.5px solid var(--line-strong); color: var(--ink-3); font-weight: 800; font-size: 12px; }
      .streak__dot small { position: absolute; bottom: -15px; font-size: 9px; font-weight: 700; color: var(--ink-3); }
      .streak__dot--on { background: var(--fill-success); border-color: var(--fill-success); color: #fff; }
      .streak__dot--risk { border-color: var(--danger); color: var(--danger); border-style: dashed; }

      /* Checkpoints */
      .checks { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
      .check { display: flex; gap: 12px; align-items: flex-start; padding: 13px 14px; border-radius: var(--radius); background: var(--sand); border-left: 3px solid var(--line-strong); }
      .check__ic { width: 28px; height: 28px; flex-shrink: 0; border-radius: 99px; display: grid; place-items: center; background: var(--surface); color: var(--ink-2); font-size: 15px; }
      .check__body { flex: 1; min-width: 0; }
      .check__n { font-weight: 800; font-size: 13.5px; }
      .check__foot { margin-top: 6px; }
      .check .progress { margin: 8px 0 0; }
      .check--ok { border-left-color: var(--success); } .check--ok .check__ic { background: var(--fill-success); color: #fff; }
      .check--warn { border-left-color: var(--warning); } .check--warn .check__ic { background: var(--warning-bg); color: var(--warning); }
      .check--bad { border-left-color: var(--danger); } .check--bad .check__ic { background: var(--danger-bg); color: var(--danger); }
      .check--unlock { align-items: center; background: transparent; border: 1.5px dashed var(--line-strong); border-left-width: 3px; }
      .check--unlock.check--ok { border-style: solid; background: var(--success-bg); }

      .stretch { display: flex; align-items: center; gap: 8px; margin-top: 8px; color: var(--ink-3); }
      .stretch__bar { flex: 0 0 60px; height: 5px; border-radius: 99px; background: var(--line); overflow: hidden; }
      .stretch__fill { display: block; height: 100%; border-radius: 99px; background: var(--brand-400); }

      /* Reto + trofeo */
      .mission__foot { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
      .foot-card { display: flex; align-items: center; gap: 12px; background: var(--sand); border-radius: var(--radius); padding: 10px 14px; text-align: left; }
      a.foot-card { cursor: pointer; transition: background 0.15s ease; }
      a.foot-card:hover { background: var(--line); }
      .tiny2 { font-size: 13px; }
      .trophy { font-size: 30px; }

      /* Ancla al sueño */
      .dream { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px 16px; border-radius: var(--radius); background: var(--brand-100); color: var(--ink); transition: filter 0.15s ease; }
      .dream:hover { filter: brightness(0.97); }
      .dream span { font-size: 24px; }
      .dream p { margin: 0; font-size: 13px; }
      .dream app-icon { margin-left: auto; color: var(--brand-700); }

      /* Acciones */
      .acc { display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--line); padding: 13px 16px; }
      .acc:last-child { border-bottom: 0; }
      .acc__check { width: 22px; height: 22px; flex-shrink: 0; border-radius: 6px; border: 1.5px solid var(--line-strong); display: grid; place-items: center; color: #fff; }
      .acc--done .acc__check { background: var(--fill-success); border-color: var(--fill-success); }
      .acc--done .acc__txt { text-decoration: line-through; color: var(--ink-3); }
      .acc__body { display: flex; flex-direction: column; gap: 2px; }
      .acc__txt { font-size: 13.5px; font-weight: 600; }

      /* Sidebar */
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
      .wk__hit { display: block; color: var(--success); font-weight: 800; }

      .rel { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line); color: var(--ink); }
      .rel:first-of-type { border-top: 0; }
      .rel > app-icon:first-child { color: var(--brand-600); flex-shrink: 0; }
      .rel > app-icon:last-child { margin-left: auto; color: var(--ink-3); }
      .rel strong { font-size: 13.5px; }
      .rel:hover strong { color: var(--brand-600); }
      .ext { display: block; }

      @media (max-width: 560px) { .mission__foot { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CampanaN {
  protected readonly c = CAMPANA;
  protected readonly plan = PLAN_CAMPANA;
  protected readonly recon = RECONOCIMIENTOS;
  protected readonly racha = CUADRANTE_HISTORIA.filter((h) => h.valor !== '-');
  protected readonly rachaCumplidas = this.racha.filter((h) => h.valor === 'A').length;

  protected readonly tab = signal(CAMPANA.actual);
  protected readonly done = signal(new Set(PLAN_CAMPANA.acciones.filter((a) => a.hecho).map((a) => a.id)));

  protected readonly gananciaPct = Math.round((PLAN_CAMPANA.gananciaProyectada / PLAN_CAMPANA.gananciaObjetivo) * 100);
  /** Vara de calificación: venta vs MRM (mínimo para Cuadrante A). */
  protected readonly ventaMrmPct = Math.round((CAMPANA.ventaActual / CAMPANA.cuadrante.ventaRequerida) * 100);
  /** Vara de reto: venta vs meta C6 (stretch del plan). Diferenciada del MRM. */
  protected readonly ventaC6Pct = Math.round((CAMPANA.ventaActual / CAMPANA.meta) * 100);
  protected readonly ppedPct = this.pct(CAMPANA.primerosPedidos.valor, CAMPANA.primerosPedidos.meta);

  protected readonly retoPct = computed(() => Math.round((this.done().size / PLAN_CAMPANA.acciones.length) * 100));

  private readonly maxBar = Math.max(...PLAN_CAMPANA.semanas.flatMap((s) => [s.plan, s.logrado]));

  protected ppedListo(): boolean {
    return this.c.primerosPedidos.valor >= this.c.primerosPedidos.meta;
  }
  protected cuadranteListo(): boolean {
    return this.ventaMrmPct >= 100 && this.ppedListo();
  }

  protected pct(a: number, b: number): number {
    return b ? Math.min(100, Math.round((a / b) * 100)) : 0;
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
