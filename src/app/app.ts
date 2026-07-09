import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from './shared/icon';
import { Breadcrumb, Miga } from './shared/breadcrumb';
import { Loader } from './shared/loader';
import { ThemeService } from './shared/theme';
import { VersionService } from './shared/version';
import { AccesoService } from './shared/acceso';
import { AccesoGate } from './shared/acceso-gate';
import { AudienciaService, EstatusDirService, EstatusService } from './shared/estatus';
import { EstatusSwitchGlobal } from './shared/estatus-switch-global';
import { AsistenteWidget } from './shared/asistente-widget';
import { USUARIA } from './data/mock';
import { PERFILES, USUARIA_CES } from './data/mock-ces';
import { PERFIL_BDM, USUARIA_BDM } from './data/mock-bdm';
import { PERFILES_DIR } from './data/mock-dir';

interface Cat {
  label: string;
  icon: string;
  route: string;
  /** Etiqueta corta para el bottom nav móvil. */
  short?: string;
}

/** Navegación de la vista nueva (beta): 5 áreas + Herramientas (apoyo, en menú). */
const NEW_CATS: Cat[] = [
  { label: 'Inicio', icon: 'home', route: '/n/inicio', short: 'Inicio' },
  { label: 'Mi negocio', icon: 'chart', route: '/n/negocio', short: 'Negocio' },
  { label: 'Mi campaña', icon: 'target', route: '/n/campana', short: 'Campaña' },
  { label: 'Mi equipo', icon: 'users', route: '/n/equipo', short: 'Equipo' },
  { label: 'Mi carrera', icon: 'star', route: '/n/carrera', short: 'Carrera' },
];

/** Navegación de la Audiencia Emprendedoras (CNS→ASP) dentro de la vista nueva. */
const EMP_CATS: Cat[] = [
  { label: 'Inicio', icon: 'home', route: '/n/inicio', short: 'Inicio' },
  { label: 'Mi campaña', icon: 'target', route: '/n/campana', short: 'Campaña' },
  { label: 'Mi grupo', icon: 'users', route: '/n/grupo', short: 'Grupo' },
  { label: 'Incorpora y Gana', icon: 'heart-plus', route: '/n/incorpora', short: 'Incorpora' },
  { label: 'Mi camino', icon: 'star', route: '/n/camino', short: 'Camino' },
];

/** Navegación de la BDM (Staff de Ventas): primer release. */
const BDM_CATS: Cat[] = [
  { label: 'Inicio', icon: 'home', route: '/n/inicio', short: 'Inicio' },
  { label: 'Mi campaña', icon: 'target', route: '/n/campana', short: 'Campaña' },
  { label: 'Mis Directoras', icon: 'users', route: '/n/directoras', short: 'Directoras' },
  { label: 'Herramientas', icon: 'sparkles', route: '/n/herramientas', short: 'Herram.' },
];

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

/** Etiqueta de cada ruta para el breadcrumb (home > sección). Se alimenta de
 *  los mismos rótulos de la navegación; home y /ui no llevan breadcrumb. */
const ROUTE_LABELS: Record<string, string> = {
  '/n/pedidos': 'Realizar pedido',
  '/n/negocio': 'Mi negocio',
  '/n/campana': 'Mi campaña',
  '/n/equipo': 'Mi equipo',
  '/n/carrera': 'Mi carrera',
  '/n/grupo': 'Mi grupo',
  '/n/incorpora': 'Incorpora y Gana',
  '/n/camino': 'Mi camino',
  '/n/directoras': 'Mis Directoras',
  '/n/herramientas': 'Herramientas',
  '/mi-plan': 'Mi Plan',
  '/mi-campana': 'Mi Campaña',
  '/incorpora-y-gana': 'Incorpora y Gana',
  '/grupo-personal': 'Grupo Personal',
  '/cuadrante': 'Cuadrante A',
  '/herramientas': 'Herramientas',
};

