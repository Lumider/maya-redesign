import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Icon3d } from './icon3d';

/**
 * Loader de entrada (estilo OUTFIT/hellohello adaptado a Maya · Yanbal).
 * Pantalla near-black con wordmark gigante, una ventana de ilustraciones 3D que
 * cambian rápido, y un contador 000→100. Al completar emite `done`.
 *
 * Integración: en el shell se muestra mientras `!entered`. Hoy el progreso es
 * temporizado (demo); para producción puede atarse a la carga real de la ruta.
 */
@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon3d],
  template: `
    <div class="ld" [class.ld--out]="leaving()" role="status" aria-live="polite" aria-label="Cargando Maya">
      <div class="ld__top">
        <svg class="ld__iso" viewBox="51 52.5 58 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M51.4287 53.3195H62.8272L84.409 83.7679V107.143H75.1397L75.2902 86.1511L51.4287 53.3195ZM87.7479 81.4608C87.2909 79.6163 87.065 77.614 87.065 75.6171C87.065 63.7773 94.5869 52.8571 106.292 52.8571C106.975 52.8571 108.19 52.9332 108.572 53.0094L87.7532 81.4608H87.7479Z" fill="currentColor"/>
        </svg>
        <span class="ld__by">por Yanbal</span>
      </div>

      <div class="ld__stage">
        <span class="ld__count">{{ pad(progress()) }}</span>
        <div class="ld__window" aria-hidden="true">
          @for (ic of icons; track ic; let i = $index) {
            <app-icon3d class="ld__ic" [class.ld__ic--on]="i === iconIdx()" [name]="ic" [size]="132" />
          }
        </div>
        <h1 class="ld__word">maya</h1>
      </div>

      <div class="ld__bottom">
        <div class="ld__bar"><span class="ld__fill" [style.width.%]="progress()"></span></div>
        <span class="ld__hint">Cargando tu negocio…</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host { position: fixed; inset: 0; z-index: 1000; }
      .ld {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-rows: auto 1fr auto;
        background:
          radial-gradient(1100px 520px at 50% 12%, rgba(220, 88, 42, 0.22), transparent 70%),
          #100d0b;
        color: #f6f3f0;
        font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
        overflow: hidden;
        transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
      }
      .ld--out { opacity: 0; transform: scale(1.04); pointer-events: none; }

      /* Top */
      .ld__top {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 22px 26px;
      }
      .ld__iso { height: 26px; width: auto; color: #f6f3f0; }
      .ld__by { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8c8378; }

      /* Stage central */
      .ld__stage {
        position: relative;
        display: grid;
        place-items: center;
      }
      .ld__count {
        position: absolute;
        top: calc(50% - 130px);
        right: max(8%, calc(50% - 230px));
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.1em;
        font-variant-numeric: tabular-nums;
        color: var(--brand-400, #ff6f3c);
      }
      .ld__window {
        position: absolute;
        width: 168px;
        height: 208px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: linear-gradient(150deg, #ff7a3d, #d94e15 55%, #b8400c);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
        overflow: hidden;
        animation: ld-float 3.2s ease-in-out infinite;
      }
      .ld__ic {
        position: absolute;
        opacity: 0;
        transform: scale(0.8) rotate(-6deg);
        transition: opacity 0.18s ease, transform 0.18s ease;
        filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.35));
      }
      .ld__ic--on { opacity: 1; transform: scale(1) rotate(0); }

      .ld__word {
        position: relative;
        z-index: 2;
        margin: 0;
        font-size: clamp(96px, 22vw, 240px);
        font-weight: 800;
        letter-spacing: -0.04em;
        line-height: 1;
        color: #f6f3f0;
        mix-blend-mode: normal;
        user-select: none;
      }

      /* Bottom */
      .ld__bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 0 26px 40px;
      }
      .ld__bar {
        width: min(420px, 70vw);
        height: 3px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }
      .ld__fill {
        display: block;
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, #ff7a3d, #dc582a);
        transition: width 0.09s linear;
      }
      .ld__hint { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #8c8378; }

      @keyframes ld-float {
        0%, 100% { transform: translateY(-6px); }
        50% { transform: translateY(6px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ld__window { animation: none; }
        .ld__ic { transition: opacity 0.12s ease; transform: none; }
        .ld__ic--on { transform: none; }
        .ld { transition: opacity 0.3s ease; }
        .ld--out { transform: none; }
      }
    `,
  ],
})
export class Loader implements OnInit, OnDestroy {
  /** Se emite cuando termina la animación de salida. */
  readonly done = output<void>();

  protected readonly progress = signal(0);
  protected readonly iconIdx = signal(0);
  protected readonly leaving = signal(false);
  protected readonly icons = ['bag', 'gift', 'rocket', 'chart', 'heart', 'plane', 'cap'];

  private progressTimer?: ReturnType<typeof setTimeout>;
  private iconTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const reduced =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.iconTimer = setInterval(
      () => this.iconIdx.set((this.iconIdx() + 1) % this.icons.length),
      reduced ? 380 : 135,
    );

    const tick = (): void => {
      const p = this.progress();
      if (p >= 100) {
        this.finish();
        return;
      }
      // Avanza más rápido al inicio y desacelera cerca del 100 (sensación de carga real)
      const inc = Math.max(1, Math.round((100 - p) / 14));
      this.progress.set(Math.min(100, p + inc));
      this.progressTimer = setTimeout(tick, reduced ? 55 : 95);
    };
    this.progressTimer = setTimeout(tick, 250);
  }

  private finish(): void {
    if (this.iconTimer) clearInterval(this.iconTimer);
    // Pausa breve en 100 antes de salir
    setTimeout(() => {
      this.leaving.set(true);
      setTimeout(() => this.done.emit(), 700);
    }, 280);
  }

  protected pad(n: number): string {
    return String(n).padStart(3, '0');
  }

  ngOnDestroy(): void {
    if (this.progressTimer) clearTimeout(this.progressTimer);
    if (this.iconTimer) clearInterval(this.iconTimer);
  }
}
