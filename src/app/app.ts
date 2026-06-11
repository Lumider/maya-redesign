import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './shared/icon';
import { USUARIA } from './data/mock';

interface Cat {
  label: string;
  icon: string;
  route: string;
}

const CATS: Cat[] = [
  { label: 'Inicio', icon: 'home', route: '/inicio' },
  { label: 'Mi Campaña', icon: 'star', route: '/mi-campana' },
  { label: 'Incorpora y Gana', icon: 'gift', route: '/incorpora-y-gana' },
  { label: 'Cuadrante A', icon: 'chart', route: '/cuadrante' },
  { label: 'Grupo Personal', icon: 'users', route: '/grupo-personal' },
  { label: 'Herramientas', icon: 'sparkles', route: '/herramientas' },
  { label: 'Mis Pedidos', icon: 'cart', route: '/externa/mis-pedidos' },
  { label: 'Reportes', icon: 'file', route: '/externa/reportes' },
  { label: 'Cursos', icon: 'cap', route: '/externa/cursos' },
  { label: 'Incorporar', icon: 'heart-plus', route: '/externa/incorporacion' },
];

interface MenuLink {
  label: string;
  route: string;
  bold?: boolean;
}

const MENU_LINKS: MenuLink[] = [
  { label: 'Mi Campaña', route: '/mi-campana', bold: true },
  { label: 'Mis Pedidos', route: '/externa/mis-pedidos' },
  { label: 'Status de Pedidos', route: '/externa/status-pedidos' },
  { label: 'Reporte PAR+', route: '/externa/par' },
  { label: 'Reportes', route: '/externa/reportes' },
  { label: 'Mis Cursos', route: '/externa/cursos' },
  { label: 'Incorporación', route: '/externa/incorporacion' },
];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <header class="hdr">
      <div class="hdr__inner">
        <a class="brand" routerLink="/inicio">
          <span class="brand__logo">YANBAL</span>
          <span class="brand__sub">maya</span>
        </a>

        <button class="searchpill" aria-label="Buscar en Maya">
          <span class="searchpill__seg">Campaña {{ usuaria.campana }}</span>
          <span class="searchpill__div"></span>
          <span class="searchpill__seg">Semana {{ usuaria.semana }}</span>
          <span class="searchpill__div"></span>
          <span class="searchpill__seg searchpill__seg--muted">Buscar en Maya</span>
          <span class="searchpill__btn"><app-icon name="search" [size]="14" /></span>
        </button>

        <div class="hdr__right">
          <a class="hdr__link" routerLink="/externa/mis-pedidos">Realizar Pedido</a>
          <button class="hdr__iconbtn" aria-label="Carrito">
            <app-icon name="cart" [size]="18" />
            <span class="count">{{ usuaria.carrito }}</span>
          </button>

          <div class="usermenu">
            <button class="userpill" (click)="menuOpen.set(!menuOpen())" aria-label="Menú de usuario">
              <app-icon name="menu" [size]="16" />
              <span class="avatar">{{ usuaria.iniciales }}</span>
            </button>

            @if (menuOpen()) {
              <div class="dropdown card">
                <div class="dropdown__user">
                  <strong>{{ usuaria.nombre }}</strong>
                  <span class="tiny">Cód. {{ usuaria.codigo }} · {{ usuaria.rol }}</span>
                </div>
                <div class="dropdown__sep"></div>
                @for (l of menuLinks; track l.label) {
                  <a class="dropdown__item" [class.dropdown__item--bold]="l.bold" [routerLink]="l.route" (click)="menuOpen.set(false)">
                    {{ l.label }}
                  </a>
                }
                <div class="dropdown__sep"></div>
                <a class="dropdown__item" (click)="menuOpen.set(false)">Cerrar sesión</a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Barra de categorías -->
      <nav class="cats">
        <div class="cats__inner">
          @for (c of cats; track c.label) {
            <a class="cat" [routerLink]="c.route" routerLinkActive="cat--active" (click)="menuOpen.set(false)">
              <app-icon [name]="c.icon" [size]="22" />
              <span>{{ c.label }}</span>
            </a>
          }
        </div>
      </nav>
    </header>

    @if (menuOpen()) {
      <div class="scrim" (click)="menuOpen.set(false)"></div>
    }

    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      /* ----- Header ----- */
      .hdr {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
      }
      .hdr__inner {
        display: flex;
        align-items: center;
        gap: 16px;
        max-width: 1380px;
        margin: 0 auto;
        padding: 14px 40px 10px;
      }

      .brand { display: flex; align-items: baseline; gap: 7px; flex-shrink: 0; }
      .brand__logo {
        color: var(--brand-500);
        font-weight: 800;
        font-size: 19px;
        letter-spacing: 0.18em;
      }
      .brand__sub {
        color: var(--ink-2);
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.04em;
      }

      /* Píldora de búsqueda */
      .searchpill {
        display: flex;
        align-items: center;
        margin: 0 auto;
        border: 1px solid var(--line-strong);
        background: var(--surface);
        border-radius: 99px;
        padding: 7px 7px 7px 22px;
        box-shadow: var(--shadow-s);
        transition: box-shadow 0.18s ease;
        font-size: 14px;
      }
      .searchpill:hover { box-shadow: var(--shadow); }
      .searchpill__seg { font-weight: 700; color: var(--ink); white-space: nowrap; }
      .searchpill__seg--muted { font-weight: 500; color: var(--ink-2); }
      .searchpill__div { width: 1px; height: 22px; background: var(--line-strong); margin: 0 16px; }
      .searchpill__btn {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 99px;
        background: var(--brand-grad);
        color: #fff;
        margin-left: 14px;
      }

      .hdr__right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .hdr__link {
        font-size: 13.5px;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 99px;
        transition: background 0.15s ease;
      }
      .hdr__link:hover { background: var(--sand); }
      .hdr__iconbtn {
        position: relative;
        display: inline-flex;
        padding: 10px;
        border: 0;
        border-radius: 99px;
        background: none;
        color: var(--ink);
        transition: background 0.15s ease;
      }
      .hdr__iconbtn:hover { background: var(--sand); }
      .count {
        position: absolute;
        top: 0;
        right: -2px;
        background: var(--brand-500);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 99px;
        padding: 1px 5px;
      }

      /* Menú usuario */
      .usermenu { position: relative; }
      .userpill {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 12px;
        border: 1px solid var(--line-strong);
        border-radius: 99px;
        background: var(--surface);
        color: var(--ink);
        transition: box-shadow 0.15s ease;
      }
      .userpill:hover { box-shadow: var(--shadow-s); }
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: var(--ink);
        color: #fff;
        font-weight: 700;
        font-size: 11.5px;
      }

      .dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 250px;
        padding: 8px 0;
        box-shadow: var(--shadow);
        border-radius: var(--radius);
        z-index: 60;
      }
      .dropdown__user { display: flex; flex-direction: column; padding: 10px 16px; }
      .dropdown__user strong { font-size: 14px; }
      .dropdown__sep { height: 1px; background: var(--line); margin: 6px 0; }
      .dropdown__item {
        display: block;
        padding: 10px 16px;
        font-size: 13.5px;
        color: var(--ink-2);
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .dropdown__item:hover { background: var(--sand); color: var(--ink); }
      .dropdown__item--bold { font-weight: 700; color: var(--ink); }

      .scrim { position: fixed; inset: 0; z-index: 45; }

      /* ----- Categorías ----- */
      .cats { overflow-x: auto; scrollbar-width: none; }
      .cats::-webkit-scrollbar { display: none; }
      .cats__inner {
        display: flex;
        justify-content: center;
        gap: 8px;
        max-width: 1380px;
        margin: 0 auto;
        padding: 0 40px;
      }
      .cat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        padding: 10px 12px 12px;
        border-bottom: 2px solid transparent;
        color: var(--ink-2);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0.8;
        transition: color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
      }
      .cat:hover { color: var(--ink); border-bottom-color: var(--line-strong); opacity: 1; }
      .cat--active {
        color: var(--ink);
        border-bottom-color: var(--ink);
        opacity: 1;
        font-weight: 700;
      }

      /* ----- Responsive ----- */
      @media (max-width: 980px) {
        .hdr__inner { padding: 12px 16px 8px; gap: 10px; }
        .searchpill__seg { display: none; }
        .searchpill__div { display: none; }
        .searchpill__seg--muted { display: block; }
        .searchpill { padding-left: 16px; }
        .hdr__link { display: none; }
        .cats__inner { justify-content: flex-start; padding: 0 12px; }
      }
    `,
  ],
})
export class App {
  protected readonly cats = CATS;
  protected readonly menuLinks = MENU_LINKS;
  protected readonly usuaria = USUARIA;
  protected readonly menuOpen = signal(false);
}