/** Títulos de las apps externas (/externa/:slug) para el último nivel. */
const EXTERNA_LABELS: Record<string, string> = {
  'mis-pedidos': 'Mis Pedidos',
  'status-pedidos': 'Status de Pedidos',
  par: 'Reporte PAR+',
  reportes: 'Reportes',
  cursos: 'Mis Cursos',
  incorporacion: 'Incorporación',
};

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
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Icon,
    Breadcrumb,
    Loader,
    EstatusSwitchGlobal,
    AsistenteWidget,
    AccesoGate,
  ],
  template: `
    <!-- Puerta de la demo: cubre todo hasta ingresar la clave; el loader
         arranca recién al autorizar para no perder su animación de entrada -->
    @if (!acceso.autorizado()) {
      <app-acceso-gate />
    } @else if (!entered()) {
      <app-loader (done)="entered.set(true)" />
    }

    <header class="hdr">
      <div class="hdr__inner" [class.hdr__inner--new]="moderna()">
        <a class="brand" [routerLink]="homeRoute()" aria-label="Yanbal Maya — inicio">
          <!-- Logotipo Yanbal (desktop) -->
          <svg
            class="brand__logo"
            viewBox="21 53 321 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M64.02 53.7839H74.3706L52.104 85.7722V106.221H43.4543L43.5948 85.7722L21.3333 53.7839H31.9698L47.9949 77.3816L64.02 53.7839ZM99.1909 53.3334L125.215 106.216H115.286L110.465 95.806H86.6377L81.8162 106.216H72.173L98.1925 53.3334H99.1909ZM106.636 87.5638L98.624 70.4115H98.4835L90.4709 87.5638H106.636ZM168.891 53.7839H177.54V106.667H176.406L145.706 73.4805V106.216H137.056V53.3334H138.19L168.891 86.5196V53.7839ZM235.329 91.3854C235.329 100.227 228.877 106.216 218.1 106.216H199.024V53.7839H217.176C226.89 53.7839 233.698 58.8777 233.698 67.7188C233.698 73.0352 230.864 76.7827 226.609 78.9558C232.068 81.129 235.329 85.3959 235.329 91.3907V91.3854ZM207.323 61.5703V75.2031H216.825C221.436 75.2031 224.697 73.4063 224.697 68.3867C224.697 63.3672 221.436 61.5703 216.825 61.5703H207.323ZM217.462 98.4245C223.277 98.4245 226.398 96.1029 226.398 90.8607C226.398 85.6185 223.277 83.2969 217.462 83.2969H207.323V98.4298H217.462V98.4245ZM270.214 53.3334H271.207L297.232 106.216H287.303L282.481 95.806H258.659L253.838 106.216H244.194L270.214 53.3334ZM278.653 87.5638L270.64 70.4115H270.5L262.487 87.5638H278.653ZM319.709 97.6771H341.333L338.213 106.216H311.054V53.7839H319.704V97.6824L319.709 97.6771Z"
              fill="currentColor"
            />
          </svg>
          <!-- Isotipo Yanbal (móvil) -->
          <svg
            class="brand__iso"
            viewBox="51 52.5 58 55"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M51.4287 53.3195H62.8272L84.409 83.7679V107.143H75.1397L75.2902 86.1511L51.4287 53.3195ZM87.7479 81.4608C87.2909 79.6163 87.065 77.614 87.065 75.6171C87.065 63.7773 94.5869 52.8571 106.292 52.8571C106.975 52.8571 108.19 52.9332 108.572 53.0094L87.7532 81.4608H87.7479Z"
              fill="currentColor"
            />
          </svg>
          <span class="brand__sub">maya</span>
        </a>

        <!-- Identidad + contexto (izquierda) -->
        @if (moderna()) {
          <span class="ctxpill" aria-label="Contexto de campaña">
            <app-icon name="target" [size]="14" /> Campaña {{ u().campana }}
            <span class="ctxpill__div"></span> Semana {{ u().semana }}
            <span class="ctxpill__div"></span>
            <span class="ctxpill__rol">{{ rolCorto() }}</span>
          </span>
        } @else {
          <button class="searchpill" aria-label="Buscar en Maya">
            <span class="searchpill__seg">Campaña {{ u().campana }}</span>
            <span class="searchpill__div"></span>
            <span class="searchpill__seg">Semana {{ u().semana }}</span>
            <span class="searchpill__div"></span>
            <span class="searchpill__seg searchpill__seg--muted">Buscar en Maya</span>
            <span class="searchpill__btn"><app-icon name="search" [size]="14" /></span>
          </button>
        }

        <div class="hdr__right">
          @if (moderna()) {
            <!-- Utilidades: buscar + carrito (el carrito se oculta en móvil) -->
            <button class="hdr__iconbtn hdr__iconbtn--search" aria-label="Buscar en Maya">
              <app-icon name="search" [size]="18" />
            </button>
            <a
              class="hdr__iconbtn hdr__iconbtn--cart"
              routerLink="/n/pedidos"
              aria-label="Ver mi bolsa"
            >
              <app-icon name="cart" [size]="18" />
              <span class="count">{{ u().carrito }}</span>
            </a>
            <!-- Acciones: Realizar pedido (primario) · Incorporar (secundario) -->
            <div class="hdr__actions">
              <a
                class="btn btn--primary btn--sm"
                routerLink="/n/pedidos"
                aria-label="Realizar pedido"
              >
                <app-icon name="cart" [size]="16" />
                <span class="hdr__actions-l">Realizar pedido</span>
                <span class="hdr__actions-s">Pedido</span>
              </a>
              <a
                class="btn btn--ghost btn--sm hdr__inc"
                [routerLink]="esEmp() ? '/n/incorpora' : '/n/equipo'"
                aria-label="Incorporar"
              >
                <app-icon name="heart-plus" [size]="16" />
                <span class="hdr__actions-l">Incorporar</span>
                <span class="hdr__actions-plus" aria-hidden="true">＋</span>
              </a>
            </div>
            <!-- Yana (proyecto Clippy): vive en el header nav — presente en toda
                 la vista nueva; burbuja y panel se despliegan bajo el header -->
            <app-asistente modo="header" />
          } @else {
            <button
              class="vswitch"
              type="button"
              role="switch"
              [attr.aria-checked]="version.nueva()"
              (click)="toggleVersion()"
              title="Alterna entre la versión actual y la nueva"
            >
              <span class="vswitch__label"
                >Vista nueva <span class="vswitch__beta">beta</span></span
              >
              <span class="vswitch__track" [class.vswitch__track--on]="version.nueva()"
                ><span class="vswitch__knob"></span
              ></span>
            </button>
            <button
              class="hdr__iconbtn"
              (click)="theme.toggle()"
              [attr.aria-label]="
                theme.theme() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
              "
              [attr.aria-pressed]="theme.theme() === 'dark'"
            >
              <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
            </button>
            <button class="hdr__iconbtn" aria-label="Carrito">
              <app-icon name="cart" [size]="18" />
              <span class="count">{{ u().carrito }}</span>
            </button>
          }

          <!-- Cuenta -->
          <div class="usermenu">
            <button
              class="userpill"
              (click)="menuOpen.set(!menuOpen())"
              aria-label="Menú de usuario"
            >
              <app-icon name="menu" [size]="16" />
              <span class="avatar">{{ u().iniciales }}</span>
            </button>

            @if (menuOpen()) {
              <div class="dropdown card">
                <div class="dropdown__user">
                  <strong>{{ u().nombre }}</strong>
                  <span class="tiny">Cód. {{ u().codigo }} · {{ u().rol }}</span>
                </div>
                @if (moderna()) {
                  <!-- Ajustes (no acciones frecuentes): BETA arriba del todo + tema -->
                  <div class="dropdown__sep"></div>
                  <button
                    class="dropdown__toggle"
                    (click)="toggleVersion()"
                    role="switch"
                    aria-checked="true"
                  >
                    <span class="dropdown__toggle-l"
                      >Vista nueva <span class="vswitch__beta">beta</span></span
                    >
                    <span class="vswitch__track vswitch__track--on"
                      ><span class="vswitch__knob"></span
                    ></span>
                  </button>
                  <button
                    class="dropdown__toggle"
                    (click)="theme.toggle()"
                    [attr.aria-pressed]="theme.theme() === 'dark'"
                  >
                    <span class="dropdown__toggle-l"
                      ><app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="16" />
                      Modo {{ theme.theme() === 'dark' ? 'claro' : 'oscuro' }}</span
                    >
                  </button>
                  <div class="dropdown__sep"></div>
                  <a class="dropdown__item" (click)="menuOpen.set(false)">Mi perfil</a>
                  <a class="dropdown__item" (click)="menuOpen.set(false)">Ajustes</a>
                  <a class="dropdown__item" (click)="menuOpen.set(false)">Notificaciones</a>
                  <div class="dropdown__sep"></div>
                  @if (!esEmp()) {
                    <a
                      class="dropdown__item dropdown__item--bold"
                      routerLink="/n/herramientas"
                      (click)="menuOpen.set(false)"
                      >Herramientas</a
                    >
                  }
                  <a
                    class="dropdown__item"
                    routerLink="/externa/cursos"
                    (click)="menuOpen.set(false)"
                    >Mis Cursos</a
                  >
                  <a
                    class="dropdown__item"
                    routerLink="/externa/reportes"
                    (click)="menuOpen.set(false)"
                    >Reportes</a
                  >
                } @else {
                  <div class="dropdown__sep"></div>
                  @for (l of menuLinks; track l.label) {
                    <a
                      class="dropdown__item"
                      [class.dropdown__item--bold]="l.bold"
                      [routerLink]="l.route"
                      (click)="menuOpen.set(false)"
                    >
                      {{ l.label }}
                    </a>
                  }
                }
                <div class="dropdown__sep"></div>
                <a class="dropdown__item" (click)="menuOpen.set(false)">Cerrar sesión</a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Barra de categorías (cambia según la vista activa: actual · nueva · CES) -->
      <nav class="cats" [class.cats--new]="moderna()" aria-label="Categorías">
        <div class="cats__inner">
          @for (c of activeCats(); track c.label) {
            <a
              class="cat"
              [routerLink]="c.route"
              routerLinkActive="cat--active"
              (click)="menuOpen.set(false)"
            >
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
      @if (migas().length) {
        <div class="crumbs">
          <app-breadcrumb [items]="migas()" [homeLink]="homeRoute()" />
        </div>
      }
      <router-outlet />
    </main>

    <!-- Bottom nav (vistas nueva y CES; visible únicamente en móvil vía CSS) -->
    @if (moderna()) {
      <nav class="botnav" aria-label="Navegación principal">
        @for (c of activeCats(); track c.label) {
          <a
            class="botnav__i"
            [routerLink]="c.route"
            routerLinkActive="botnav__i--active"
            (click)="menuOpen.set(false)"
          >
            <app-icon [name]="c.icon" [size]="22" />
            <span>{{ c.short ?? c.label }}</span>
          </a>
        }
      </nav>
    }

    <!-- Conmutador global (demo): toda la carrera CNS → REG en la vista nueva -->
    @if (version.nueva()) {
      <app-estatus-switch-global />
    }
  `,
  styles: [
    `
      /* ----- Breadcrumb (desktop) — alineado al ancho de contenido (1180/40px),
         espaciado en grilla de 4px: 16px bajo el header. En móvil se oculta
         igual que el propio componente, sin dejar espacio vacío. ----- */
      .crumbs {
        max-width: 1180px;
        margin: 0 auto;
        padding: 16px 40px 0;
      }
      @media (max-width: 720px) {
        .crumbs {
          display: none;
        }
      }

      /* ----- Header ----- */
      .hdr {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--header-bg);
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

      .brand {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        flex-shrink: 0;
      }
      /* Color oficial del logotipo Yanbal (FrYDA Foundations) — no se tematiza */
      .brand__logo {
        height: 19px;
        width: auto;
        color: #1c1f28;
        transition: opacity 0.15s ease;
      }
      .brand:hover .brand__logo,
      .brand:hover .brand__iso {
        opacity: 0.75;
      }
      .brand__iso {
        display: none;
        height: 26px;
        width: auto;
        color: #1c1f28;
      }
      /* En modo oscuro el logotipo (originalmente casi negro) se aclara */
      :host-context([data-theme='dark']) .brand__logo,
      :host-context([data-theme='dark']) .brand__iso {
        color: #f6f3f0;
      }
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
      .searchpill:hover {
        box-shadow: var(--shadow);
      }
      .searchpill__seg {
        font-weight: 700;
        color: var(--ink);
        white-space: nowrap;
      }
      .searchpill__seg--muted {
        font-weight: 500;
        color: var(--ink-2);
      }
      .searchpill__div {
        width: 1px;
        height: 22px;
        background: var(--line-strong);
        margin: 0 16px;
      }
      .searchpill__btn {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 99px;
        background: var(--brand-grad-strong);
        color: #fff;
        margin-left: 14px;
      }

      .hdr__right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      /* Vista nueva: tres grupos — identidad/contexto (izq) · acciones+cuenta (der) */
      .hdr__inner--new .hdr__right {
        margin-left: auto;
        gap: 8px;
      }
      /* Pastilla de contexto (una sola, no chips sueltos) */
      .ctxpill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--line-strong);
        background: var(--surface);
        border-radius: 99px;
        padding: 8px 16px;
        box-shadow: var(--shadow-s);
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
        white-space: nowrap;
      }
      .ctxpill__div {
        width: 1px;
        height: 14px;
        background: var(--line-strong);
      }
      .ctxpill__rol {
        color: var(--brand-700);
      }
      /* Acciones del header (vista nueva): primario relleno + secundario borde */
      .hdr__actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hdr__actions .btn {
        padding: 9px 16px;
        font-size: 13px;
      }
      /* Etiqueta corta ("Pedido") y "＋": solo aparecen en móvil */
      .hdr__actions-s,
      .hdr__actions-plus {
        display: none;
      }
      /* Separador visual entre utilidades y acciones */
      .hdr__inner--new .hdr__actions {
        margin-left: 4px;
        padding-left: 10px;
        border-left: 1px solid var(--line);
      }
      /* Filas-toggle dentro del menú (BETA / tema) */
      .dropdown__toggle {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 16px;
        background: none;
        border: 0;
        color: var(--ink);
        font-size: 13.5px;
        font-weight: 700;
        transition: background 0.12s ease;
      }
      .dropdown__toggle:hover {
        background: var(--sand);
      }
      .dropdown__toggle-l {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .hdr__link {
        font-size: 13.5px;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 99px;
        transition: background 0.15s ease;
      }
      .hdr__link:hover {
        background: var(--sand);
      }
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
      .hdr__iconbtn:hover {
        background: var(--sand);
      }
      .count {
        position: absolute;
        top: 0;
        right: -2px;
        background: var(--fill-brand);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 99px;
        padding: 1px 5px;
      }

      /* Menú usuario */
      .usermenu {
        position: relative;
      }
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
      .userpill:hover {
        box-shadow: var(--shadow-s);
      }
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: var(--ink);
        color: var(--on-ink);
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
      .dropdown__user {
        display: flex;
        flex-direction: column;
        padding: 10px 16px;
      }
      .dropdown__user strong {
        font-size: 14px;
      }
      .dropdown__sep {
        height: 1px;
        background: var(--line);
        margin: 6px 0;
      }
      .dropdown__item {
        display: block;
        padding: 10px 16px;
        font-size: 13.5px;
        color: var(--ink-2);
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .dropdown__item:hover {
        background: var(--sand);
        color: var(--ink);
      }
      .dropdown__item--bold {
        font-weight: 700;
        color: var(--ink);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 45;
      }

      /* ----- Categorías ----- */
      .cats {
        overflow-x: auto;
        scrollbar-width: none;
      }
      .cats::-webkit-scrollbar {
        display: none;
      }
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
        transition:
          color 0.15s ease,
          border-color 0.15s ease;
      }
      .cat:hover {
        color: var(--ink);
        border-bottom-color: var(--line-strong);
      }
      .cat--active {
        color: var(--ink);
        border-bottom-color: var(--ink);
        opacity: 1;
        font-weight: 700;
      }
      /* Nav de la vista nueva: 5 tabs centrados y holgados */
      .cats--new .cats__inner {
        justify-content: center;
        gap: 6px;
      }
      .cats--new .cat {
        padding: 10px 20px 12px;
        font-size: 13px;
      }

      /* ----- Switch de versión (Vista nueva beta) ----- */
      .vswitch {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        background: var(--sand);
        border: 1px solid var(--line);
        border-radius: 99px;
        padding: 6px 8px 6px 14px;
        color: var(--ink);
      }
      .vswitch:hover {
        border-color: var(--line-strong);
      }
      .vswitch__label {
        font-size: 12.5px;
        font-weight: 700;
        white-space: nowrap;
      }
      .vswitch__beta {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: var(--brand-100);
        color: var(--brand-700);
        padding: 1px 5px;
        border-radius: 99px;
        margin-left: 2px;
      }
      .vswitch__track {
        position: relative;
        width: 38px;
        height: 22px;
        border-radius: 99px;
        background: var(--line-strong);
        transition: background 0.18s ease;
        flex-shrink: 0;
      }
      .vswitch__track--on {
        background: var(--brand-grad-strong);
      }
      .vswitch__knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 99px;
        background: #fff;
        box-shadow: var(--shadow-s);
        transition: transform 0.18s ease;
      }
      .vswitch__track--on .vswitch__knob {
        transform: translateX(16px);
      }

      /* ----- Bottom nav (móvil, vista nueva) ----- */
      .botnav {
        display: none;
      }

      /* ----- Responsive ----- */
      @media (max-width: 980px) {
        .hdr__inner {
          padding: 12px 16px 8px;
          gap: 10px;
        }
        .brand__logo {
          display: none;
        }
        .brand__iso {
          display: block;
        }
        .brand__sub {
          display: none;
        }
        .searchpill__seg {
          display: none;
        }
        .searchpill__div {
          display: none;
        }
        .searchpill__seg--muted {
          display: block;
        }
        .searchpill {
          padding-left: 16px;
        }
        .hdr__link {
          display: none;
        }
        .cats__inner {
          justify-content: flex-start;
          padding: 0 12px;
        }
        .cats--new .cats__inner {
          justify-content: flex-start;
        }
        .vswitch__label {
          display: none;
        }
        .vswitch {
          padding: 6px;
        }
        /* Acciones en móvil: solo icono para no desbordar el header */
        .hdr__actions-l {
          display: none;
        }
        .hdr__actions .btn {
          padding: 9px 11px;
        }
        /* Contexto: en móvil, chip compacto */
        .ctxpill {
          padding: 7px 12px;
          font-size: 12px;
        }
      }
      @media (max-width: 560px) {
        .ctxpill {
          display: none;
        }
      }

      /* ----- Móvil (vista nueva): header comprimido + bottom nav ----- */
      @media (max-width: 720px) {
        /* Comprimir header: fuera contexto y carrito; buscador queda como icono */
        .hdr__inner--new .ctxpill {
          display: none;
        }
        .hdr__inner--new .hdr__iconbtn--cart {
          display: none;
        }

        /* Acciones compactas: "Pedido" (primario) · "＋" (secundario) */
        .hdr__actions-s {
          display: inline;
        }
        .hdr__inc app-icon {
          display: none;
        }
        .hdr__inc .hdr__actions-plus {
          display: inline;
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
        }
        .hdr__actions .btn {
          padding: 10px 14px;
        }

        /* Objetivos táctiles ≥ 44px */
        .hdr__iconbtn {
          min-width: 44px;
          min-height: 44px;
          justify-content: center;
        }

        /* Con Yana activa, en móvil ella toma el lugar del buscador: el header
           compacto no tiene sitio para ambos y la asistente es la prioridad
           de la demo (la búsqueda sigue disponible en desktop). */
        .hdr__right:has(.asis--header) .hdr__iconbtn--search {
          display: none;
        }

        /* La fila de tabs superior se reemplaza por el bottom nav */
        .cats--new {
          display: none;
        }

        /* Bottom nav fijo, alcanzable con el pulgar */
        .botnav {
          display: flex;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 55;
          background: var(--surface);
          border-top: 1px solid var(--line);
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.12);
        }
        .botnav__i {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          min-height: 56px;
          padding: 8px 2px 7px;
          color: var(--ink-2);
          font-size: 10.5px;
          font-weight: 600;
          text-align: center;
        }
        .botnav__i span {
          line-height: 1;
        }
        .botnav__i--active {
          color: var(--brand-600);
        }
      }
    `,
  ],
})
export class App implements OnInit {
  protected readonly cats = CATS;
  protected readonly newCats = NEW_CATS;
  protected readonly menuLinks = MENU_LINKS;
  protected readonly menuOpen = signal(false);
  protected readonly entered = signal(false);
  protected readonly theme = inject(ThemeService);
  protected readonly version = inject(VersionService);
  protected readonly acceso = inject(AccesoService);
  protected readonly audiencia = inject(AudienciaService);
  protected readonly estatusSrv = inject(EstatusService);
  protected readonly estatusDirSrv = inject(EstatusDirService);
  private readonly router = inject(Router);

