import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Icon3d } from '../shared/icon3d';
import { Reveal } from '../shared/reveal';
import {
  CREDITO,
  GASTOS_OPERACION,
  HITOS,
  MATERIAL_PROMOCIONAL,
  PRODUCTOS,
  Producto,
  ahorroPct,
  escalaPara,
} from '../data/mock-pedidos';

/** Línea del pedido: producto + cantidad + importe ya calculado. */
interface LineaPedido {
  producto: Producto;
  cantidad: number;
  importe: number;
}

/**
 * PASE DE PEDIDOS (rediseño) — reemplaza el redirect a pedidos.yanbal.com por una
 * vista dentro de Maya que demuestra los principios del brief:
 *
 *  1. Valor económico explícito: al agregar, la bolsa recalcula en vivo cuánto
 *     ahorras y cuánto te falta para el siguiente beneficio.
 *  2. UNA barra de recompensas: el portal actual tiene dos barras sticky que
 *     compiten (GanaMás + Escala) con dos "te falta $X" distintos (hallazgos
 *     #2/#11). Aquí ambos programas son hitos sobre una sola vara (el monto del
 *     pedido) con un único "próximo beneficio".
 *  3. Jerarquía de card: media → nombre → precio efectivo (P. Capi) → ahorro →
 *     stock → acción (principio #3). "P. Capi" se explica en pantalla (hallazgo #1).
 *  4. Bolsa transparente: agrupa Comisionable vs No Comisionable, con UN solo
 *     resumen de totales (unifica el doble resumen, hallazgo #13) y explica
 *     "Gastos de operación" (hallazgo #15).
 *
 * El estado del carrito vive local a esta página (signals): el prototipo no
 * toca la lógica de precios real, solo su presentación.
 */
