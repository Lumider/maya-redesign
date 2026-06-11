import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './shared/icon';
import { USUARIA } from './data/mock';

interface NavChild {
  label: string;
  route: string;
  external?: boolean;
}

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  external?: boolean;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  { label: 'Inicio', icon: 'home', route: '/inicio' },
  {
    label: 'Mi Negocio',
    icon: 'star',
    children: [
      { label: 'Mi Campaña', route: '/mi-campana' },
      { label: 'Incorpora y Gana', route: '/incorpora-y-gana' },
      { label: 'Cuadrante A', route: '/cuadrante' },
      { label: 'Mis Pedidos', route: '/externa/mis-pedidos', external: true },
      { label: 'Status de Pedidos', route: '/externa/status-pedidos', external: true },
      { label: 'PAR+', route: '/externa/par', external: true },
      { label: 'Reportes', route: '/externa/reportes', external: true },
    ],
  },
  { label: 'Mi Grupo Personal', icon: 'users', route: '/grupo-personal' },
  { label: 'Mis Herramientas', icon: 'sparkles', route: '/herramientas' },
  { label: 'Mis Cursos', icon: 'cap', route: '/externa/cursos', external: true },
  { label: 'Incorporación', icon: 'heart-plus', route: '/externa/incorporacion', external: true },
];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar--open]="menuOpen()">
        <div class="sidebar__brand">
          <div class="wordmark">YANBAL</div>
          <div class="wordmark-sub">maya · tu negocio</div>
          <button class="sidebar__close" (click)="menuOpen.set(false)" aria-label="Cerrar menú">
            <app-icon name="x" />
          </button>
        </div>

        <button class="btn btn--primary sidebar__cta">
          <app-icon name="cart" [size]="18" />
          Realizar Pedido
        </button>

        <nav class="nav">
          @for (item of nav; track item.label) {
            @if (item.children) {
              <button class="nav__item" [class.nav__item--open]="negocioOpen()" (click)="negocioOpen.set(!negocioOpen())">
                <app-icon [name]="item.icon" [size]="19" />
                <span>{{ item.label }}</span>
                <app-icon class="nav__caret" name="chevron-down" [size]="15" />
              </button>
              @if (negocioOpen()) {
                <div class="nav__sub">
                  @for (child of item.children; track child.label) {
                    <a
                      class="nav__subitem"
                      [routerLink]="child.route"
                      routerLinkActive="nav__subitem--active"
                      (click)="menuOpen.set(false)"
                    >
                      {{ child.label }}
                      @if (child.external) {
                        <app-icon name="external" [size]="13" />
                      }
                    </a>
                  }
                </div>
              }
            } @else {
              <a
                class="nav__item"
                [routerLink]="item.route"
                routerLinkActive="nav__item--active"
                (click)="menuOpen.set(false)"
              >
                <app-icon [name]="item.icon" [size]="19" />
                <span>{{ item.label }}</span>
                @if (item.external) {
                  <app-icon class="nav__caret" name="external" [size]="14" />
                }
              </a>
            }
          }
        </nav>

        <div class="sidebar__foot">
          <div class="tiny">© 2026 Yanbal · Prototipo</div>
        </div>
      </aside>

      @if (menuOpen()) {
        <div class="scrim" (click)="menuOpen.set(false)"></div>
      }

      <!-- Contenido -->
      <div class="main">
        <header class="topbar">
          <button class="topbar__menu" (click)="menuOpen.set(true)" aria-label="Abrir menú">
            <app-icon name="menu" [size]="22" />
          </button>

          <div class="topbar__campaign">
            <app-icon name="calendar" [size]="15" />
            {{ usuaria.campana }} · {{ usuaria.semana }}
          </div>

          <div class="topbar__spacer"></div>

          <button class="topbar__iconbtn" aria-label="Buscar">
            <app-icon name="search" />
          </button>
          <button class="topbar__iconbtn" aria-label="Notificaciones">
            <app-icon name="bell" />
            <span class="dot"></span>
          </button>
          <button class="topbar__iconbtn" aria-label="Carrito">
            <app-icon name="cart" />
            <span class="count">{{ usuaria.carrito }}</span>
          </button>

          <div class="topbar__user">
            <div class="avatar">{{ usuaria.iniciales }}</div>
            <div class="topbar__userinfo">
              <strong>{{ usuaria.nombre }}</strong>
              <span>Cód. {{ usuaria.codigo }} · {{ usuaria.rol }}</span>
            </div>
            <app-icon name="chevron-down" [size]="15" />
          </div>
        </header>

        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        min-height: 100dvh;
      }

      /* ----- Sidebar ----- */
      .sidebar {
        position: sticky;
        top: 0;
        align-self: flex-start;
        height: 100dvh;
        width: 264px;
        flex: 0 0 264px;
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border-right: 1px solid var(--line);
        padding: 24px 16px 16px;
        z-index: 40;
      }
      .sidebar__brand { position: relative; padding: 0 8px 18px; }
      .wordmark {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 24px;
        letter-spacing: 0.32em;
      }
      .wordmark-sub {
        font-size: 12px;
        color: var(--brand-600);
        font-weight: 600;
        letter-spacing: 0.06em;
      }
      .sidebar__close { display: none; }
      .sidebar__cta { justify-content: center; margin: 0 4px 18px; }

      .nav { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; flex: 1; }
      .nav__item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 11px 12px;
        border: 0;
        background: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--ink-2);
        transition: background 0.15s ease, color 0.15s ease;
      }
      .nav__item:hover { background: var(--brand-50); color: var(--brand-700); }
      .nav__item--active { background: var(--brand-50); color: var(--brand-700); }
      .nav__item--active::before {
        content: '';
        position: absolute;
        margin-left: -12px;
        width: 3px;
        height: 22px;
        border-radius: 99px;
        background: var(--brand-500);
      }
      .nav__caret { margin-left: auto; color: var(--ink-3); transition: transform 0.2s ease; }
      .nav__item--open .nav__caret { transform: rotate(180deg); }

      .nav__sub { display: flex; flex-direction: column; gap: 1px; padding: 2px 0 6px 30px; }
      .nav__subitem {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-left: 1.5px solid var(--line);
        font-size: 13.5px;
        font-weight: 500;
        color: var(--ink-2);
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .nav__subitem:hover { color: var(--brand-600); }
      .nav__subitem--active {
        color: var(--brand-700);
        border-left-color: var(--brand-500);
        font-weight: 700;
      }
      .nav__subitem app-icon { color: var(--ink-3); }

      .sidebar__foot { padding: 12px 8px 0; border-top: 1px solid var(--line); }

      .scrim { display: none; }

      /* ----- Main / topbar ----- */
      .main { flex: 1; min-width: 0; }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 30;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 28px;
        background: color-mix(in srgb, var(--bg) 82%, transparent);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--line);
      }
      .topbar__menu {
        display: none;
        border: 0;
        background: none;
        padding: 6px;
        border-radius: 10px;
        color: var(--ink);
      }
      .topbar__campaign {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 99px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 700;
        color: var(--brand-700);
      }
      .topbar__spacer { flex: 1; }
      .topbar__iconbtn {
        position: relative;
        display: inline-flex;
        padding: 9px;
        border: 0;
        border-radius: 12px;
        background: none;
        color: var(--ink-2);
        transition: background 0.15s ease, color 0.15s ease;
      }
      .topbar__iconbtn:hover { background: var(--sand); color: var(--ink); }
      .dot {
        position: absolute;
        top: 8px;
        right: 9px;
        width: 7px;
        height: 7px;
        border-radius: 99px;
        background: var(--danger);
        border: 1.5px solid var(--bg);
      }
      .count {
        position: absolute;
        top: 2px;
        right: 0;
        background: var(--brand-500);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 99px;
        padding: 1px 5px;
      }
      .topbar__user {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 10px 5px 5px;
        margin-left: 6px;
        border-radius: 99px;
        background: var(--surface);
        border: 1px solid var(--line);
        cursor: pointer;
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--brand-400), var(--brand-600));
        color: #fff;
        font-weight: 700;
        font-size: 13px;
      }
      .topbar__userinfo { display: flex; flex-direction: column; line-height: 1.2; }
      .topbar__userinfo strong { font-size: 13px; }
      .topbar__userinfo span { font-size: 11px; color: var(--ink-3); }

      /* ----- Responsive ----- */
      @media (max-width: 1080px) {
        .sidebar {
          position: fixed;
          left: 0;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: var(--shadow-l);
        }
        .sidebar--open { transform: translateX(0); }
        .sidebar__close {
          display: inline-flex;
          position: absolute;
          top: -4px;
          right: 0;
          border: 0;
          background: none;
          padding: 8px;
          color: var(--ink-2);
        }
        .scrim {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(34, 28, 21, 0.4);
          z-index: 35;
          backdrop-filter: blur(2px);
        }
        .topbar__menu { display: inline-flex; }
        .topbar { padding: 10px 16px; }
        .topbar__userinfo { display: none; }
      }
    `,
  ],
})
export class App {
  protected readonly nav = NAV;
  protected readonly usuaria = USUARIA;
  protected readonly menuOpen = signal(false);
  protected readonly negocioOpen = signal(true);
}
