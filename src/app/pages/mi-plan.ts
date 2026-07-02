import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { PLAN_CAMPANA } from '../data/mock';

/**
 * Mi Plan — Business Plan digital de la campaña.
 * Semana 1: se planifica (Sueño → Ganancia → Venta → Activas → Acciones).
 * Semanas 2-4: Maya acompaña con ritmo esperado, acciones y reconocimiento.
 */
@Component({
  selector: 'app-mi-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <nav class="crumbs" aria-label="Ruta de navegación">
            <a routerLink="/inicio">Inicio</a> / Mi Plan
          </nav>
          <h1 class="page-title">Mi Plan · {{ plan.campana }}</h1>
        </div>
        <div class="tabs">
          <button
            class="tabs__tab"
            [class.tabs__tab--active]="vista() === 'seguimiento'"
            (click)="vista.set('seguimiento')"
          >
            Seguimiento
          </button>
          <button
            class="tabs__tab"
            [class.tabs__tab--active]="vista() === 'plan'"
            (click)="vista.set('plan')"
          >
            Mi plan
          </button>
        </div>
      </header>

      <!-- Estado de la campaña -->
      <section
        class="status card"
        [class.status--risk]="plan.estado === 'en-riesgo'"
        [class.status--ok]="plan.estado !== 'en-riesgo'"
      >
        <div class="status__week">
          <div class="status__weeknum">S{{ plan.semanaActual }}</div>
          <div class="tiny">de {{ plan.totalSemanas }} semanas</div>
        </div>
        <div class="status__main">
          <div class="status__row">
            <strong>{{
              plan.estado === 'en-riesgo' ? 'Vas por debajo del ritmo' : '¡Vas en ritmo!'
            }}</strong>
            <span
              class="badge"
              [class]="
                plan.estado === 'en-riesgo' ? 'badge badge--warning' : 'badge badge--success'
              "
            >
              {{ plan.estado === 'en-riesgo' ? 'En riesgo' : 'En ritmo' }}
            </span>
          </div>
          <p class="muted">
            Tu sueño: <strong>“{{ plan.sueno }}”</strong> — necesita una ganancia de
            <strong>\${{ plan.gananciaObjetivo | number }}</strong> esta campaña. Al ritmo actual
            proyectas <strong>\${{ plan.gananciaProyectada | number }}</strong
            >.
          </p>
          <div
            class="progress status__bar"
            [class.progress--success]="plan.estado !== 'en-riesgo'"
            role="progressbar"
            [attr.aria-valuenow]="pct(plan.gananciaProyectada, plan.gananciaObjetivo)"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="
              'Ganancia proyectada: ' +
              pct(plan.gananciaProyectada, plan.gananciaObjetivo) +
              '% del objetivo'
            "
          >
            <div
              class="progress__fill"
              [style.width.%]="pct(plan.gananciaProyectada, plan.gananciaObjetivo)"
            ></div>
          </div>
        </div>
        <div class="status__gain">
          <div class="tiny">Ganancia proyectada</div>
          <div class="status__gainval">\${{ plan.gananciaProyectada | number }}</div>
          <div class="tiny">de \${{ plan.gananciaObjetivo | number }} objetivo</div>
        </div>
      </section>

      @if (vista() === 'seguimiento') {
        <!-- Metas con marcador de ritmo -->
        <h2 class="section-title">
          Tus metas <span class="tiny">la línea negra marca dónde deberías ir hoy</span>
        </h2>
        <div class="goals">
          @for (m of plan.metas; track m.id) {
            <article class="goal card">
              <div class="goal__head">
                <strong>{{ m.label }}</strong>
                <span class="goal__nums">
                  {{ m.dinero ? '$' : '' }}{{ m.actual | number }}
                  <span class="muted">/ {{ m.dinero ? '$' : '' }}{{ m.objetivo | number }}</span>
                </span>
              </div>
              <div class="pace">
                <div class="progress">
                  <div class="progress__fill" [style.width.%]="pct(m.actual, m.objetivo)"></div>
                </div>
                <div class="pace__marker" [style.left.%]="m.esperadoHoy * 100"></div>
              </div>
              <div
                class="goal__delta"
                [class.goal__delta--bad]="detras(m)"
                [class.goal__delta--ok]="!detras(m)"
              >
                @if (detras(m)) {
                  ▼ {{ deltaPuntos(m) }} pts detrás del ritmo
                } @else {
                  ▲ {{ deltaPuntos(m) }} pts adelante del ritmo
                }
                <span class="tiny">· {{ m.detalle }}</span>
              </div>
            </article>
          }
        </div>

        <!-- Acciones de la semana -->
        <h2 class="section-title">
          Acciones de la semana {{ plan.semanaActual }}
          <span class="tiny">{{ hechas() }}/{{ plan.acciones.length }} completadas</span>
        </h2>
        <div class="todo card">
          @for (a of plan.acciones; track a.id) {
            <div class="todo__item" [class.todo__item--done]="estaHecha(a.id)">
              <button
                class="todo__check"
                [class.todo__check--on]="estaHecha(a.id)"
                (click)="toggle(a.id)"
                [attr.aria-label]="'Marcar ' + a.texto"
              >
                @if (estaHecha(a.id)) {
                  <app-icon name="check" [size]="14" />
                }
              </button>
              <div class="todo__body">
                <div class="todo__text">{{ a.texto }}</div>
                <div class="tiny">{{ a.impacto }}</div>
              </div>
              <a class="todo__go" [routerLink]="a.link" aria-label="Ir">
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </div>
          }
        </div>

        <!-- Ritmo semanal -->
        <h2 class="section-title">Ritmo de venta por semana</h2>
        <section class="card pad">
          <div class="weeks">
            @for (s of plan.semanas; track s.n) {
              <div class="week" [class.week--current]="s.n === plan.semanaActual">
                <div class="week__bars">
                  <div
                    class="week__bar week__bar--plan"
                    [style.height.%]="alto(s.plan)"
                    title="Plan"
                  ></div>
                  <div
                    class="week__bar week__bar--real"
                    [style.height.%]="alto(s.logrado)"
                    title="Logrado"
                  ></div>
                </div>
                <div class="week__label">S{{ s.n }}</div>
                <div class="tiny">
                  @if (s.n < plan.semanaActual || s.logrado > 0) {
                    \${{ s.logrado | number }} / \${{ s.plan | number }}
                  } @else {
                    plan \${{ s.plan | number }}
                  }
                </div>
                @if (s.logrado >= s.plan && s.logrado > 0) {
                  <span class="week__hit">🎉 ¡Lograda!</span>
                }
              </div>
            }
          </div>
          <div class="legendline tiny">
            <span class="dotk dotk--plan"></span> Plan semanal
            <span class="dotk dotk--real"></span> Logrado
          </div>
        </section>
      } @else {
        <!-- Vista del plan: marco Sueño → Ganancia → Venta → Activas → Acciones -->
        <div class="chain">
          <section class="card pad chain__step">
            <div class="chain__num">1</div>
            <h3>Tu sueño</h3>
            <p class="chain__value">“{{ plan.sueno }}”</p>
            <p class="tiny">Todo el plan nace aquí: el sueño se convierte en un número.</p>
          </section>
          <app-icon class="chain__arrow" name="arrow-right" [size]="20" />
          <section class="card pad chain__step">
            <div class="chain__num">2</div>
            <h3>Ganancia</h3>
            <p class="chain__value">\${{ plan.gananciaObjetivo | number }}</p>
            <p class="tiny">10% de la venta neta de tu GP + Bono de Desempeño (Cuadrante A).</p>
          </section>
          <app-icon class="chain__arrow" name="arrow-right" [size]="20" />
          <section class="card pad chain__step">
            <div class="chain__num">3</div>
            <h3>Venta</h3>
            <p class="chain__value">\${{ plan.metas[0].objetivo | number }}</p>
            <p class="tiny">Venta GP necesaria para esa ganancia (≥ MRM).</p>
          </section>
          <app-icon class="chain__arrow" name="arrow-right" [size]="20" />
          <section class="card pad chain__step">
            <div class="chain__num">4</div>
            <h3>Activas</h3>
            <p class="chain__value">{{ plan.metas[1].objetivo }}</p>
            <p class="tiny">Retenidas + reactivadas + primeros pedidos para generar esa venta.</p>
          </section>
          <app-icon class="chain__arrow" name="arrow-right" [size]="20" />
          <section class="card pad chain__step">
            <div class="chain__num">5</div>
            <h3>Acciones</h3>
            <p class="chain__value">{{ plan.acciones.length }} / semana</p>
            <p class="tiny">Instrucciones simples con nombres de tu grupo, cada semana.</p>
          </section>
        </div>

        <div class="alert alert--info" style="margin-top: 18px">
          <app-icon name="alert" [size]="16" />
          El plan se define en la <strong>semana 1</strong> de cada campaña. La próxima ventana de
          planificación abre en <strong>C7 · S1</strong> — Maya te lo recordará y traerá tus números
          de C6 como punto de partida.
        </div>
      }
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
        margin-bottom: 20px;
      }
      .crumbs {
        font-size: 12.5px;
        color: var(--ink-3);
        margin-bottom: 4px;
      }
      .crumbs a:hover {
        color: var(--brand-600);
      }
      .tabs {
        display: inline-flex;
        background: var(--sand);
        border-radius: 99px;
        padding: 4px;
      }
      .tabs__tab {
        border: 0;
        background: none;
        border-radius: 99px;
        padding: 8px 20px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--ink-2);
      }
      .tabs__tab--active {
        background: var(--ink);
        color: var(--on-ink);
      }

      /* Estado */
      .status {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 18px 22px;
        margin-bottom: 28px;
        flex-wrap: wrap;
      }
      /* El banner adopta el color del estado: ámbar si va en riesgo, verde si va en ritmo */
      .status--risk {
        border-color: var(--warning);
        background: linear-gradient(120deg, var(--warning-bg), var(--surface));
      }
      .status--ok {
        border-color: var(--success);
        background: linear-gradient(120deg, var(--success-bg), var(--surface));
      }
      .status__bar {
        max-width: 460px;
        margin-top: 12px;
      }
      .status__week {
        text-align: center;
      }
      .status__weeknum {
        font-size: 28px;
        font-weight: 800;
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        border-radius: 99px;
        background: var(--brand-grad);
        color: #fff;
      }
      .status__main {
        flex: 1;
        min-width: 260px;
      }
      .status__row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        margin-bottom: 4px;
      }
      .status__main p {
        margin: 0;
        font-size: 13.5px;
      }
      .status__gain {
        text-align: right;
      }
      .status__gainval {
        font-size: 24px;
        font-weight: 800;
        color: var(--brand-600);
      }

      .section-title .tiny {
        font-weight: 500;
      }

      /* Metas con ritmo */
      .goals {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
        margin-bottom: 30px;
      }
      .goal {
        padding: 16px 18px;
      }
      .goal__head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        margin-bottom: 10px;
      }
      .goal__nums {
        font-weight: 800;
        font-size: 15px;
      }
      .pace {
        position: relative;
        padding: 3px 0;
      }
      .pace__marker {
        position: absolute;
        top: -2px;
        bottom: -2px;
        width: 2.5px;
        border-radius: 2px;
        background: var(--ink);
        transform: translateX(-50%);
      }
      .pace__marker::after {
        content: 'hoy';
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9.5px;
        font-weight: 700;
        color: var(--ink-2);
        letter-spacing: 0.04em;
      }
      .goal__delta {
        font-size: 12.5px;
        font-weight: 700;
        margin-top: 12px;
      }
      .goal__delta--bad {
        color: var(--danger);
      }
      .goal__delta--ok {
        color: var(--success);
      }
      .goal__delta .tiny {
        font-weight: 500;
      }

      /* Acciones */
      .todo {
        padding: 6px 0;
        margin-bottom: 30px;
      }
      .todo__item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 13px 18px;
        border-bottom: 1px solid var(--line);
      }
      .todo__item:last-child {
        border-bottom: 0;
      }
      .todo__check {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        border-radius: 8px;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        display: grid;
        place-items: center;
        color: #fff;
        transition: all 0.15s ease;
      }
      .todo__check:hover {
        border-color: var(--brand-500);
      }
      .todo__check--on {
        background: var(--fill-success);
        border-color: var(--fill-success);
      }
      .todo__body {
        flex: 1;
        min-width: 0;
      }
      .todo__text {
        font-size: 14px;
        font-weight: 600;
      }
      .todo__item--done .todo__text {
        text-decoration: line-through;
        color: var(--ink-3);
      }
      .todo__go {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 99px;
        color: var(--ink-2);
        transition: background 0.15s ease;
      }
      .todo__go:hover {
        background: var(--sand);
        color: var(--brand-600);
      }

      /* Ritmo semanal */
      .pad {
        padding: 20px;
      }
      .weeks {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        align-items: end;
      }
      .week {
        text-align: center;
        border-radius: var(--radius-s);
        padding: 10px 6px 8px;
      }
      .week--current {
        background: var(--brand-50);
        outline: 1.5px solid var(--brand-200);
      }
      .week__bars {
        display: flex;
        gap: 5px;
        align-items: flex-end;
        justify-content: center;
        height: 110px;
        margin-bottom: 8px;
      }
      .week__bar {
        width: 22px;
        border-radius: 6px 6px 2px 2px;
      }
      .week__bar--plan {
        background: var(--brand-100);
      }
      .week__bar--real {
        background: var(--brand-grad);
      }
      .week__label {
        font-weight: 800;
        font-size: 13px;
      }
      .week__hit {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: var(--success);
        margin-top: 3px;
      }
      .legendline {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 14px;
      }
      .dotk {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        display: inline-block;
      }
      .dotk--plan {
        background: var(--brand-100);
      }
      .dotk--real {
        background: var(--brand-500);
        margin-left: 12px;
      }

      /* Cadena del plan */
      .chain {
        display: flex;
        align-items: stretch;
        gap: 8px;
        flex-wrap: wrap;
      }
      .chain__step {
        flex: 1;
        min-width: 160px;
        position: relative;
        padding-top: 18px;
      }
      .chain__step h3 {
        font-size: 15px;
        margin: 6px 0 4px;
      }
      .chain__num {
        width: 26px;
        height: 26px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: var(--brand-100);
        color: var(--brand-700);
        font-weight: 800;
        font-size: 13px;
      }
      .chain__value {
        font-size: 18px;
        font-weight: 800;
        margin: 0 0 6px;
        color: var(--brand-600);
      }
      .chain__step .tiny {
        line-height: 1.45;
      }
      .chain__arrow {
        align-self: center;
        color: var(--ink-3);
        flex: 0 0 auto;
      }

      @media (max-width: 860px) {
        .goals {
          grid-template-columns: 1fr;
        }
        .status__gain {
          text-align: left;
        }
        .chain {
          flex-direction: column;
        }
        .chain__arrow {
          transform: rotate(90deg);
          margin: 0 auto;
        }
        .weeks {
          gap: 6px;
        }
      }
    `,
  ],
})
export class MiPlanPage {
  protected readonly plan = PLAN_CAMPANA;
  protected readonly vista = signal<'seguimiento' | 'plan'>('seguimiento');

  /** Acciones marcadas (estado local del demo). */
  private readonly hechasSet = signal<Set<string>>(
    new Set(PLAN_CAMPANA.acciones.filter((a) => a.hecho).map((a) => a.id)),
  );

  protected readonly hechas = computed(() => this.hechasSet().size);

  protected readonly maxSemana = Math.max(
    ...PLAN_CAMPANA.semanas.flatMap((s) => [s.plan, s.logrado]),
  );

  protected estaHecha(id: string): boolean {
    return this.hechasSet().has(id);
  }

  protected toggle(id: string): void {
    this.hechasSet.update((set) => {
      const copia = new Set(set);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  protected pct(actual: number, objetivo: number): number {
    if (!objetivo) return 0;
    return Math.min(100, Math.round((actual / objetivo) * 100));
  }

  protected detras(m: { actual: number; objetivo: number; esperadoHoy: number }): boolean {
    return m.actual / m.objetivo < m.esperadoHoy;
  }

  protected deltaPuntos(m: { actual: number; objetivo: number; esperadoHoy: number }): number {
    return Math.abs(Math.round((m.actual / m.objetivo - m.esperadoHoy) * 100));
  }

  protected alto(valor: number): number {
    return Math.max(4, Math.round((valor / this.maxSemana) * 100));
  }
}