@Component({
  selector: 'app-pedidos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Icon3d, Reveal],
  template: `
    <div class="v2 ped">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Realizar pedido</nav>
        <h1 class="v2-title">Realizar pedido</h1>
        <p class="v2-sub">
          Arma tu pedido de campaña. Mientras agregas productos, ves en vivo cuánto ahorras y cuánto
          te falta para tu siguiente beneficio.
        </p>
      </header>

      <div class="v2-grid">
        <main>
          <!-- ============ Barra de recompensas UNIFICADA (pieza estrella) ============ -->
          <section class="card pad v2-section rw" appReveal>
            <div class="rw__top">
              <div>
                <span class="rw__eyebrow">Tu pedido comisionable</span>
                <div class="rw__monto">{{ fmt(subtotalComision()) }}</div>
              </div>
              <span class="badge badge--brand rw__escala">Escala {{ escalaTexto() }} activa</span>
            </div>

            <p class="rw__next">
              @if (proximoHito(); as h) {
                <app-icon name="trending" [size]="16" />
                <span
                  >Te faltan <b>{{ fmt(falta()) }}</b> para <b>{{ h.titulo }}</b> —
                  {{ h.beneficio }}</span
                >
              } @else {
                <app-icon name="check" [size]="16" />
                <span>¡Alcanzaste todos los beneficios de esta campaña!</span>
              }
            </p>

            <div class="rw__track" role="img" [attr.aria-label]="pistaAria()">
              <div class="rw__rail">
                <div class="rw__fill" [style.width.%]="fillPct()"></div>
                @for (h of hitos; track h.clave) {
                  <div
                    class="rw__mark"
                    [class.on]="alcanzado(h.meta)"
                    [style.left.%]="posPct(h.meta)"
                  >
                    <span class="rw__dot" [class]="'rw__dot--' + h.tipo"></span>
                    <span class="rw__lbl">{{ h.clave }}</span>
                  </div>
                }
              </div>
            </div>

            <p class="tiny rw__legend">
              <span class="rw__key rw__key--escala"></span> Escala (descuento)
              <span class="rw__key rw__key--ganamas"></span> GanaMás (bonificación) · El descuento
              de Escala es <b>retroactivo</b>: al subir de nivel aplica a todo el pedido.
            </p>
          </section>

          <!-- ============ Buscador ============ -->
          <div class="ped__search" appReveal>
            <app-icon name="search" [size]="18" />
            <input
              type="search"
              placeholder="Busca por nombre o código"
              [value]="q()"
              (input)="q.set($any($event.target).value)"
              aria-label="Buscar productos"
            />
          </div>

          <!-- P. Capi vs P. Normal explicado una sola vez (hallazgo #1) -->
          <div class="alert alert--info ped__capi" appReveal>
            <app-icon name="wallet" [size]="16" />
            <span
              ><b>P. Capi</b> es tu precio de capitalización (lo que pagas). <b>P. Normal</b> es el
              precio de catálogo. El % es cuánto ahorras.</span
            >
          </div>

          <!-- ============ Catálogo por sección ============ -->
          @for (sec of seccionesVisibles(); track sec) {
            <section class="v2-section" appReveal>
              <h2 class="v2-h"><app-icon name="box" [size]="18" /> {{ sec }}</h2>
              <div class="grid-prod">
                @for (p of productosDe(sec); track p.id) {
                  <article class="pc" [class.pc--out]="!p.enStock">
                    <div class="pc__media">
                      <span class="pc__emoji" aria-hidden="true">{{ p.emoji }}</span>
                      @if (p.badge) {
                        <span class="pc__badge" [class]="'pc__badge--' + p.badge">{{
                          badgeLabel(p.badge)
                        }}</span>
                      }
                      @if (!p.enStock) {
                        <span class="pc__badge pc__badge--out">Agotado</span>
                      }
                    </div>
                    <div class="pc__body">
                      <h3 class="pc__name">{{ p.nombre }}</h3>
                      <div class="tiny pc__meta">Cód. {{ p.codigo }} · {{ p.contenido }}</div>
                      <div class="pc__price">
                        <span class="pc__capi">{{ fmt(p.precioCapi) }}</span>
                        <span class="pc__capi-tag" title="Precio de capitalización">P. Capi</span>
                      </div>
                      <div class="pc__price2">
                        <span class="pc__lista">{{ fmt(p.precioLista) }}</span>
                        <span class="tiny pc__lista-tag">P. Normal</span>
                        <span class="pc__ahorro">−{{ ahorro(p) }}%</span>
                      </div>
                    </div>
                    <div class="pc__action">
                      @if (!p.enStock) {
                        <span class="tiny pc__soon">Sin stock</span>
                      } @else if (qty(p.id) > 0) {
                        <div
                          class="stepper"
                          role="group"
                          [attr.aria-label]="'Cantidad ' + p.nombre"
                        >
                          <button type="button" (click)="dec(p.id)" aria-label="Quitar uno">
                            <app-icon name="x" [size]="14" />
                          </button>
                          <span class="stepper__n">{{ qty(p.id) }}</span>
                          <button type="button" (click)="inc(p.id)" aria-label="Agregar uno">
                            ＋
                          </button>
                        </div>
                      } @else {
                        <button
                          type="button"
                          class="btn btn--soft btn--sm pc__add"
                          (click)="inc(p.id)"
                        >
                          <app-icon name="cart" [size]="15" /> Agregar
                        </button>
                      }
                    </div>
                  </article>
                }
              </div>
            </section>
          }

          @if (seccionesVisibles().length === 0) {
            <div class="card pad ped__empty" appReveal>
              <p class="muted">No encontramos productos para “{{ q() }}”.</p>
              <button type="button" class="btn btn--ghost btn--sm" (click)="q.set('')">
                Limpiar búsqueda
              </button>
            </div>
          }
        </main>

        <!-- ============ Lateral: crédito + bolsa en vivo ============ -->
        <aside class="v2-aside">
          <!-- Crédito disponible: dato central del modelo B2B -->
          <div class="card pad credito" appReveal>
            <div class="credito__row">
              <span class="credito__lbl"
                ><app-icon name="wallet" [size]="16" /> Monto disponible</span
              >
              <b>{{ fmt(montoDisponible) }}</b>
            </div>
            <div class="progress credito__bar" [class.progress--success]="saldo() >= 0">
              <div class="progress__fill" [style.width.%]="usoPct()"></div>
            </div>
            <div class="credito__row">
              <span class="credito__lbl">Saldo tras este pedido</span>
              <b [class.credito__bad]="saldo() < 0">{{ fmt(saldo()) }}</b>
            </div>
            <p class="tiny">
              Tu pedido se arma contra tu línea de crédito; el saldo se descuenta al facturar.
            </p>
          </div>

          <!-- Bolsa en vivo -->
          <div class="card pad bolsa" appReveal [revealDelay]="80">
            <div class="bolsa__head">
              <h2 class="v2-h"><app-icon name="cart" [size]="18" /> Tu bolsa</h2>
              @if (totalItems() > 0) {
                <span class="badge badge--neutral">{{ totalItems() }} prod.</span>
              }
            </div>

            @if (lineas().length === 0) {
              <div class="bolsa__empty">
                <app-icon3d name="bag" [size]="72" />
                <p class="muted">Aún no agregas productos.</p>
                <p class="tiny">
                  Agrega productos y verás aquí tu ahorro, tus beneficios y el total a pagar.
                </p>
              </div>
            } @else {
              <!-- Comisionable -->
              <div class="bolsa__group">
                <div class="bolsa__gtitle">
                  {{ lineas().length }} · Comisionable
                  <span class="badge badge--success bolsa__flag">Suma metas</span>
                </div>
                <p class="tiny bolsa__gnote">Suma para tu Escala y tu GanaMás.</p>
                @for (l of lineas(); track l.producto.id) {
                  <div class="bl">
                    <span class="bl__emoji" aria-hidden="true">{{ l.producto.emoji }}</span>
                    <div class="bl__body">
                      <div class="bl__name">{{ l.producto.nombre }}</div>
                      <div class="tiny bl__meta">
                        {{ l.cantidad }} × {{ fmt(l.producto.precioCapi) }}
                      </div>
                    </div>
                    <div class="bl__right">
                      <div class="bl__imp">{{ fmt(l.importe) }}</div>
                      <div class="stepper stepper--sm" role="group">
                        <button
                          type="button"
                          (click)="dec(l.producto.id)"
                          [attr.aria-label]="'Quitar uno de ' + l.producto.nombre"
                        >
                          <app-icon name="x" [size]="12" />
                        </button>
                        <span class="stepper__n">{{ l.cantidad }}</span>
                        <button
                          type="button"
                          (click)="inc(l.producto.id)"
                          [attr.aria-label]="'Agregar uno de ' + l.producto.nombre"
                        >
                          ＋
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- No comisionable (material gratis) -->
              <div class="bolsa__group">
                <div class="bolsa__gtitle">
                  {{ materialTotal }} · No comisionable
                  <span class="badge badge--neutral bolsa__flag">Gratis</span>
                </div>
                <p class="tiny bolsa__gnote">
                  Muestras y material de campaña — no suman a tus metas.
                </p>
                @for (m of material; track m.id) {
                  <div class="bl bl--free">
                    <span class="bl__emoji" aria-hidden="true">{{ m.emoji }}</span>
                    <div class="bl__body">
                      <div class="bl__name">{{ m.nombre }}</div>
                      <div class="tiny bl__meta">{{ m.cantidad }} unid.</div>
                    </div>
                    <div class="bl__free">GRATIS</div>
                  </div>
                }
              </div>

              <!-- UN solo resumen de totales (unifica el doble resumen, hallazgo #13) -->
              <dl class="sum">
                <div class="sum__row">
                  <dt>Productos (P. Capi)</dt>
                  <dd>{{ fmt(subtotalComision()) }}</dd>
                </div>
                <div class="sum__row sum__row--desc">
                  <dt>Escala {{ escalaTexto() }} <small>retroactivo</small></dt>
                  <dd>−{{ fmt(escalaDescuento()) }}</dd>
                </div>
                <div class="sum__row">
                  <dt>Material promocional</dt>
                  <dd class="sum__free">Incluido</dd>
                </div>
                <div class="sum__rule"></div>
                <div class="sum__row">
                  <dt>Subtotal</dt>
                  <dd>{{ fmt(subtotal()) }}</dd>
                </div>
                <div class="sum__row">
                  <dt>Gastos de operación</dt>
                  <dd>{{ fmt(gastos()) }}</dd>
                </div>
                <p class="tiny sum__note">Envío y manejo del pedido hasta tu domicilio.</p>
                <div class="sum__row sum__total">
                  <dt>Total a pagar</dt>
                  <dd>{{ fmt(total()) }}</dd>
                </div>
              </dl>

              <div class="alert alert--success bolsa__save">
                <app-icon name="sparkles" [size]="16" />
                <span
                  >Ahorras <b>{{ fmt(ahorroTotal()) }}</b> en este pedido.</span
                >
              </div>

              <button type="button" class="btn btn--primary bolsa__cta">
                Continuar <app-icon name="arrow-right" [size]="16" />
              </button>
              <button
                type="button"
                class="btn btn--ghost btn--sm bolsa__seguir"
                (click)="scrollTop()"
              >
                Seguir comprando
              </button>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      /* ---------- Barra de recompensas unificada ---------- */
      .rw__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .rw__eyebrow {
        font-size: 12px;
        font-weight: 600;
        color: var(--ink-2);
      }
      .rw__monto {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 800;
        line-height: 1.05;
        margin-top: 2px;
      }
      .rw__escala {
        white-space: nowrap;
      }
      .rw__next {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        margin: 12px 0 18px;
        font-size: 13.5px;
        color: var(--ink);
      }
      .rw__next app-icon {
        color: var(--brand-600);
        flex-shrink: 0;
        margin-top: 1px;
      }
      /* Pista con marcadores por hito */
      .rw__track {
        padding: 26px 6px 30px;
      }
      .rw__rail {
        position: relative;
        height: 8px;
        border-radius: 99px;
        background: var(--sand);
      }
      .rw__fill {
        position: absolute;
        inset: 0 auto 0 0;
        height: 100%;
        border-radius: 99px;
        background: var(--brand-grad);
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .rw__mark {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .rw__dot {
        width: 14px;
        height: 14px;
        border-radius: 99px;
        border: 2px solid var(--surface);
        background: var(--line-strong);
        box-shadow: 0 0 0 1px var(--line-strong);
      }
      .rw__mark.on .rw__dot--escala {
        background: var(--brand-500);
        box-shadow: 0 0 0 1px var(--brand-500);
      }
      .rw__mark.on .rw__dot--ganamas {
        background: var(--violet);
        box-shadow: 0 0 0 1px var(--violet);
      }
      .rw__lbl {
        position: absolute;
        top: 18px;
        font-size: 10.5px;
        font-weight: 700;
        color: var(--ink-2);
        white-space: nowrap;
      }
      .rw__mark.on .rw__lbl {
        color: var(--ink);
      }
      .rw__legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin: 0;
      }
      .rw__key {
        width: 10px;
        height: 10px;
        border-radius: 99px;
        display: inline-block;
      }
      .rw__key--escala {
        background: var(--brand-500);
      }
      .rw__key--ganamas {
        background: var(--violet);
      }

      /* ---------- Buscador ---------- */
      .ped__search {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 14px;
        background: var(--surface);
        border: 1px solid var(--line-strong);
        border-radius: 99px;
        margin-bottom: 14px;
        color: var(--ink-3);
      }
      .ped__search input {
        flex: 1;
        border: 0;
        background: transparent;
        padding: 13px 0;
        font: inherit;
        color: var(--ink);
        outline: none;
      }
      .ped__capi {
        margin-bottom: 20px;
      }

      /* ---------- Grid de productos ---------- */
      .grid-prod {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 14px;
      }
      .pc {
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius-l);
        overflow: hidden;
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease,
          border-color 0.15s ease;
      }
      .pc:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
        border-color: var(--line-strong);
      }
      .pc--out {
        opacity: 0.62;
      }
      .pc--out:hover {
        transform: none;
        box-shadow: none;
      }
      .pc__media {
        position: relative;
        aspect-ratio: 4 / 3;
        display: grid;
        place-items: center;
        background: var(--sand);
      }
      .pc__emoji {
        font-size: 52px;
        filter: saturate(1.05);
      }
      .pc__badge {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 10.5px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 99px;
        color: var(--on-ink);
        background: var(--ink);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .pc__badge--nuevo {
        background: var(--fill-success);
      }
      .pc__badge--oferta-top {
        background: var(--fill-brand);
      }
      .pc__badge--millonaria {
        background: var(--violet);
      }
      .pc__badge--out {
        left: auto;
        right: 8px;
        background: var(--ink-3);
      }
      .pc__body {
        padding: 12px 14px 6px;
        flex: 1;
      }
      .pc__name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.25;
        margin: 0;
      }
      .pc__meta {
        margin: 2px 0 8px;
      }
      .pc__price {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .pc__capi {
        font-family: var(--font-display);
        font-size: 19px;
        font-weight: 800;
        color: var(--ink);
      }
      .pc__capi-tag {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--brand-600);
      }
      .pc__price2 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 1px;
      }
      .pc__lista {
        font-size: 12.5px;
        color: var(--ink-3);
        text-decoration: line-through;
      }
      .pc__lista-tag {
        color: var(--ink-3);
      }
      .pc__ahorro {
        margin-left: auto;
        font-size: 11.5px;
        font-weight: 800;
        color: var(--success);
        background: var(--success-bg);
        padding: 2px 7px;
        border-radius: 99px;
      }
      .pc__action {
        padding: 0 14px 14px;
      }
      .pc__add {
        width: 100%;
        justify-content: center;
      }
      .pc__soon {
        display: block;
        text-align: center;
        font-weight: 700;
        color: var(--ink-3);
        padding: 8px 0;
      }

      /* Stepper − n + */
      .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--line-strong);
        border-radius: 99px;
        overflow: hidden;
      }
      .stepper button {
        width: 34px;
        height: 34px;
        border: 0;
        background: var(--surface);
        color: var(--ink);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        display: grid;
        place-items: center;
      }
      .stepper button:hover {
        background: var(--sand);
      }
      .stepper__n {
        font-weight: 800;
        font-size: 14px;
        min-width: 22px;
        text-align: center;
      }
      .stepper--sm button {
        width: 26px;
        height: 26px;
        font-size: 13px;
      }
      .stepper--sm .stepper__n {
        font-size: 12.5px;
        min-width: 16px;
      }

      .ped__empty {
        text-align: center;
      }

      /* ---------- Crédito ---------- */
      .credito__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 13.5px;
      }
      .credito__row + .credito__row {
        margin-top: 4px;
      }
      .credito__lbl {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--ink-2);
      }
      .credito__lbl app-icon {
        color: var(--brand-600);
      }
      .credito__bar {
        margin: 10px 0;
      }
      .credito__bad {
        color: var(--danger);
      }
      .credito p {
        margin: 6px 0 0;
      }

      /* ---------- Bolsa ---------- */
      .bolsa__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .bolsa__head .v2-h {
        margin: 0;
      }
      .bolsa__empty {
        text-align: center;
        padding: 8px 0 4px;
      }
      .bolsa__empty app-icon3d {
        opacity: 0.9;
      }
      .bolsa__empty p {
        margin: 6px 0 0;
      }
      .bolsa__group {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid var(--line);
      }
      .bolsa__gtitle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 800;
      }
      .bolsa__flag {
        margin-left: auto;
      }
      .bolsa__gnote {
        margin: 3px 0 8px;
      }
      .bl {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
      }
      .bl__emoji {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        font-size: 22px;
        background: var(--sand);
        border-radius: var(--radius-s);
      }
      .bl__body {
        flex: 1;
        min-width: 0;
      }
      .bl__name {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.2;
      }
      .bl__meta {
        margin-top: 1px;
      }
      .bl__right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
      }
      .bl__imp {
        font-weight: 800;
        font-size: 13.5px;
      }
      .bl--free .bl__emoji {
        opacity: 0.8;
      }
      .bl__free {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--success);
      }

      /* Resumen de totales (único) */
      .sum {
        margin: 16px 0 0;
        padding-top: 14px;
        border-top: 1px solid var(--line);
      }
      .sum__row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        font-size: 13.5px;
        margin-bottom: 7px;
      }
      .sum__row dt {
        color: var(--ink-2);
      }
      .sum__row dd {
        margin: 0;
        font-weight: 700;
        white-space: nowrap;
      }
      .sum__row--desc dt small {
        color: var(--brand-600);
        font-weight: 700;
        margin-left: 4px;
      }
      .sum__row--desc dd {
        color: var(--success);
      }
      .sum__free {
        color: var(--ink-3);
        font-weight: 600 !important;
      }
      .sum__rule {
        height: 1px;
        background: var(--line);
        margin: 4px 0 10px;
      }
      .sum__note {
        margin: -3px 0 10px;
      }
      .sum__total {
        font-size: 15px;
        margin: 0;
      }
      .sum__total dt {
        color: var(--ink);
        font-weight: 800;
      }
      .sum__total dd {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 800;
      }
      .bolsa__save {
        margin: 14px 0;
      }
      .bolsa__cta {
        width: 100%;
        justify-content: center;
      }
      .bolsa__seguir {
        width: 100%;
        justify-content: center;
        margin-top: 8px;
      }

      /* ---------- Móvil ---------- */
      @media (max-width: 920px) {
        /* La bolsa deja de ser sticky lateral y baja al final. */
        .rw__monto {
          font-size: 26px;
        }
      }
      @media (max-width: 720px) {
        .grid-prod {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .pc__emoji {
          font-size: 42px;
        }
        .pc__capi {
          font-size: 17px;
        }
      }
    `,
  ],
})
export class Pedidos {
  protected readonly hitos = HITOS;
  protected readonly material = MATERIAL_PROMOCIONAL;
  protected readonly montoDisponible = CREDITO.montoDisponible;
  protected readonly materialTotal = MATERIAL_PROMOCIONAL.reduce((s, m) => s + m.cantidad, 0);
  /** Vara máxima de la pista de recompensas = meta del último hito. */
  private readonly metaMax = HITOS[HITOS.length - 1].meta;