  /** Vista con el header/nav moderno (la nueva beta). */
  protected readonly moderna = computed(() => this.version.nueva());
  /** Audiencia encarnada en la vista nueva: Emprendedora (CNS→ASP) o Directora. */
  protected readonly esEmp = computed(
    () => this.version.nueva() && this.audiencia.tipo() === 'emprendedora',
  );
  /** Nav activa. En la vista nueva las secciones dependen del estatus encarnado:
   *  Emprendedora: "Mi grupo" desde CES, "Incorpora y Gana" desde CEM.
   *  Directora: "Mi equipo" existe desde SNR (JNR aún no tiene hijas). */
  protected readonly activeCats = computed<Cat[]>(() => {
    if (!this.version.nueva()) return CATS;
    if (this.audiencia.tipo() === 'bdm') return BDM_CATS;
    if (this.esEmp()) {
      const cap = PERFILES[this.estatusSrv.estatus()].capacidades;
      return EMP_CATS.filter(
        (c) =>
          (c.route !== '/n/grupo' || cap.grupo) && (c.route !== '/n/incorpora' || cap.incorpora),
      );
    }
    const cap = PERFILES_DIR[this.estatusDirSrv.estatus()].capacidades;
    return NEW_CATS.filter((c) => c.route !== '/n/equipo' || cap.equipo);
  });
  /** Identidad mostrada en el shell, con el rol del estatus encarnado. */
  protected readonly u = computed(() => {
    if (this.version.nueva() && this.audiencia.tipo() === 'bdm') {
      return { ...USUARIA_BDM, rol: PERFIL_BDM.nombreNivel };
    }
    if (this.esEmp()) {
      return { ...USUARIA_CES, rol: PERFILES[this.estatusSrv.estatus()].nombreNivel };
    }
    if (this.version.nueva()) {
      return { ...USUARIA, rol: PERFILES_DIR[this.estatusDirSrv.estatus()].nombreNivel };
    }
    return USUARIA;
  });

