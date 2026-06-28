import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './shared/icon';
import { ThemeService } from './shared/theme';
import { USUARIA } from './data/mock';

interface Cat {
  label: string;
  icon: string;
  route: string;
}

const CATS: Cat[] = [
  { label: 'Inicio', icon: 'home', route: '/inicio' },
  { label: 'Mi Plan', icon: 'target', route: '/mi-plan' },
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
  { label: 'Mi Plan', route: '/mi-plan', bold: true },
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
        <a class="brand" routerLink="/inicio" aria-label="Yanbal Maya — inicio">
          <!-- Logotipo Yanbal (desktop) -->
          <svg class="brand__logo" viewBox="21 53 321 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.02 53.7839H74.3706L52.104 85.7722V106.221H43.4543L43.5948 85.7722L21.3333 53.7839H31.9698L47.9949 77.3816L64.02 53.7839ZM99.1909 53.3334L125.215 106.216H115.286L110.465 95.806H86.6377L81.8162 106.216H72.173L98.1925 53.3334H99.1909ZM106.636 87.5638L98.624 70.4115H98.4835L90.4709 87.5638H106.636ZM168.891 53.7839H177.54V106.667H176.406L145.706 73.4805V106.216H137.056V53.3334H138.19L168.891 86.5196V53.7839ZM235.329 91.3854C235.329 100.227 228.877 106.216 218.1 106.216H199.024V53.7839H217.176C226.89 53.7839 233.698 58.8777 233.698 67.7188C233.698 73.0352 230.864 76.7827 226.609 78.9558C232.068 81.129 235.329 85.3959 235.329 91.3907V91.3854ZM207.323 61.5703V75.2031H216.825C221.436 75.2031 224.697 73.4063 224.697 68.3867C224.697 63.3672 221.436 61.5703 216.825 61.5703H207.323ZM217.462 98.4245C223.277 98.4245 226.398 96.1029 226.398 90.8607C226.398 85.6185 223.277 83.2969 217.462 83.2969H207.323V98.4298H217.462V98.4245ZM270.214 53.3334H271.207L297.232 106.216H287.303L282.481 95.806H258.659L253.838 106.216H244.194L270.214 53.3334ZM278.653 87.5638L270.64 70.4115H270.5L262.487 87.5638H278.653ZM319.709 97.6771H341.333L338.213 106.216H311.054V53.7839H319.704V97.6824L319.709 97.6771Z" fill="currentColor"/>
          </svg>
          <!-- Isotipo Yanbal (móvil) -->
          <svg class="brand__iso" viewBox="51 52.5 58 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.4287 53.3195H62.8272L84.409 83.7679V107.143H75.1397L75.2902 86.1511L51.4287 53.3195ZM87.7479 81.4608C87.2909 79.6163 87.065 77.614 87.065 75.6171C87.065 63.7773 94.5869 52.8571 106.292 52.8571C106.975 52.8571 108.19 52.9332 108.572 53.0094L87.7532 81.4608H87.7479Z" fill="currentColor"/>
          </svg>
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
          <button
            class="hdr__iconbtn"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
            [attr.aria-pressed]="theme.theme() === 'dark'"
          >
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
          </button>
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

      .brand { display: flex; align-items: flex-end; gap: 8px; flex-shrink: 0; }
      /* Color oficial del logotipo Yanbal (FrYDA Foundations) — no se tematiza */
      .brand__logo {
        height: 19px;
        width: auto;
        color: #1c1f28;
        transition: opacity 0.15s ease;
      }
      .brand:hover .brand__logo, .brand:hover .brand__iso { opacity: 0.75; }
      .brand__iso {
        display: none;
        height: 26px;
        width: auto;
        color: #1c1f28;
      }
      /* En modo oscuro el logotipo (originalmente casi negro) se aclara */
      :host-context([data-theme='dark']) .brand__logo,
      :host-context([data-theme='dark']) .brand__iso { color: #f6f3f0; }
      .brand__sub {
        color: var(--ink-2);
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.04em;
        line-height: 1;
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
        .brand__logo { display: none; }
        .brand__iso { display: block; }
        .brand__sub { display: none; }
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
  protected readonly theme = inject(ThemeService);
}