  /** Cantidades del carrito por id de producto. Estado local (solo presentación). */
  private readonly cantidades = signal<Record<string, number>>({});
  protected readonly q = signal('');

  protected qty(id: string): number {
    return this.cantidades()[id] ?? 0;
  }
  protected inc(id: string): void {
    this.cantidades.update((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  protected dec(id: string): void {
    this.cantidades.update((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  /** Líneas del pedido (comisionables con cantidad > 0), en orden de catálogo. */
  protected readonly lineas = computed<LineaPedido[]>(() => {
    const c = this.cantidades();
    return PRODUCTOS.filter((p) => (c[p.id] ?? 0) > 0).map((producto) => {
      const cantidad = c[producto.id];
      return { producto, cantidad, importe: r2(producto.precioCapi * cantidad) };
    });
  });

  protected readonly totalItems = computed(() => this.lineas().reduce((s, l) => s + l.cantidad, 0));

  /** Suma comisionable a P. Capi: vara de Escala/GanaMás y base del total. */
  protected readonly subtotalComision = computed(() =>
    r2(this.lineas().reduce((s, l) => s + l.importe, 0)),
  );
  /** Misma suma pero a P. Normal — para calcular el ahorro por producto. */
  private readonly subtotalLista = computed(() =>
    r2(this.lineas().reduce((s, l) => s + l.producto.precioLista * l.cantidad, 0)),
  );

  protected readonly escalaPct = computed(() => escalaPara(this.subtotalComision()));
  protected escalaTexto(): string {
    return Math.round(this.escalaPct() * 100) + '%';
  }
  /** Descuento de Escala, retroactivo sobre todo el subtotal comisionable. */
  protected readonly escalaDescuento = computed(() =>
    r2(this.subtotalComision() * this.escalaPct()),
  );
  protected readonly subtotal = computed(() =>
    r2(this.subtotalComision() - this.escalaDescuento()),
  );
  protected readonly gastos = computed(() => (this.totalItems() > 0 ? GASTOS_OPERACION : 0));
  protected readonly total = computed(() => r2(this.subtotal() + this.gastos()));
  /** Ahorro total = descuento de producto (Capi vs Normal) + descuento de Escala. */
  protected readonly ahorroTotal = computed(() =>
    r2(this.subtotalLista() - this.subtotalComision() + this.escalaDescuento()),
  );
  protected readonly saldo = computed(() => r2(this.montoDisponible - this.total()));
  protected readonly usoPct = computed(() =>
    Math.min(100, (this.total() / this.montoDisponible) * 100),
  );

  /** Hitos y pista de recompensas (todo derivado del subtotal comisionable). */
  protected alcanzado(meta: number): boolean {
    return this.subtotalComision() >= meta;
  }
  protected posPct(meta: number): number {
    return (meta / this.metaMax) * 100;
  }
  protected readonly fillPct = computed(() =>
    Math.min(100, (this.subtotalComision() / this.metaMax) * 100),
  );
  protected readonly proximoHito = computed(() =>
    HITOS.find((h) => h.meta > this.subtotalComision()),
  );
  protected readonly falta = computed(() => {
    const h = this.proximoHito();
    return h ? r2(h.meta - this.subtotalComision()) : 0;
  });
  protected pistaAria(): string {
    const h = this.proximoHito();
    return h
      ? `Progreso del pedido: ${this.fmt(this.subtotalComision())}. Faltan ${this.fmt(this.falta())} para ${h.titulo}.`
      : `Progreso del pedido: ${this.fmt(this.subtotalComision())}. Todos los beneficios alcanzados.`;
  }

  /** Catálogo filtrado por búsqueda, agrupado por sección (orden de aparición). */
  private readonly filtrados = computed(() => {
    const t = this.q().trim().toLowerCase();
    if (!t) return PRODUCTOS;
    return PRODUCTOS.filter((p) => p.nombre.toLowerCase().includes(t) || p.codigo.includes(t));
  });
  protected readonly seccionesVisibles = computed(() => {
    const secs: string[] = [];
    for (const p of this.filtrados()) if (!secs.includes(p.seccion)) secs.push(p.seccion);
    return secs;
  });
  protected productosDe(seccion: string): Producto[] {
    return this.filtrados().filter((p) => p.seccion === seccion);
  }

  protected badgeLabel(b: NonNullable<Producto['badge']>): string {
    return { nuevo: 'Nuevo', 'oferta-top': 'Oferta Top', millonaria: 'Millonaria' }[b];
  }
  protected ahorro(p: Producto): number {
    return ahorroPct(p);
  }

  /** Formato de moneda MXN ("$1,438.00") — evita registrar locales del CurrencyPipe. */
  protected fmt(n: number): string {
    return n.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  protected scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/** Redondeo a 2 decimales evitando arrastre de coma flotante. */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}
