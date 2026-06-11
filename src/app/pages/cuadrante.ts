import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { CAMPANA, CUADRANTE_HISTORIA } from '../data/mock';

@Component({
  selector: 'app-cuadrante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <nav class="crumbs"><a routerLink="/inicio">Inicio</a> / Cuadrante A</nav>
          <h1 class="page-title">Cuadrante A</h1>
        </div>
        <div class="tabs">
          <button class="tabs__tab" [class.tabs__tab--active]="vista() === 'gp'" (click)="vista.set('gp')">Grupo Personal</button>
          <button class="tabs__tab" [class.tabs__tab--active]="vista() === 'gen'" (click)="vista.set('gen')">Genealogía</button>
        </div>
      </header>

      <div class="grid">
        <!-- Avance de la campaña -->
        <section class="card pad">
          <div class="row-between">
            <h3 class="card-title">En esta campaña</h3>
            <span class="badge badge--danger">Estás en cuadrante {{ data.cuadrante.actual }}</span>
          </div>

          <div class="bars">
            <div class="bar">
              <div class="bar__head">
                <span>Venta · MRM</span>
                <span class="tiny">MRM: \${{ data.cuadrante.ventaRequerida | number }} · faltan \${{ data.cuadrante.faltaVenta | number }}</span>
              </div>
              <div class="progress">
                <div class="progress__fill" [style.width.%]="pct(data.ventaActual, data.cuadrante.ventaRequerida)"></div>
              </div>
              <div class="bar__value">\${{ data.ventaActual | number }}</div>
            </div>

            <div class="bar">
              <div class="bar__head">
                <span>Primeros pedidos · PPED</span>
                <span class="tiny">Objetivo: {{ data.cuadrante.ppedRequeridos }} · faltan {{ data.cuadrante.ppedFaltantes }}</span>
              </div>
              <div class="pped">
                @for (n of [1, 2, 3, 4]; track n) {
                  <div class="pped__slot" [class.pped__slot--done]="n <= ppedLogrados">{{ n }}</div>
                }
              </div>
            </div>
          </div>

          <div class="alert alert--warning">
            <app-icon name="alert" [size]="16" />
            Sube a Cuadrante A esta campaña y gana el Bono de Desempeño de \${{ data.cuadrante.bono | number }}.
          </div>
        </section>

        <!-- Matriz de cuadrantes -->
        <section class="card pad">
          <h3 class="card-title">¿Dónde estás hoy?</h3>
          <div class="matrix">
            <div class="matrix__cell matrix__cell--c">
              <span class="badge badge--warning">C · Recuperación</span>
              <p>Cumple PPED · No cumple MRM</p>
            </div>
            <div class="matrix__cell matrix__cell--a">
              <span class="badge badge--success">A · Crecimiento</span>
              <p>Cumple MRM + PPED · Negocio sano</p>
            </div>
            <div class="matrix__cell matrix__cell--d matrix__cell--here">
              <span class="badge badge--danger">D · Riesgo</span>
              <p>No cumple MRM ni PPED</p>
              <span class="here">Estás aquí</span>
            </div>
            <div class="matrix__cell matrix__cell--b">
              <span class="badge badge--brand">B · Potencial Riesgo</span>
              <p>Cumple MRM · No cumple PPED</p>
            </div>
            <div class="matrix__axis matrix__axis--y">PPED →</div>
            <div class="matrix__axis matrix__axis--x">Venta (MRM) →</div>
          </div>
        </section>
      </div>

      <!-- Historial -->
      <section class="card pad" style="margin-top: 16px">
        <div class="row-between">
          <h3 class="card-title">En este año</h3>
          <span class="muted">Alcanzaste <strong>{{ vecesA }} de 6</strong> veces el cuadrante A</span>
        </div>
        <div class="medals tiny">
          Medalla de Excelencia GP: 🥉 Bronce 9/13 · 🥈 Plata 11/13 · 🥇 Oro 13/13 campañas en A — llevas {{ vecesA }}.
        </div>
        <div class="history">
          @for (h of historia; track h.campana) {
            <div class="history__item">
              <div class="tiny">{{ h.campana }}</div>
              <div
                class="history__box"
                [class.history__box--a]="h.valor === 'A'"
                [class.history__box--d]="h.valor === 'D'"
              >
                {{ h.valor }}
              </div>
            </div>
          }
        </div>
      </section>

      @if (vista() === 'gen') {
        <div class="alert alert--info" style="margin-top: 16px">
          <app-icon name="alert" [size]="16" />
          La vista de Genealogía estará disponible en la siguiente fase del prototipo.
        </div>
      }
    </div>
  `,
  styles: [
    `
      .head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
      .crumbs { font-size: 12.5px; color: var(--ink-3); margin-bottom: 4px; }
      .crumbs a:hover { color: var(--brand-600); }

      .tabs { display: inline-flex; background: var(--sand); border-radius: 99px; padding: 4px; }
      .tabs__tab { border: 0; background: none; border-radius: 99px; padding: 8px 20px; font-size: 13.5px; font-weight: 700; color: var(--ink-2); }
      .tabs__tab--active { background: var(--ink); color: #fff; }

      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: stretch; }
      .pad { padding: 20px; }
      .card-title { font-size: 17px; margin: 0 0 12px; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }

      .bars { display: flex; flex-direction: column; gap: 18px; margin: 16px 0; }
      .bar__head { display: flex; justify-content: space-between; gap: 10px; font-weight: 700; font-size: 13.5px; margin-bottom: 7px; flex-wrap: wrap; }
      .bar__value { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-top: 6px; }
      .pped { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .pped__slot {
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        border: 1.5px dashed var(--line);
        color: var(--ink-3);
        font-weight: 700;
      }
      .pped__slot--done {
        border-style: solid;
        border-color: var(--success);
        background: var(--success-bg);
        color: var(--success);
      }

      /* Matriz */
      .matrix {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 0 0 26px 26px;
      }
      .matrix__cell {
        border-radius: var(--radius-s);
        padding: 14px;
        min-height: 96px;
        position: relative;
      }
      .matrix__cell p { margin: 8px 0 0; font-size: 12px; color: var(--ink-2); }
      .matrix__cell--a { background: var(--success-bg); }
      .matrix__cell--b { background: var(--brand-100); }
      .matrix__cell--c { background: var(--warning-bg); }
      .matrix__cell--d { background: var(--danger-bg); }
      .matrix__cell--here { outline: 2.5px solid var(--danger); outline-offset: 2px; }
      .here {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--danger);
        color: #fff;
        border-radius: 99px;
        font-size: 10.5px;
        font-weight: 800;
        padding: 3px 9px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .matrix__axis {
        position: absolute;
        font-size: 11px;
        font-weight: 700;
        color: var(--ink-3);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .matrix__axis--x { bottom: 0; left: 50%; transform: translateX(-50%); }
      .matrix__axis--y { left: 0; top: 50%; transform: rotate(-90deg) translateX(50%); transform-origin: left; }

      /* Historial */
      .medals {
        margin-top: 8px;
        background: var(--sand);
        border-radius: var(--radius-s);
        padding: 8px 12px;
      }
      .history { display: flex; gap: 8px; overflow-x: auto; margin-top: 14px; padding-bottom: 4px; }
      .history__item { text-align: center; flex: 0 0 52px; }
      .history__box {
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        border: 1.5px solid var(--line);
        font-weight: 800;
        color: var(--ink-3);
        margin-top: 4px;
      }
      .history__box--a { border-color: var(--success); background: var(--success-bg); color: var(--success); }
      .history__box--d { border-color: var(--danger); background: var(--danger-bg); color: var(--danger); }

      @media (max-width: 900px) {
        .grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class CuadrantePage {
  protected readonly data = CAMPANA;
  protected readonly historia = CUADRANTE_HISTORIA;
  protected readonly vista = signal<'gp' | 'gen'>('gp');
  protected readonly ppedLogrados = CAMPANA.cuadrante.ppedRequeridos - CAMPANA.cuadrante.ppedFaltantes;
  protected readonly vecesA = CUADRANTE_HISTORIA.filter((h) => h.valor === 'A').length;

  protected pct(valor: number, meta: number): number {
    if (!meta) return 0;
    return Math.min(100, Math.round((valor / meta) * 100));
  }
}
