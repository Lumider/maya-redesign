import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AccesoService } from './acceso';

/**
 * Puerta de acceso a la demo: pantalla completa que cubre la app hasta
 * ingresar la clave correcta. Estética alineada al login real de Maya
 * ("Con Maya logras más"): superficie limpia, foco en un solo campo.
 */
@Component({
  selector: 'app-acceso-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gate" role="dialog" aria-modal="true" aria-labelledby="gate-titulo">
      <div class="gate__card card">
        <!-- Isotipo Yanbal -->
        <svg
          class="gate__iso"
          viewBox="51 52.5 58 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M51.4287 53.3195H62.8272L84.409 83.7679V107.143H75.1397L75.2902 86.1511L51.4287 53.3195ZM87.7479 81.4608C87.2909 79.6163 87.065 77.614 87.065 75.6171C87.065 63.7773 94.5869 52.8571 106.292 52.8571C106.975 52.8571 108.19 52.9332 108.572 53.0094L87.7532 81.4608H87.7479Z"
            fill="currentColor"
          />
        </svg>
        <h1 id="gate-titulo" class="gate__t">Demo privada</h1>
        <p class="gate__sub">
          Maya Redesign · prototipo con datos ficticios.<br />Ingresa la clave que te compartieron.
        </p>

        <form class="gate__form" (submit)="enviar($event)">
          <input
            class="gate__input"
            type="password"
            name="clave"
            [value]="clave()"
            (input)="clave.set($any($event.target).value); error.set(false)"
            placeholder="Clave de acceso"
            aria-label="Clave de acceso"
            autocomplete="off"
            autofocus
          />
          <button class="btn btn--primary gate__btn" type="submit" [disabled]="verificando()">
            {{ verificando() ? 'Verificando…' : 'Entrar' }}
          </button>
        </form>

        @if (error()) {
          <p class="gate__error" role="alert">Clave incorrecta — inténtalo de nuevo.</p>
        }
      </div>
      <span class="gate__foot tiny"
        >© 2026 · Prototipo interno — no es la plataforma oficial de Yanbal</span
      >
    </div>
  `,
  styles: [
    `
      .gate {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 18px;
        padding: 20px;
        background: var(--bg);
      }
      .gate__card {
        width: min(380px, 100%);
        padding: 34px 30px 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: var(--shadow);
      }
      .gate__iso {
        height: 40px;
        width: auto;
        color: var(--brand-500);
        margin-bottom: 14px;
      }
      .gate__t {
        font-size: 22px;
      }
      .gate__sub {
        margin: 6px 0 20px;
        font-size: 13.5px;
        color: var(--ink-2);
        line-height: 1.5;
      }
      .gate__form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .gate__input {
        width: 100%;
        padding: 12px 14px;
        font: inherit;
        color: var(--ink);
        background: var(--surface);
        border: 1.5px solid var(--line-strong);
        border-radius: var(--radius-s);
        transition: border-color 0.15s ease;
      }
      .gate__input:focus {
        outline: none;
        border-color: var(--brand-500);
      }
      .gate__btn {
        width: 100%;
      }
      .gate__btn[disabled] {
        opacity: 0.6;
        cursor: wait;
      }
      .gate__error {
        margin: 12px 0 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--danger);
      }
      .gate__foot {
        text-align: center;
      }
    `,
  ],
})
export class AccesoGate {
  private readonly acceso = inject(AccesoService);

  protected readonly clave = signal('');
  protected readonly error = signal(false);
  protected readonly verificando = signal(false);

  protected async enviar(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.clave() || this.verificando()) return;
    this.verificando.set(true);
    const ok = await this.acceso.entrar(this.clave());
    this.verificando.set(false);
    if (!ok) {
      this.error.set(true);
      this.clave.set('');
    }
  }
}
