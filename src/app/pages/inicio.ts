import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Icon3d } from '../shared/icon3d';
import {
  ANUNCIOS,
  INDICADORES,
  MATERIALES,
  PEDIDO_PERSONAL,
  SEGMENTOS_GP,
  USUARIA,
} from '../data/mock';

const ACCESOS = [
  { label: 'Reportes', icon: 'chart', route: '/externa/reportes' },
  { label: 'Incorpora y Gana', icon: 'gift', route: '/incorpora-y-gana' },
  { label: 'PAR+', icon: 'plane', route: '/externa/par' },
  { label: 'Elige Crecer', icon: 'rocket', route: '/cuadrante' },
  { label: 'Incorporar', icon: 'heart', route: '/externa/incorporacion' },
  { label: 'Mis Cursos', icon: 'cap', route: '/externa/cursos' },
];

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Icon3d],
  template: `
    <div class="page">
      <!-- Saludo + pedido personal de la campaña -->
      <header class="hero">
        <div>
          <h1 class="page-title">¡Hola, {{ nombreCorto }}! 👋</h1>
          <p class="muted">
            Así va tu negocio en la campaña {{ usuaria.campana }} · semana {{ usuaria.semana }}.
          </p>
          <a class="planlink" routerLink="/mi-plan">
            <span class="planlink__dot"></span>
            Tu plan {{ usuaria.campana }} va por debajo del ritmo — ver acciones de la semana
            <app-icon name="arrow-right" [size]="14" />
          </a>
        </div>

        @if (pedido.estado === 'pendiente') {
          <aside class="task card">
            <app-icon3d name="bag" [size]="46" />
            <div class="task__body">
              <div class="task__head">
                <strong>Tu pedido personal · {{ usuaria.campana }}</strong>
                <span class="badge badge--warning">Pendiente</span>
              </div>
              <p>
                Pásalo al N1 Gana Más (\${{ pedido.metaN1 }}) antes del cierre ({{ pedido.cierre }})
                para mantener tu calificación y premios.
              </p>
              <div class="progress">
                <div
                  class="progress__fill"
                  [style.width.%]="(pedido.ventaActual / pedido.metaN1) * 100"
                ></div>
              </div>
            </div>
            <a class="btn btn--primary task__cta" routerLink="/externa/mis-pedidos"
              >Realizar pedido</a
            >
          </aside>
        } @else {
          <aside class="task task--done card">
            <span class="task__check">✓</span>
            <div class="task__body">
              <strong>Pedido personal {{ usuaria.campana }} calificado</strong>
              <p>Ya estás activa al N1 Gana Más esta campaña.</p>
            </div>
          </aside>
        }
      </header>

      <!-- Accesos rápidos -->
      <div class="quick">
        @for (a of accesos; track a.label) {
          <a class="quick__item card card--hover" [routerLink]="a.route">
            <app-icon3d class="quick__art" [name]="a.icon" [size]="64" />
            <span>{{ a.label }}</span>
          </a>
        }
      </div>

      <!-- Indicadores -->
      <h2 class="section-title">Indicadores</h2>
      <div class="stats">
        @for (i of indicadores; track i.label) {
          <article class="stat card card--hover" [class]="'stat--' + i.tone">
            <span class="stat__icon"><app-icon [name]="i.icon" [size]="19" /></span>
            <div class="stat__label">{{ i.label }}</div>
            <div class="stat__value">{{ i.valor }}</div>
            @if (i.detalle) {
              <div class="stat__hint">{{ i.detalle }}</div>
            }
          </article>
        }
      </div>

      <!-- Gestión de Grupo Personal -->
      <h2 class="section-title">
        Gestión de tu Grupo Personal
        <a routerLink="/grupo-personal" class="see-all"
          >Ver grupo <app-icon name="arrow-right" [size]="15"
        /></a>
      </h2>
      <div class="segments">
        @for (s of segmentos; track s.label) {
          <a class="segment card card--hover" routerLink="/grupo-personal">
            <span class="segment__count" [class]="'badge badge--' + s.tone">{{ s.count }}</span>
            <div>
              <div class="segment__label">{{ s.label }}</div>
              <div class="tiny">{{ s.hint }}</div>
            </div>
            <app-icon class="segment__arrow" name="chevron-right" [size]="16" />
          </a>
        }
      </div>

      <!-- Anuncios -->
      <h2 class="section-title">Anuncios</h2>
      <div class="banners">
        @for (b of anuncios; track b.titulo) {
          <article class="banner" [style.background]="b.gradiente">
            <div class="banner__emoji">{{ b.emoji }}</div>
            <h3>{{ b.titulo }}</h3>
            <p>{{ b.texto }}</p>
            <span class="banner__cta">{{ b.cta }} →</span>
          </article>
        }
      </div>

      <!-- Material campañal -->
      <h2 class="section-title">
        Material Campañal
        <a routerLink="/herramientas" class="see-all"
          >Ver todo <app-icon name="arrow-right" [size]="15"
        /></a>
      </h2>
      <div class="materials">
        @for (m of materiales; track m.titulo) {
          <a class="material card--hover" routerLink="/herramientas">
            <div class="material__cover" [style.background]="m.gradiente">
              @if (m.imagen) {
                <img class="material__img" [src]="m.imagen" [alt]="m.titulo" />
              } @else {
                <span>{{ m.emoji }}</span>
              }
              @if (m.tag) {
                <span class="material__tag" [class.material__tag--new]="m.tag === 'Nuevo'">{{
                  m.tag
                }}</span>
              }
            </div>
            <div class="material__title">{{ m.titulo }}</div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .hero p {
        margin: 6px 0 0;
      }
      .planlink {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-top: 10px;
        font-size: 13px;
        font-weight: 700;
        color: var(--brand-600);
        background: var(--brand-50);
        border: 1px solid var(--brand-100);
        border-radius: 99px;
        padding: 7px 14px;
        transition: background 0.15s ease;
      }
      .planlink:hover {
        background: var(--brand-100);
      }
      .planlink__dot {
        width: 8px;
        height: 8px;
        border-radius: 99px;
        background: var(--warning);
        box-shadow: 0 0 0 3px var(--warning-bg);
      }

      /* Tarjeta de pedido personal (CTA contextual de la campaña) */
      .task {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        max-width: 560px;
      }
      .task__body {
        min-width: 0;
        flex: 1;
      }
      .task__head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .task__body p {
        margin: 3px 0 8px;
        font-size: 12.5px;
        color: var(--ink-2);
        line-height: 1.4;
      }
      .task__cta {
        padding: 9px 16px;
        font-size: 13px;
        white-space: nowrap;
      }
      .task--done {
        border-color: var(--success);
        background: var(--success-bg);
      }
      .task__check {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 99px;
        background: var(--fill-success);
        color: #fff;
        font-size: 18px;
        font-weight: 800;
      }

      .see-all {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 700;
        color: var(--brand-600);
      }
      .see-all:hover {
        color: var(--brand-700);
      }

      /* Accesos rápidos */
      .quick {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 12px;
        margin-bottom: 36px;
      }
      .quick__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 14px 8px 14px;
        font-size: 12.5px;
        font-weight: 700;
        text-align: center;
        color: var(--ink);
      }
      .quick__art {
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .quick__item:hover .quick__art {
        transform: translateY(-4px) scale(1.07) rotate(-2deg);
      }

      /* Stats */
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 12px;
        margin-bottom: 36px;
      }
      .stat {
        position: relative;
        padding: 16px;
        overflow: hidden;
      }
      .stat::after {
        content: '';
        position: absolute;
        inset: 0 0 auto;
        height: 3px;
      }
      .stat--brand::after {
        background: var(--brand-500);
      }
      .stat--success::after {
        background: var(--success);
      }
      .stat--warning::after {
        background: var(--warning);
      }
      .stat--danger::after {
        background: var(--danger);
      }
      .stat--info::after {
        background: var(--info);
      }
      .stat__icon {
        position: absolute;
        top: 14px;
        right: 14px;
        color: var(--ink-3);
      }
      .stat__label {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ink-2);
      }
      .stat__value {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 700;
        margin-top: 2px;
      }
      .stat--danger .stat__value {
        color: var(--danger);
      }
      .stat__hint {
        font-size: 11.5px;
        color: var(--ink-3);
        margin-top: 4px;
      }

      /* Segmentos */
      .segments {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
        margin-bottom: 36px;
      }
      .segment {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
      }
      .segment__count {
        font-size: 13px;
        min-width: 36px;
        justify-content: center;
      }
      .segment__label {
        font-weight: 700;
        font-size: 14px;
      }
      .segment__arrow {
        margin-left: auto;
        color: var(--ink-3);
      }

      /* Anuncios */
      .banners {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-bottom: 36px;
      }
      .banner {
        position: relative;
        border-radius: var(--radius-l);
        color: #fff;
        padding: 22px;
        min-height: 150px;
        overflow: hidden;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }
      /* Scrim: oscurece donde va el texto (izquierda) y se desvanece hacia el
         color vibrante (derecha) para garantizar contraste AA del texto blanco. */
      .banner::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.45) 0%,
          rgba(0, 0, 0, 0.3) 60%,
          rgba(0, 0, 0, 0.05) 100%
        );
        pointer-events: none;
      }
      .banner > * {
        position: relative;
        z-index: 1;
      }
      .banner:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-l);
      }
      .banner h3 {
        font-size: 21px;
        color: #fff;
      }
      .banner p {
        font-size: 13px;
        margin: 6px 0 14px;
        max-width: 30ch;
      }
      .banner__cta {
        font-size: 13px;
        font-weight: 700;
        border-bottom: 1.5px solid rgba(255, 255, 255, 0.7);
        padding-bottom: 2px;
      }
      .banner__emoji {
        position: absolute;
        right: 14px;
        bottom: 8px;
        font-size: 52px;
        opacity: 0.85;
      }

      /* Material */
      .materials {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 168px;
        gap: 14px;
        overflow-x: auto;
        padding-bottom: 8px;
        scroll-snap-type: x mandatory;
      }
      .material {
        scroll-snap-align: start;
        border-radius: var(--radius);
      }
      .material__cover {
        position: relative;
        height: 210px;
        border-radius: var(--radius);
        display: grid;
        place-items: center;
        font-size: 46px;
        box-shadow: var(--shadow-s);
      }
      /* Portada real (render con transparencia) flotando sobre el degradado. */
      .material__img {
        width: 82%;
        height: 82%;
        object-fit: contain;
      }
      .material__tag {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: var(--ink);
        color: var(--on-ink);
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border-radius: 99px;
        padding: 3px 9px;
      }
      .material__tag--new {
        background: var(--fill-brand);
        color: #fff;
      }
      .material__title {
        font-size: 13px;
        font-weight: 600;
        padding: 10px 4px 0;
        color: var(--ink-2);
      }

      @media (max-width: 1100px) {
        .quick {
          grid-template-columns: repeat(4, 1fr);
        }
        .banners {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 640px) {
        .quick {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ],
})
export class InicioPage {
  protected readonly usuaria = USUARIA;
  protected readonly accesos = ACCESOS;
  protected readonly indicadores = INDICADORES;
  protected readonly segmentos = SEGMENTOS_GP;
  protected readonly anuncios = ANUNCIOS;
  protected readonly materiales = MATERIALES;
  protected readonly pedido = PEDIDO_PERSONAL;
  protected readonly nombreCorto = USUARIA.nombre.split(' ')[0];
}
