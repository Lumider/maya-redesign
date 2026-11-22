import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Icon } from '../shared/icon';
import { ThemeService } from '../shared/theme';

/**
 * Marco del microsite /sim: columna mobile-first (hasta 440px) con header
 * propio (logotipo + etiqueta del simulador) y zona sticky inferior para las
 * CTAs persistentes. Vive FUERA del shell de Maya: sin nav, sin breadcrumb —
 * la etiqueta del header deja claro que esto es un simulador, no la app.
 */
@Component({
  selector: 'app-sim-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="sim">
      <div class="sim__col">
        <header class="sim__top">
          <!-- Logotipo Yanbal (mismo trazo que el shell de Maya) -->
          <svg
            class="sim__logo"
            viewBox="21 53 321 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Yanbal"
          >
            <path
              d="M64.02 53.7839H74.3706L52.104 85.7722V106.221H43.4543L43.5948 85.7722L21.3333 53.7839H31.9698L47.9949 77.3816L64.02 53.7839ZM99.1909 53.3334L125.215 106.216H115.286L110.465 95.806H86.6377L81.8162 106.216H72.173L98.1925 53.3334H99.1909ZM106.636 87.5638L98.624 70.4115H98.4835L90.4709 87.5638H106.636ZM168.891 53.7839H177.54V106.667H176.406L145.706 73.4805V106.216H137.056V53.3334H138.19L168.891 86.5196V53.7839ZM235.329 91.3854C235.329 100.227 228.877 106.216 218.1 106.216H199.024V53.7839H217.176C226.89 53.7839 233.698 58.8777 233.698 67.7188C233.698 73.0352 230.864 76.7827 226.609 78.9558C232.068 81.129 235.329 85.3959 235.329 91.3907V91.3854ZM207.323 61.5703V75.2031H216.825C221.436 75.2031 224.697 73.4063 224.697 68.3867C224.697 63.3672 221.436 61.5703 216.825 61.5703H207.323ZM217.462 98.4245C223.277 98.4245 226.398 96.1029 226.398 90.8607C226.398 85.6185 223.277 83.2969 217.462 83.2969H207.323V98.4298H217.462V98.4245ZM270.214 53.3334H271.207L297.232 106.216H287.303L282.481 95.806H258.659L253.838 106.216H244.194L270.214 53.3334ZM278.653 87.5638L270.64 70.4115H270.5L262.487 87.5638H278.653ZM319.709 97.6771H341.333L338.213 106.216H311.054V53.7839H319.704V97.6824L319.709 97.6771Z"
              fill="currentColor"
            />
          </svg>
          <span class="sim__tag" [class.sim__tag--teal]="tono() === 'teal'">{{ tag() }}</span>
          <button
            class="sim__theme"
            (click)="theme.toggle()"
            [attr.aria-label]="
              theme.theme() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
            "
            [attr.aria-pressed]="theme.theme() === 'dark'"
          >
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="16" />
          </button>
        </header>

        <div class="sim__wrap">
          <ng-content />
        </div>
      </div>

      <div class="sim__sticky">
        <ng-content select="[simSticky]" />
      </div>
    </div>
  `,
  styles: [
    `
      .sim {
        min-height: 100dvh;
        background: var(--sand);
        display: flex;
        justify-content: center;
      }
      .sim__col {
        width: 100%;
        max-width: 440px;
        background: var(--bg);
        min-height: 100dvh;
        /* Aire para que la zona sticky no tape el final del contenido */
        padding-bottom: 170px;
      }
      @media (min-width: 441px) {
        .sim__col {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
        }
      }

      .sim__top {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
      }
      .sim__logo {
        height: 15px;
        width: auto;
        color: var(--ink);
        flex-shrink: 0;
      }
      .sim__tag {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: var(--brand-100);
        color: var(--brand-700);
        border-radius: 99px;
        padding: 4px 10px;
        white-space: nowrap;
      }
      .sim__tag--teal {
        background: var(--teal-bg);
        color: var(--teal);
      }
      .sim__theme {
        margin-left: auto;
        display: grid;
        place-items: center;
        min-width: 36px;
        min-height: 36px;
        border: 0;
        border-radius: 99px;
        background: none;
        color: var(--ink-2);
      }
      .sim__theme:hover {
        background: var(--sand);
      }

      .sim__wrap {
        padding: 20px;
      }

      .sim__sticky {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 440px;
        background: var(--surface);
        border-top: 1px solid var(--line);
        padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
        box-shadow: var(--shadow-l);
        z-index: 20;
      }
    `,
  ],
})
export class SimShell {
  /** Etiqueta del header: "Simulador de carrera" / "Simulador de formación". */
  readonly tag = input.required<string>();
  /** Tono de la etiqueta: naranja (carrera) o teal (formación). */
  readonly tono = input<'brand' | 'teal'>('brand');

  protected readonly theme = inject(ThemeService);
}