  /** Rol corto del pill de contexto (CNS…REG o BDM). */
  protected readonly rolCorto = computed(() => {
    switch (this.audiencia.tipo()) {
      case 'bdm':
        return 'BDM';
      case 'emprendedora':
        return this.estatusSrv.estatus();
      default:
        return this.estatusDirSrv.estatus();
    }
  });
  protected readonly homeRoute = computed(() => (this.version.nueva() ? '/n/inicio' : '/inicio'));

  /** URL actual como signal (reacciona a cada navegación). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Niveles del breadcrumb (después de home). Vacío = sin breadcrumb: home
   *  (ya estás ahí) y el styleguide /ui. Cada vista es un solo nivel bajo home. */
  protected readonly migas = computed<Miga[]>(() => {
    const path = (this.url().split(/[?#]/)[0] || '/').replace(/\/$/, '') || '/';
    if (path === '/' || path === '/inicio' || path === '/n/inicio' || path.startsWith('/ui')) {
      return [];
    }
    if (path.startsWith('/externa/')) {
      const slug = path.slice('/externa/'.length);
      return [{ label: EXTERNA_LABELS[slug] ?? 'Aplicación externa' }];
    }
    const label = ROUTE_LABELS[path];
    return label ? [{ label }] : [];
  });

  ngOnInit(): void {
    // Sincroniza la ruta con la versión persistida al cargar (sin recarga brusca).
    // Usamos location.pathname (fiable durante el bootstrap con rutas lazy, donde
    // router.url aún puede ser '/'), así un deep-link a /n/<vista> se respeta.
    const path = typeof location !== 'undefined' ? location.pathname : '';
    // Rutas neutrales (fuera de ambas versiones): no se sincronizan.
    if (path.includes('/ui') || path.includes('/externa/')) return;
    const onNew = path.includes('/n/') || path.includes('/e/');
    if (this.version.nueva() && !onNew) {
      this.router.navigateByUrl('/n/inicio');
    } else if (!this.version.nueva() && onNew) {
      // Un deep-link a la vista nueva activa la versión nueva en vez de expulsar.
      this.version.set(true);
    }
  }

  protected toggleVersion(): void {
    const nueva = this.version.toggle();
    this.menuOpen.set(false);
    this.router.navigateByUrl(nueva ? '/n/inicio' : '/inicio');
  }
}
