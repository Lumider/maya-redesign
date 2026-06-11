import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { PARTICIPANTES } from '../data/mock';

@Component({
  selector: 'app-incorpora-gana',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/inicio">Inicio</a> / <a routerLink="/mi-campana">Mi Campaña</a> / Incorpora y Gana</nav>
      <h1 class="page-title">Seguimiento del Incorpora y Gana</h1>

      <div class="banner">
        <div>
          <strong>Gana por cada nueva consultora activa al N1 Gana Más — hasta 3 campañas por persona.</strong>
          <span class="banner__detail">El pago llega una semana después del recaudo completo, en la campaña siguiente.</span>
          <a class="banner__link">Conoce aquí <app-icon name="arrow-right" [size]="14" /></a>
        </div>
        <span class="banner__emoji">👭</span>
      </div>

      <h2 class="section-title">Participantes</h2>
      <div class="people">
        @for (p of participantes; track p.codigo) {
          <button
            class="person"
            [class.person--active]="seleccionada().codigo === p.codigo"
            (click)="seleccionar(p.codigo)"
          >
            <span class="person__avatar">{{ p.iniciales }}</span>
            <span class="person__name">{{ p.nombre.split(' ')[0] }} {{ p.nombre.split(' ')[1]?.[0] }}.</span>
          </button>
        }
      </div>

      <section class="card pad">
        <div class="row-between">
          <div>
            <h3 class="card-title">Ganancia por {{ seleccionada().nombre }}</h3>
            <div class="tiny">Código: {{ seleccionada().codigo }}</div>
          </div>
          <div class="gain">$0</div>
        </div>

        <div class="alert alert--info">
          <app-icon name="alert" [size]="16" />
          <span>
            <strong>¡Empieza a ganar!</strong> Motiva a que pase su Primer Pedido al N1 Gana Más, lo recaude
            y gana por incorporar — válido hasta 3 campañas por persona.
          </span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nro. Campaña</th>
                <th>Monto pedido ($400 min)</th>
                <th>Días para pagar</th>
                <th>Recibes</th>
              </tr>
            </thead>
            <tbody>
              @for (fila of [1, 2, 3]; track fila) {
                <tr>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card pad" style="margin-top: 16px">
        <h3 class="card-title">Incorporación</h3>
        <div class="duo">
          <div class="duo__item">
            <span class="tiny">Fecha de incorporación</span>
            <strong>—</strong>
          </div>
          <div class="duo__item">
            <span class="tiny">Fecha de su primer pedido</span>
            <strong>—</strong>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .crumbs { font-size: 12.5px; color: var(--ink-3); margin-bottom: 4px; }
      .crumbs a:hover { color: var(--brand-600); }

      .banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 18px 0 28px;
        border-radius: var(--radius-l);
        padding: 20px 24px;
        background: linear-gradient(120deg, #dbe7ff, #eef3ff);
        color: #1e3a8a;
      }
      .banner strong { display: block; font-size: 15px; }
      .banner__detail { display: block; font-size: 13px; opacity: 0.85; margin-top: 2px; }
      .banner__link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--brand-600);
        cursor: pointer;
      }
      .banner__emoji { font-size: 40px; }

      .people {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 10px;
        margin-bottom: 22px;
      }
      .person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        flex: 0 0 86px;
        padding: 12px 8px;
        border: 1.5px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
        font-size: 12px;
        font-weight: 600;
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .person:hover { border-color: var(--brand-300); }
      .person--active {
        border-color: var(--brand-500);
        background: var(--brand-50);
        color: var(--brand-700);
        box-shadow: 0 0 0 3px var(--brand-100);
      }
      .person__avatar {
        width: 40px;
        height: 40px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--brand-300), var(--brand-500));
        color: #fff;
        font-weight: 700;
        font-size: 13px;
      }

      .pad { padding: 20px; }
      .card-title { font-size: 17px; margin: 0; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
      .gain { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--ink-2); }

      .table-wrap { overflow-x: auto; margin-top: 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      th {
        text-align: left;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--ink-3);
        font-weight: 700;
        padding: 10px 14px;
        border-bottom: 1.5px solid var(--line);
      }
      td { padding: 12px 14px; border-bottom: 1px solid var(--line); color: var(--ink-2); }
      tbody tr:last-child td { border-bottom: 0; }
      tbody tr:hover { background: var(--bg); }

      .duo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
      .duo__item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: var(--bg);
        border-radius: var(--radius-s);
        padding: 14px 16px;
      }
      @media (max-width: 700px) {
        .duo { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class IncorporaGanaPage {
  protected readonly participantes = PARTICIPANTES;
  private readonly codigoSel = signal(PARTICIPANTES[0].codigo);
  protected readonly seleccionada = computed(
    () => PARTICIPANTES.find((p) => p.codigo === this.codigoSel())!,
  );

  protected seleccionar(codigo: string): void {
    this.codigoSel.set(codigo);
  }
}
