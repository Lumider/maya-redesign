import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { CAMPANA_CES, GRUPO_CES, INCORPORADAS_CES, USUARIA_CES } from '../data/mock-ces';

/**
 * Inicio (CES) — cabina de triage de la Emprendedora Senior. Igual que en la vista
 * Líder, NO es dueño de los datos: espeja lo urgente y enruta. Cada cifra vive en
 * un solo lugar:
 *  · Los 3 críticos (calificación · venta GP · cierre) viven solo en el encabezado.
 *  · El detalle de Ganamás/morosidad/crédito vive en Mi campaña.
 *  · El detalle de requisitos CES vive en Mi camino.
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
            <span class="crit__top"
              ><span class="crit__label">Estás calificando como</span
              ><span class="sem sem--warn"></span
            ></span>
            <span class="crit__v warn">{{ u.calificandoComo }}</span>
            <span class="tiny"
              >Tu título es {{ u.titulo }} — recupera tu calificación esta campaña</span
            >
          </div>
          <div class="crit__i card">
            <span class="crit__top"><span class="crit__label">Venta de tu grupo</span></span>
            <span class="crit__v">S/ {{ c.ventaGP | number: '1.0-0' }}</span>
            <div class="progress" style="margin:8px 0 4px">
              <div class="progress__fill" [style.width.%]="ventaPct"></div>
            </div>
            <span class="tiny"
              >{{ ventaPct }}% de la meta CES (S/ {{ c.metaVentaGP | number }})</span
            >
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
          <!-- Una sola narrativa: recuperar la calificación CES -->
          <section class="card pad alerta" appReveal>
            <span class="sem sem--warn" style="margin-top:5px"></span>
            <div>
              <strong>Recupera tu calificación CES esta campaña.</strong>
              <p class="muted">
                Te faltan {{ ppedFaltan }} primeros pedidos directos y {{ activasFaltan }} activas
                directas — sin la calificación no cobras el 4% de tus hijas ni el 2% de tus nietas.
              </p>
            </div>
            <a class="btn btn--soft btn--sm" routerLink="/e/camino">Ver mi camino</a>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="check" [size]="18" /> Qué hacer esta semana</h2>
            <div class="feed">
              @for (a of pendientes; track a.id) {
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
            <h2 class="v2-h"><app-icon name="sparkles" [size]="18" /> Un vistazo a tus 4 áreas</h2>
            <div class="areas">
              @for (ar of areas; track ar.ruta) {
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
          <!-- Único lugar del sueño de carrera en el inicio -->
          <a class="card camino" routerLink="/e/camino" appReveal>
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
              <strong>De {{ u.titulo }} a Directora</strong>
              <span class="tiny">1 de 4 requisitos CES cumplidos · ver qué te falta →</span>
            </div>
          </a>

          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="users" [size]="16" /> Mi grupo por trabajar
            </h3>
            @for (s of grupoTop; track s.label) {
              <a class="row-eq" [class.row-eq--accent]="s.accent" routerLink="/e/grupo">
                <span class="sem" [class]="'sem--' + s.tone"></span>
                <span class="row-eq__label">{{ s.label }}</span>
                <strong>{{ s.count }}</strong>
              </a>
            }
          </div>

          <div class="card pad iyg" appReveal [revealDelay]="140">
            <img src="icons/megaphone.png" alt="" aria-hidden="true" width="44" height="44" />
            <div>
              <strong>Incorpora y Gana</strong>
              <p class="tiny" style="margin:2px 0 0">
                S/ {{ gananciaIyg | number }} ganados · {{ sinPedido }} incorporadas aún sin primer
                pedido
              </p>
              <a class="nlink" routerLink="/e/incorpora">Ver mi seguimiento →</a>
            </div>
          </div>
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
  protected readonly u = USUARIA_CES;
  protected readonly c = CAMPANA_CES;
  protected readonly nombre = USUARIA_CES.nombre.split(' ')[0];

  protected readonly ventaPct = Math.round((CAMPANA_CES.ventaGP / CAMPANA_CES.metaVentaGP) * 100); // 50
  protected readonly ppedFaltan = CAMPANA_CES.metaPped - CAMPANA_CES.ppedDirectos; // 2
  protected readonly activasFaltan = CAMPANA_CES.metaActivasDirectas - CAMPANA_CES.activasDirectas; // 2

  protected readonly gananciaIyg = INCORPORADAS_CES.reduce((s, i) => s + i.gananciaAcumulada, 0);
  protected readonly sinPedido = INCORPORADAS_CES.filter((i) => !i.primerPedido).length;

  /** Acciones concretas y con impacto, ordenadas por urgencia. */
  protected readonly pendientes = [
    {
      id: 'a1',
      emoji: '💳',
      texto: 'Acompaña a Hermelinda a pagar S/ 111.15',
      impacto: 'Tu IM baja de 5.14% a 5.00% — dentro del límite',
      ruta: '/e/campana',
      urgente: true,
    },
    {
      id: 'a2',
      emoji: '🎯',
      texto: 'Asegura el primer pedido de Carolina y Diego',
      impacto: 'PPED directos +2 de 2 · recuperas tu calificación CES',
      ruta: '/e/grupo',
      urgente: false,
    },
    {
      id: 'a3',
      emoji: '📞',
      texto: 'Llama a Emilia: solo lleva 1 campaña inactiva',
      impacto: 'Reactivada +1 · te acerca a las 5 activas directas',
      ruta: '/e/grupo',
      urgente: false,
    },
    {
      id: 'a4',
      emoji: '🛍️',
      texto: 'Completa S/ 379.50 en tu pedido para el nivel N4',
      impacto: 'Más premios Ganamás en producto',
      ruta: '/e/campana',
      urgente: false,
    },
  ];

  /** Cifra de apoyo de cada área — vive SOLO aquí. */
  protected readonly areas = [
    {
      titulo: 'Mi campaña',
      icon: 'target',
      tone: 'warn',
      resumen: `Venta GP S/ 3,029 · IM 5.14% · ganancia oculta 👁`,
      ruta: '/e/campana',
    },
    {
      titulo: 'Mi grupo',
      icon: 'users',
      tone: 'warn',
      resumen: `${GRUPO_CES.length} personas · 3 activas · 4 por reactivar`,
      ruta: '/e/grupo',
    },
    {
      titulo: 'Incorpora y Gana',
      icon: 'heart-plus',
      tone: 'info',
      resumen: `${INCORPORADAS_CES.length} en programa · S/ ${this.gananciaIyg} ganados`,
      ruta: '/e/incorpora',
    },
    {
      titulo: 'Mi camino',
      icon: 'star',
      tone: 'warn',
      resumen: 'Título CES · calificando como CNS',
      ruta: '/e/camino',
    },
  ];

  /** Lista corta priorizada: deuda (acento) → reactivar → sin 1er pedido. */
  protected readonly grupoTop = [
    { label: 'Con deuda vencida', count: 1, tone: 'bad', accent: true },
    { label: 'Por reactivar', count: 4, tone: 'warn', accent: false },
    { label: 'Sin primer pedido', count: 2, tone: 'info', accent: false },
  ];
}
