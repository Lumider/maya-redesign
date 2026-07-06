import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { CAMPANA_BDM, CIERRES_BDM, USUARIA_BDM } from '../data/mock-bdm';

/**
 * Mi campaña (BDM) — detalle de los indicadores de la BDM (Figma 38-14867).
 * Cada card sigue la anatomía documentada en la base de conocimiento:
 * 1) banner con la brecha al bono · 2) indicador(es) principal(es) ·
 * 3) distribución de sus Directoras (cómo se compone el indicador) ·
 * 4) enlace al frente de gestión para actuar.
 * El indicador no es el fin: es la puerta a la asesoría (Plays 1–6).
 * El selector de periodo permite revisar las 3 campañas anteriores: una
 * campaña cerrada ya no tiene brechas, así que muestra los valores finales.
 */
@Component({
  selector: 'app-campana-bdm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">Mi campaña · {{ sel() }}</h1>
        <p class="v2-sub">
          @if (esActual()) {
            El detalle de tus indicadores en la {{ c.campana }} — y dónde intervenir.
          } @else {
            Campaña cerrada · {{ cierre().fechas }} — tus indicadores al cierre.
          }
        </p>
        <div class="periodos" role="tablist" aria-label="Campaña">
          @for (p of c.periodos; track p) {
            <button
              class="chip"
              role="tab"
              [class.chip--active]="p === sel()"
              [attr.aria-selected]="p === sel()"
              (click)="sel.set(p)"
            >
              {{ p }}{{ p === c.campana ? ' · actual' : '' }}
            </button>
          }
        </div>
        @if (esActual()) {
          <nav class="anchors" aria-label="Secciones">
            <a class="anchor" appAnchor="delta">Delta</a>
            <a class="anchor" appAnchor="crecimiento">Crecimiento de DIR</a>
            <a class="anchor" appAnchor="par">PAR+</a>
            <a class="anchor" appAnchor="poderosas">Poderosas</a>
            <a class="anchor" appAnchor="bp">Venta BP</a>
            <a class="anchor" appAnchor="driver">Driver Tree</a>
          </nav>
        }
      </header>

      @if (!esActual()) {
        <!-- Campaña cerrada: los 6 indicadores con su valor final, sin brechas -->
        <section class="v2-section" appReveal>
          <div class="card pad cierre">
            <div class="cierre__info">
              <span class="badge badge--neutral">Campaña cerrada</span>
              <h2 class="cierre__t">Así cerró tu unidad la {{ cierre().campana }}</h2>
              <p class="muted">{{ cierre().nota }}</p>
            </div>
          </div>

          <div class="cierre__kpis">
            <div class="card pad ckpi">
              <span class="tiny">Delta · DIR en CA</span>
              <strong class="ckpi__v">{{ cierre().deltaPct }}%</strong>
              <span class="tiny">al cierre de la campaña</span>
            </div>
            <div class="card pad ckpi">
              <span class="tiny"># Directoras</span>
              <strong class="ckpi__v">{{ cierre().dir }}</strong>
              <span class="tiny">capitalización de la unidad</span>
            </div>
            <div class="card pad ckpi">
              <span class="tiny">PAR+ · NE 1 a más</span>
              <strong class="ckpi__v">{{ cierre().ne1Pct }}%</strong>
              <span class="tiny">DIR con Nivel de Estrella</span>
            </div>
            <div class="card pad ckpi">
              <span class="tiny">Líderes Poderosas</span>
              <strong class="ckpi__v">{{ cierre().poderosas }}</strong>
              <span class="tiny">al cierre de la campaña</span>
            </div>
            <div class="card pad ckpi">
              <span class="tiny">Cumplimiento Vta. Neta BP</span>
              <strong class="ckpi__v">{{ cierre().bpPct }}%</strong>
              <div class="progress" [class.progress--success]="cierre().bpPct >= 100">
                <div class="progress__fill" [style.width.%]="min100(cierre().bpPct)"></div>
              </div>
            </div>
            <div class="card pad ckpi">
              <span class="tiny">Venta Neta {{ cierre().campana }}</span>
              <strong class="ckpi__v">S/ {{ cierre().ventaNeta | number: '1.2-2' }}</strong>
              <span class="tiny">Driver Tree</span>
            </div>
          </div>

          <p class="tiny cierre__volver">
            Estás viendo una campaña cerrada —
            <button class="link link--btn" (click)="sel.set(c.campana)">
              volver a la {{ c.campana }} actual</button
            >.
          </p>
        </section>
      } @else {
        <div class="cards">
          <!-- 1 · Delta: solidez (crecimiento campaña a campaña) → bono trimestral -->
          <section id="delta" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="trending" [size]="18" /> Delta</h2>
            <div class="alert alert--warning">⚠️ {{ c.delta.banner }}</div>
            <div class="duo">
              <div class="kpi card">
                <span class="tiny">Campaña {{ c.campana }}</span>
                <strong class="kpi__v">{{ c.delta.campanaPct }}%</strong>
                <span class="tiny">DIR en Cuadrante A</span>
              </div>
              <div class="kpi card">
                <span class="tiny">Prom. Trimestral</span>
                <strong class="kpi__v">{{ c.delta.promTrimestral }}%</strong>
                <span class="tiny">mide tu bono</span>
              </div>
            </div>
            <span class="vs__label"># DIR por cuadrante {{ c.campana }}</span>
            <div class="barras" role="img" aria-label="Distribución de Directoras por cuadrante">
              @for (d of c.delta.distribucion; track d.cuadrante) {
                <div class="barra">
                  <div class="barra__col">
                    <div class="barra__fill" [style.height.%]="d.pct"></div>
                  </div>
                  <span class="barra__l">{{ d.cuadrante }}</span>
                  <span class="tiny">{{ d.pct }}% ({{ d.n }})</span>
                </div>
              }
            </div>
            <span class="vs__label">Bono trimestral según Prom. de DIR en CA</span>
            <div class="tramos">
              @for (t of c.delta.bonoTramos; track t.prom) {
                <span class="tramo" [class.tramo--on]="c.delta.promTrimestral >= t.prom"
                  >{{ t.prom }}% → bono {{ t.bono }}%</span
                >
              }
            </div>
            <a class="link" routerLink="/n/directoras">{{ c.delta.enlace }} ↗</a>
          </section>

          <!-- 2 · Crecimiento de DIR: capitalización (motor del país) -->
          <section id="crecimiento" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="users" [size]="18" /> Crecimiento de DIR</h2>
            <div class="alert alert--warning">⚠️ {{ c.crecimiento.banner }}</div>
            <div class="duo">
              <div class="kpi card">
                <span class="tiny">#DIR {{ c.campana }}</span>
                <strong class="kpi__v"
                  >{{ c.crecimiento.dirActual }}
                  <span class="kpi__delta">+{{ c.crecimiento.variacion }}</span></strong
                >
              </div>
              <div class="kpi card">
                <span class="tiny">{{ c.crecimiento.cierreAnterior.etiqueta }}</span>
                <strong class="kpi__v">{{ c.crecimiento.cierreAnterior.valor }}</strong>
                <span class="tiny">cierre del año anterior</span>
              </div>
            </div>
            <span class="vs__label">Meta de #DIR por trimestre</span>
            <div class="tramos">
              @for (t of c.crecimiento.tramos; track t.q) {
                <span class="tramo" [class.tramo--on]="c.crecimiento.dirActual >= t.meta">
                  {{ t.q }}: {{ t.meta }}
                  @if (t.bono) {
                    <span class="tiny">bono {{ t.bono }}%</span>
                  }
                </span>
              }
            </div>
            <a class="link" routerLink="/n/directoras">{{ c.crecimiento.enlace }} ↗</a>
          </section>

          <!-- 3 · PAR+: % de DIR con Nivel de Estrella → bono anual -->
          <section id="par" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="star" [size]="18" /> PAR+</h2>
            <div class="alert alert--warning">⚠️ {{ c.par.banner }}</div>
            <div class="duo">
              <div class="kpi card">
                <span class="tiny">NE 1 a más</span>
                <strong class="kpi__v">{{ c.par.ne1.pct }}%</strong>
                <span class="tiny"
                  >meta {{ c.par.ne1.metaPct }}% · no formaron {{ c.par.ne1.noFormaron }}</span
                >
              </div>
              <div class="kpi card">
                <span class="tiny">NE 3 a más</span>
                <strong class="kpi__v">{{ c.par.ne3.pct }}%</strong>
                <span class="tiny"
                  >meta {{ c.par.ne3.metaPct }}% · no formaron {{ c.par.ne3.noFormaron }}</span
                >
              </div>
            </div>
            <span class="vs__label"># Directoras por Nivel de Estrella</span>
            <div class="barras" role="img" aria-label="Distribución de Directoras por estrella">
              @for (d of c.par.distribucion; track d.rango) {
                <div class="barra">
                  <div class="barra__col">
                    <div class="barra__fill" [style.height.%]="d.pct"></div>
                  </div>
                  <span class="barra__l">{{ d.rango }}</span>
                  <span class="tiny">{{ d.pct }}% ({{ d.n }})</span>
                </div>
              }
            </div>
            <a class="link" routerLink="/n/directoras">{{ c.par.enlace }} ↗</a>
          </section>

          <!-- 4 · Líderes Poderosas: con quién crece la BDM → bono anual -->
          <section id="poderosas" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="sparkles" [size]="18" /> Líderes Poderosas</h2>
            <div class="alert alert--warning">⚠️ {{ c.poderosas.banner }}</div>
            <div class="alert alert--danger">❌ {{ c.poderosas.alerta }}</div>
            <div class="duo">
              <div class="kpi card">
                <span class="tiny">Poderosa</span>
                <strong class="kpi__v"
                  >{{ c.poderosas.poderosa.n }} ({{ c.poderosas.poderosa.pct }}%)</strong
                >
                <span class="tiny"
                  >meta {{ c.poderosas.poderosa.metaN }} ({{ c.poderosas.poderosa.metaPct }}%)</span
                >
              </div>
              <div class="kpi card">
                <span class="tiny">Ejemplo</span>
                <strong class="kpi__v"
                  >{{ c.poderosas.ejemplo.n }} ({{ c.poderosas.ejemplo.pct }}%)</strong
                >
                <span class="tiny"
                  >meta {{ c.poderosas.ejemplo.metaN }} ({{ c.poderosas.ejemplo.metaPct }}%)</span
                >
              </div>
            </div>
            <a class="link" routerLink="/n/directoras">{{ c.poderosas.enlace }} ↗</a>
          </section>

          <!-- 5 · Cumplimiento Vta. Neta BP: avance del plan anual de venta -->
          <section id="bp" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="chart" [size]="18" /> Cumplimiento Vta. Neta BP</h2>
            <div class="alert alert--warning">⚠️ {{ c.bp.banner }}</div>
            <div class="kpi card" style="max-width:none">
              <span class="tiny">Cumplimiento de venta</span>
              <strong class="kpi__v">{{ c.bp.cumplimientoPct }}% vs BP</strong>
              <div class="progress" style="margin:10px 0 6px">
                <div class="progress__fill" [style.width.%]="c.bp.cumplimientoPct"></div>
              </div>
              <span class="tiny"
                >S/ {{ c.bp.real | number: '1.2-2' }} de S/ {{ c.bp.meta | number: '1.2-2' }}</span
              >
            </div>
          </section>

          <!-- 6 · Driver Tree: composición de la venta + ranking nacional -->
          <section id="driver" class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="box" [size]="18" /> Driver Tree</h2>
            <div class="duo">
              <div class="kpi card">
                <span class="tiny">Venta Neta {{ c.campana }}</span>
                <strong class="kpi__v">S/ {{ c.driver.venta | number: '1.2-2' }}</strong>
                <div class="etiquetas">
                  @for (e of c.driver.comparativos; track e) {
                    <span class="badge badge--info">{{ e }}</span>
                  }
                </div>
              </div>
              <div class="kpi card">
                <span class="tiny">{{ c.driver.ranking.nombre }}</span>
                <strong class="kpi__v"
                  >{{ c.driver.ranking.puesto }}/{{ c.driver.ranking.total }}</strong
                >
              </div>
            </div>
            <a class="link" routerLink="/n/directoras">{{ c.driver.enlace }} ↗</a>
          </section>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .pad {
        padding: 18px 20px;
      }
      .periodos {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 12px 0 4px;
      }

      /* Campaña cerrada: valores finales de los 6 indicadores */
      .cierre {
        margin-bottom: 16px;
      }
      .cierre__t {
        font-size: 20px;
        margin: 8px 0 4px;
      }
      .cierre__info .muted {
        margin: 0;
        font-size: 13.5px;
      }
      .cierre__kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .ckpi {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ckpi__v {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 800;
      }
      .ckpi .progress {
        margin: 4px 0 2px;
      }
      .cierre__volver {
        margin: 14px 0 0;
      }
      .link--btn {
        border: 0;
        background: none;
        padding: 0;
        font: inherit;
        color: var(--brand-600);
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
      @media (max-width: 860px) {
        .cierre__kpis {
          grid-template-columns: 1fr 1fr;
        }
      }
      .cards {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cards .alert {
        margin: 10px 0;
      }
      .duo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 10px 0 14px;
      }
      .kpi {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 14px 16px;
      }
      .kpi__v {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 800;
      }
      .kpi__delta {
        font-size: 14px;
        color: var(--success);
        font-weight: 800;
      }
      .etiquetas {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      /* Distribución de Directoras: barras verticales simples (CSS puro) */
      .barras {
        display: flex;
        gap: 18px;
        align-items: flex-end;
        margin: 10px 0 16px;
      }
      .barra {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .barra__col {
        width: 44px;
        height: 96px;
        display: flex;
        align-items: flex-end;
        background: var(--sand);
        border-radius: var(--radius-s);
        overflow: hidden;
      }
      .barra__fill {
        width: 100%;
        background: var(--brand-grad-strong);
        border-radius: var(--radius-s) var(--radius-s) 0 0;
        min-height: 4px;
      }
      .barra__l {
        font-weight: 800;
        font-size: 13px;
      }

      /* Tramos de bono/meta: pastillas que se encienden al alcanzarse */
      .tramos {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 8px 0 14px;
      }
      .tramo {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 99px;
        border: 1.5px solid var(--line-strong);
        font-size: 12.5px;
        font-weight: 700;
        color: var(--ink-2);
      }
      .tramo--on {
        border-color: var(--success);
        color: var(--success);
        background: var(--success-bg);
      }

      .link {
        font-weight: 700;
        color: var(--brand-600);
        cursor: pointer;
      }

      @media (max-width: 700px) {
        .duo {
          grid-template-columns: 1fr;
        }
        .barras {
          gap: 12px;
        }
      }
    `,
  ],
})
export class CampanaBdm {
  protected readonly c = CAMPANA_BDM;
  protected readonly u = USUARIA_BDM;

  /** Selector de periodo: la campaña actual + las 3 cerradas anteriores. */
  protected readonly sel = signal(CAMPANA_BDM.campana);
  protected readonly esActual = computed(() => this.sel() === CAMPANA_BDM.campana);
  protected readonly cierre = computed(
    () => CIERRES_BDM.find((x) => x.campana === this.sel()) ?? CIERRES_BDM[0],
  );

  protected min100(v: number): number {
    return Math.min(100, v);
  }
}
