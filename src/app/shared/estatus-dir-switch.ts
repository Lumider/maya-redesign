import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ESTATUS_DIR_ORDEN, PERFILES_DIR } from '../data/mock-dir';
import { EstatusDirService } from './estatus';

/**
 * Conmutador de estatus de la vista Líder (demo): encarna a la Directora en
 * cada etapa (JNR → SNR → SSE → REG) para ver qué le cambia la app. Mismo
 * patrón visual que el conmutador de la vista Emprendedora.
 */
@Component({
  selector: 'app-estatus-dir-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (abierto()) {
      <div class="sw card" role="group" aria-label="Cambiar estatus (demo)">
        <div class="sw__top">
          <span class="sw__title">Ver como <span class="sw__beta">demo</span></span>
          <button class="sw__min" (click)="abierto.set(false)" aria-label="Minimizar conmutador">
            –
          </button>
        </div>
        <div class="sw__chips">
          @for (e of orden; track e) {
            <button
              class="sw__chip"
              [class.sw__chip--on]="srv.estatus() === e"
              (click)="srv.set(e)"
              [attr.aria-pressed]="srv.estatus() === e"
            >
              {{ e }}
            </button>
          }
        </div>
        <p class="sw__desc">{{ perfil().nombreNivel }} — {{ perfil().resumen }}</p>
      </div>
    } @else {
      <button
        class="sw-mini card"
        (click)="abierto.set(true)"
        aria-label="Abrir conmutador de estatus"
      >
        👤 {{ srv.estatus() }}
      </button>
    }
  `,
  styles: [
    `
      .sw {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 70;
        width: 230px;
        padding: 12px 14px;
        box-shadow: var(--shadow-l);
      }
      .sw__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sw__title {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .sw__beta {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: var(--brand-100);
        color: var(--brand-700);
        padding: 1px 5px;
        border-radius: 99px;
      }
      .sw__min {
        border: 0;
        background: none;
        color: var(--ink-2);
        font-size: 16px;
        line-height: 1;
        padding: 2px 8px;
        border-radius: var(--radius-s);
      }
      .sw__min:hover {
        background: var(--sand);
      }
      .sw__chips {
        display: flex;
        gap: 6px;
        margin: 10px 0 8px;
      }
      .sw__chip {
        flex: 1;
        padding: 7px 0;
        border-radius: var(--radius-s);
        font-size: 12px;
        font-weight: 800;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .sw__chip:hover {
        border-color: var(--ink);
        color: var(--ink);
      }
      .sw__chip--on {
        background: var(--brand-grad-strong);
        border-color: transparent;
        color: #fff;
      }
      .sw__desc {
        margin: 0;
        font-size: 11.5px;
        color: var(--ink-3);
        line-height: 1.4;
      }

      .sw-mini {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 70;
        padding: 9px 14px;
        font-size: 12.5px;
        font-weight: 800;
        border-radius: 99px;
        box-shadow: var(--shadow);
        color: var(--ink);
      }

      /* Móvil: por encima del bottom-nav fijo */
      @media (max-width: 720px) {
        .sw,
        .sw-mini {
          bottom: calc(72px + env(safe-area-inset-bottom));
        }
      }
    `,
  ],
})
export class EstatusDirSwitch {
  protected readonly srv = inject(EstatusDirService);
  protected readonly orden = ESTATUS_DIR_ORDEN;
  protected readonly abierto = signal(true);
  protected readonly perfil = computed(() => PERFILES_DIR[this.srv.estatus()]);
}
