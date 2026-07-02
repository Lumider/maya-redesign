import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { INCORPORADAS_CES, USUARIA_CES } from '../data/mock-ces';

/**
 * Incorpora y Gana (CES): seguimiento del programa persona por persona,
 * como en la Maya real, pero contestando SIEMPRE las dos preguntas de la
 * emprendedora: ¿cuánto llevo ganado? y ¿qué hago para cobrar lo que falta?
 * Regla del programa: S/ 50 por campaña por nueva consultora activa al N1
 * (pedido ≥ S/ 470 pagado) · máximo 3 campañas por persona (S/ 150).
 */
@Component({
  selector: 'app-incorpora-ces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Incorpora y Gana</nav>
        <h1 class="v2-title">Incorpora y Gana</h1>
        <p class="v2-sub">
          S/ 50 por campaña por cada nueva consultora activa al N1 — hasta 3 campañas (S/ 150) por
          persona.
        </p>
      </header>

      <div class="v2-grid">
        <main>
          <!-- El marcador del programa: ganado · en camino · potencial -->
          <section
            class="tiles marcador v2-section"
            appReveal
            style="grid-template-columns:repeat(3,1fr)"
          >
            <div class="tile card">
              <span class="tile__label">Ganado hasta hoy</span
              ><span class="tile__value ok">S/ {{ ganado | number }}</span
              ><span class="tile__hint">pagos ya confirmados</span>
            </div>
            <div class="tile card">
              <span class="tile__label">En programa</span
              ><span class="tile__value">{{ incorporadas.length }}</span
              ><span class="tile__hint">incorporadas vigentes</span>
            </div>
            <div class="tile card">
              <span class="tile__label">Potencial restante</span
              ><span class="tile__value">S/ {{ potencial | number }}</span
              ><span class="tile__hint">si todas completan sus 3 campañas</span>
            </div>
          </section>

          <!-- Participantes: chips → detalle de la seleccionada -->
          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="users" [size]="18" /> Participantes</h2>
            <div class="parts" role="tablist" aria-label="Incorporadas en el programa">
              @for (p of incorporadas; track p.codigo; let i = $index) {
                <button
                  class="part"
                  role="tab"
                  [attr.aria-selected]="sel() === i"
                  [class.part--on]="sel() === i"
                  (click)="sel.set(i)"
                >
                  <span class="part__av">{{ p.iniciales }}</span>
                  <span class="part__n">{{ p.nombre.split(' ')[0] }}</span>
                </button>
              }
            </div>

            <article class="card pad detalle" role="tabpanel">
              <div class="detalle__top">
                <div>
                  <strong>Ganancia por {{ p().nombre }}</strong>
                  <span class="tiny" style="display:block"
                    >Código: {{ p().codigo }} · incorporada en {{ p().incorporada }}</span
                  >
                </div>
                <span class="detalle__gan" [class.ok]="p().gananciaAcumulada > 0"
                  >S/ {{ p().gananciaAcumulada | number: '1.0-2' }}</span
                >
              </div>

              <div
                class="alert"
                [class]="p().gananciaAcumulada > 0 ? 'alert--info' : 'alert--warning'"
                role="status"
              >
                {{ p().gananciaAcumulada > 0 ? '🎉' : '💪' }} {{ p().mensaje }}
              </div>

              <div class="tabla" role="table" aria-label="Seguimiento por campaña">
                <div class="tabla__row tabla__row--head" role="row">
                  <span role="columnheader">Campaña</span>
                  <span role="columnheader">Pedido (mín. S/ 470)</span>
                  <span role="columnheader">Estado de pago</span>
                  <span role="columnheader">Recibes</span>
                </div>
                @for (f of p().filas; track f.campana) {
                  <div class="tabla__row" role="row">
                    <span role="cell"
                      ><strong>{{ f.campana }}</strong></span
                    >
                    <span role="cell">{{
                      f.monto !== null ? 'S/ ' + (f.monto | number: '1.0-2') : '—'
                    }}</span>
                    <span role="cell">{{ f.pago }}</span>
                    <span role="cell" [class.ok]="f.recibes !== null">{{
                      f.recibes !== null ? 'S/ ' + f.recibes : '—'
                    }}</span>
                  </div>
                }
              </div>

              <p class="tiny" style="margin:12px 0 0">
                Primer pedido: {{ p().primerPedido ?? 'aún no lo pasa' }} · El pago llega una semana
                después del recaudo completo, en la campaña siguiente.
              </p>
            </article>
          </section>
        </main>

        <aside class="v2-aside">
          <div class="card pad pasos" appReveal>
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="heart-plus" [size]="16" /> Cómo ganas
            </h3>
            <ol class="pasos__l">
              <li>
                <strong>Incorpora</strong> a una nueva consultora (o retenla de hace máx. 2
                campañas).
              </li>
              <li>Ambas pasan pedido y quedan <strong>activas al Nivel 1</strong> (S/ 470).</li>
              <li>Ella <strong>paga su pedido</strong> → tú recibes S/ 50 la campaña siguiente.</li>
            </ol>
            <p class="tiny" style="margin:8px 0 0">
              Es infinito: incorpora, retén, repite — con 1, 3 o 10 personas a la vez.
            </p>
          </div>

          <div class="card pad ctain" appReveal [revealDelay]="80">
            <img src="icons/goals.png" alt="" aria-hidden="true" width="48" height="48" />
            <div>
              <strong>Tu meta {{ u.campana }}</strong>
              <p class="tiny" style="margin:2px 0 8px">
                2 primeros pedidos pagados = S/ 100 y recuperas tu calificación CES.
              </p>
              <a class="btn btn--primary btn--sm" routerLink="/n/grupo">Ver a quién ayudar</a>
            </div>
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
      .ok {
        color: var(--success);
      }

      .marcador .tile__value.ok {
        color: var(--success);
      }

      .parts {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .part {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 10px 14px;
        border-radius: var(--radius);
        border: 1.5px solid var(--line);
        background: var(--surface);
        min-width: 84px;
        transition: border-color 0.15s ease;
      }
      .part:hover {
        border-color: var(--line-strong);
      }
      .part--on {
        border-color: var(--brand-600);
        background: var(--brand-50);
      }
      .part__av {
        width: 36px;
        height: 36px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: var(--sand);
        font-weight: 800;
        font-size: 12px;
        color: var(--ink-2);
      }
      .part--on .part__av {
        background: var(--brand-100);
        color: var(--brand-700);
      }
      .part__n {
        font-size: 12.5px;
        font-weight: 700;
      }

      .detalle__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      .detalle__gan {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 800;
      }
      .detalle .alert {
        margin-bottom: 14px;
      }

      .tabla {
        border: 1px solid var(--line);
        border-radius: var(--radius-s);
        overflow: hidden;
      }
      .tabla__row {
        display: grid;
        grid-template-columns: 0.7fr 1.2fr 1.2fr 0.8fr;
        gap: 8px;
        padding: 10px 14px;
        font-size: 13px;
        border-top: 1px solid var(--line);
      }
      .tabla__row:first-child {
        border-top: 0;
      }
      .tabla__row--head {
        background: var(--sand);
        font-size: 11.5px;
        font-weight: 700;
        color: var(--ink-2);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .pasos__l {
        margin: 0;
        padding-left: 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 13.5px;
      }
      .ctain {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      @media (max-width: 720px) {
        .marcador {
          grid-template-columns: 1fr !important;
        }
        .tabla__row {
          grid-template-columns: 0.6fr 1fr 1fr 0.7fr;
          font-size: 12px;
        }
      }
    `,
  ],
})
export class IncorporaCes {
  protected readonly u = USUARIA_CES;
  protected readonly incorporadas = INCORPORADAS_CES;

  /** Incorporada seleccionada (chips-tab, como los avatares de la Maya real). */
  protected readonly sel = signal(0);
  protected readonly p = computed(() => INCORPORADAS_CES[this.sel()]);

  protected readonly ganado = INCORPORADAS_CES.reduce((s, i) => s + i.gananciaAcumulada, 0); // 100
  /** Potencial restante: S/ 150 por persona menos lo ya ganado. */
  protected readonly potencial = INCORPORADAS_CES.length * 150 - this.ganado; // 500
}
