import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { EstatusService } from '../shared/estatus';
import { CAMPANA_CES, GRUPO_CES, PERFILES, USUARIA_CES } from '../data/mock-ces';

/**
 * Inicio (Emprendedora) — cabina de triage. NO es dueño de los datos: espeja lo
 * urgente y enruta. Toda la página se deriva del PERFIL del estatus activo
 * (conmutador demo): críticos, alerta, acciones y áreas visibles cambian al
 * encarnar CNS, CEM, CES o ASP. Cada cifra vive en un solo lugar:
 *  · Los 3 críticos (calificación · venta · cierre) viven solo en el encabezado.
 *  · El detalle de Ganamás/morosidad/crédito vive en Mi campaña.
 *  · El detalle de requisitos del paso vive en Mi camino.
 */
@Component({
  selector: 'app-inicio-ces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">¡Hola, {{ nombre }}! 👋</h1>
        <p class="v2-sub">Esto es lo más importante de tu {{ c.actual }}, semana {{ c.semana }}.</p>

        <!-- Los 3 (y solo 3) indicadores críticos -->
        <div class="crit">
          <div class="crit__i card">
            <span class="crit__top">
              <span class="crit__label">Estás calificando como</span>
              <span class="sem" [class]="calificaBien() ? 'sem--ok' : 'sem--warn'"></span>
            </span>
            <span class="crit__v" [class.warn]="!calificaBien()">{{ p().calificandoComo }}</span>
            <span class="tiny">
              @if (calificaBien()) {
                Tu título {{ p().estatus }} está al día — sigue así
              } @else {
                Tu título es {{ p().estatus }} — recupera tu calificación esta campaña
              }
            </span>
          </div>
          <div class="crit__i card">
            @if (p().ventaGP; as gp) {
              <span class="crit__top"><span class="crit__label">Venta de tu grupo</span></span>
              <span class="crit__v">S/ {{ gp.actual | number: '1.0-0' }}</span>
              <div class="progress" style="margin:8px 0 4px">
                <div class="progress__fill" [style.width.%]="ventaPct()"></div>
              </div>
              <span class="tiny">{{ ventaPct() }}% de la {{ gp.etiquetaMeta }}</span>
            } @else {
              <span class="crit__top"><span class="crit__label">Tu venta personal</span></span>
              <span class="crit__v">S/ {{ p().ventaPersonal | number: '1.0-0' }}</span>
              <span class="tiny"
                >Nivel {{ p().nivelGanamas }} Ganamás · {{ p().descuento }}% de descuento</span
              >
            }
          </div>
          <div class="crit__i card">
            <span class="crit__top"><span class="crit__label">Cierre de campaña</span></span>
            <span class="crit__v"
              >{{ c.diasCierre }}<span class="muted" style="font-size:15px"> días</span></span
            >
            <span class="tiny">Semana {{ c.semana }} de {{ c.totalSemanas }}</span>
          </div>
        </div>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Una sola narrativa por estatus: el paso que está jugando -->
          <section
            class="card pad alerta"
            [class.alerta--ok]="p().alerta.tone === 'success'"
            appReveal
          >
            <span
              class="sem"
              [class]="p().alerta.tone === 'success' ? 'sem--ok' : 'sem--warn'"
              style="margin-top:5px"
            ></span>
            <div>
              <strong>{{ p().alerta.titulo }}</strong>
              <p class="muted">{{ p().alerta.texto }}</p>
            </div>
            <a class="btn btn--soft btn--sm" routerLink="/n/camino">Ver mi camino</a>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="check" [size]="18" /> Qué hacer esta semana</h2>
            <div class="feed">
              @for (a of p().acciones; track a.texto) {
                <a
                  class="feed__item card"
                  [class.feed__item--urgent]="a.urgente"
                  [routerLink]="a.ruta"
                >
                  <span class="feed__ic">{{ a.emoji }}</span>
                  <div class="feed__body">
                    <strong>{{ a.texto }}</strong
                    ><span class="tiny">{{ a.impacto }}</span>
                  </div>
                  <app-icon name="chevron-right" [size]="18" />
                </a>
              }
            </div>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="sparkles" [size]="18" /> Un vistazo a tus áreas</h2>
            <div class="areas">
              @for (ar of areas(); track ar.ruta) {
                <a class="area card card--hover" [routerLink]="ar.ruta">
                  <div class="area__top">
                    <app-icon [name]="ar.icon" [size]="22" /><span
                      class="sem"
                      [class]="'sem--' + ar.tone"
                    ></span>
                  </div>
                  <strong>{{ ar.titulo }}</strong>
                  <span class="tiny">{{ ar.resumen }}</span>
                </a>
              }
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <!-- Único lugar del paso de carrera en el inicio -->
          <a class="card camino" routerLink="/n/camino" appReveal>
            <img
              class="camino__img"
              src="icons/growth.png"
              alt=""
              aria-hidden="true"
              width="56"
              height="56"
            />
            <div class="camino__body">
              <span class="badge badge--brand">Mi camino</span>
              <strong>{{ p().paso.titulo }}</strong>
              <span class="tiny"
                >{{ cumplidos() }} de {{ p().paso.requisitos.length }} requisitos cumplidos · ver
                qué te falta →</span
              >
            </div>
          </a>

          @if (p().capacidades.grupo) {
            <div class="card pad" appReveal [revealDelay]="80">
              <h3 class="v2-h" style="font-size:15px">
                <app-icon name="users" [size]="16" /> Mi grupo por trabajar
              </h3>
              @for (s of grupoTop; track s.label) {
                <a class="row-eq" [class.row-eq--accent]="s.accent" routerLink="/n/grupo">
                  <span class="sem" [class]="'sem--' + s.tone"></span>
                  <span class="row-eq__label">{{ s.label }}</span>
                  <strong>{{ s.count }}</strong>
                </a>
              }
            </div>
          }

          @if (p().capacidades.incorpora) {
            <div class="card pad iyg" appReveal [revealDelay]="140">
              <img src="icons/megaphone.png" alt="" aria-hidden="true" width="44" height="44" />
              <div>
                <strong>Incorpora y Gana</strong>
                <p class="tiny" style="margin:2px 0 0">
                  S/ {{ p().ganancia.incorporaYGana | number }} este {{ c.actual }} — cada
                  incorporada activa al N1 son S/ 50 por campaña.
                </p>
                <a class="nlink" routerLink="/n/incorpora">Ver mi seguimiento →</a>
              </div>
            </div>
          } @else {
            <div class="card pad iyg iyg--up" appReveal [revealDelay]="140">
              <img src="icons/megaphone.png" alt="" aria-hidden="true" width="44" height="44" />
              <div>
                <strong>¿Sabías que puedes ganar por incorporar?</strong>
                <p class="tiny" style="margin:2px 0 0">
                  Tu primera incorporada activa te convierte en CEM: S/ 50 por campaña por persona,
                  hasta S/ 150 por cada una.
                </p>
                <a class="nlink" routerLink="/n/camino">Cómo funciona →</a>
              </div>
            </div>
          }
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .crit {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin: 16px 0 4px;
      }
      .crit__i {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .crit__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .crit__label {
        font-size: 12px;
        color: var(--ink-2);
        font-weight: 600;
      }
      .crit__v {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 800;
        line-height: 1.1;
        margin-top: 2px;
      }
      .crit__v.warn {
        color: var(--warning);
      }

      .alerta {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border-color: var(--warning);
        margin-bottom: 22px;
      }
      .alerta--ok {
        border-color: var(--success);
      }
      .alerta p {
        margin: 4px 0 0;
        font-size: 13.5px;
      }
      .alerta .btn {
        margin-left: auto;
        white-space: nowrap;
      }
      .btn--sm {
        padding: 8px 14px;
        font-size: 13px;
      }
      .pad {
        padding: 18px 20px;
      }

      .feed {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .feed__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
      }
      .feed__item--urgent {
        border-color: var(--danger);
      }
      .feed__ic {
        font-size: 22px;
      }
      .feed__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .areas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .area {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 16px;
      }
      .area__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .area__top .sem {
        width: 9px;
        height: 9px;
      }

      .camino {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
      }
      .camino__img {
        flex-shrink: 0;
      }
      .camino__body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .row-eq {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 0;
        border-bottom: 1px solid var(--line);
      }
      .row-eq:last-child {
        border-bottom: 0;
      }
      .row-eq__label {
        flex: 1;
        font-size: 13.5px;
      }
      .row-eq--accent {
        padding: 9px 10px;
        margin: 4px 0;
        border-bottom: 0;
        border-radius: var(--radius-s);
        background: var(--brand-100);
      }
      .row-eq--accent .row-eq__label {
        font-weight: 700;
        color: var(--brand-700);
      }
      .row-eq--accent .sem {
        background: var(--brand-500);
      }

      .iyg {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .iyg--up {
        border-color: var(--brand-200);
        background: var(--brand-50);
      }
      .nlink {
        display: inline-block;
        font-size: 13px;
        font-weight: 600;
        color: var(--brand-600);
        margin-top: 6px;
      }

      @media (max-width: 720px) {
        .crit {
          grid-template-columns: 1fr;
        }
        .areas {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class InicioCes {
  private readonly estatusSrv = inject(EstatusService);

  protected readonly c = CAMPANA_CES;
  protected readonly nombre = USUARIA_CES.nombre.split(' ')[0];

  /** Perfil del estatus encarnado — de aquí sale TODO lo variable de la página. */
  protected readonly p = computed(() => PERFILES[this.estatusSrv.estatus()]);
  protected readonly calificaBien = computed(() => this.p().calificandoComo === this.p().estatus);
  protected readonly ventaPct = computed(() => {
    const gp = this.p().ventaGP;
    return gp ? Math.round((gp.actual / gp.meta) * 100) : 0;
  });
  protected readonly cumplidos = computed(
    () => this.p().paso.requisitos.filter((r) => r.cumple).length,
  );

  /** Áreas visibles según capacidades del estatus, con su cifra de apoyo. */
  protected readonly areas = computed(() => {
    const p = this.p();
    const out = [
      {
        titulo: 'Mi campaña',
        icon: 'target',
        tone: 'warn',
        resumen: `Venta personal S/ ${p.ventaPersonal.toLocaleString('es-PE')} · nivel ${p.nivelGanamas} · ganancia oculta 👁`,
        ruta: '/n/campana',
      },
    ];
    if (p.capacidades.grupo) {
      out.push({
        titulo: 'Mi grupo',
        icon: 'users',
        tone: 'warn',
        resumen: `${GRUPO_CES.length} personas · 3 activas · 4 por reactivar`,
        ruta: '/n/grupo',
      });
    }
    if (p.capacidades.incorpora) {
      out.push({
        titulo: 'Incorpora y Gana',
        icon: 'heart-plus',
        tone: 'info',
        resumen: `S/ ${p.ganancia.incorporaYGana} este ${this.c.actual} · sigue motivando primeros pedidos`,
        ruta: '/n/incorpora',
      });
    }
    out.push({
      titulo: 'Mi camino',
      icon: 'star',
      tone: this.calificaBien() ? 'ok' : 'warn',
      resumen: p.paso.titulo,
      ruta: '/n/camino',
    });
    return out;
  });

  /** Lista corta priorizada del grupo (solo estatus con GP). */
  protected readonly grupoTop = [
    { label: 'Con deuda vencida', count: 1, tone: 'bad', accent: true },
    { label: 'Por reactivar', count: 4, tone: 'warn', accent: false },
    { label: 'Sin primer pedido', count: 2, tone: 'info', accent: false },
  ];
}
