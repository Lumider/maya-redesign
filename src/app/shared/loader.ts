import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

// Pool completo de imágenes; en cada carga se eligen `count` al azar.
const DEFAULT_IMAGES = [
  'loader/01.jpg', 'loader/02.jpg', 'loader/03.jpg', 'loader/04.jpg',
  'loader/05.jpg', 'loader/06.jpg', 'loader/07.jpg', 'loader/08.jpg',
  'loader/09.jpg', 'loader/10.jpg', 'loader/11.jpg', 'loader/12.jpg',
];

/**
 * Loader de entrada estilo OUTFIT/hellohello adaptado a Maya · Yanbal.
 *
 * Idea (según el video de referencia): una PILA de imágenes (baraja) detrás del
 * wordmark. Cada imagen entra "desde pequeño con profundidad" — escala 0→1 con
 * rotación y offset, mientras las anteriores quedan detrás (depth). A la derecha
 * del wordmark, un contador de 3 dígitos que refleja la precarga real de assets.
 *
 * Reutilizable: `images`, `word`, `minMs`, `maxMs` por input; emite `complete`.
 */
@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ld"
      [class.ld--out]="leaving()"
      [attr.aria-hidden]="leaving() ? 'true' : null"
      role="status"
      aria-live="polite"
      [attr.aria-label]="'Cargando Maya, ' + progress() + ' por ciento'"
    >
      <div class="ld__top">
        <svg class="ld__iso" viewBox="51 52.5 58 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M51.4287 53.3195H62.8272L84.409 83.7679V107.143H75.1397L75.2902 86.1511L51.4287 53.3195ZM87.7479 81.4608C87.2909 79.6163 87.065 77.614 87.065 75.6171C87.065 63.7773 94.5869 52.8571 106.292 52.8571C106.975 52.8571 108.19 52.9332 108.572 53.0094L87.7532 81.4608H87.7479Z" fill="currentColor"/>
        </svg>
        <span class="ld__by">por Yanbal</span>
      </div>

      <div class="ld__stage">
        <!-- Pila de imágenes (baraja) que aparecen desde pequeño con profundidad -->
        <div class="ld__deck" aria-hidden="true">
          @for (src of deck(); track src; let i = $index) {
            <div
              class="ld__card"
              [style.transform]="cardTransform(i)"
              [style.opacity]="cardOpacity(i)"
              [style.zIndex]="cardZ(i)"
            >
              <img [src]="src" alt="" loading="eager" decoding="async" />
            </div>
          }
        </div>

        <!-- Wordmark en frente; las imágenes asoman alrededor -->
        <h1 class="ld__word">{{ word() }}</h1>
        <span class="ld__count" aria-hidden="true">{{ pad(progress()) }}</span>
      </div>

      <div class="ld__bottom">
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
          radial-gradient(1100px 520px at 50% 14%, rgba(220, 88, 42, 0.2), transparent 70%),
          #0c0a09;
        color: #f6f3f0;
        font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
        overflow: hidden;
        transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.7, 0, 0.3, 1);
      }
      .ld--out { opacity: 0; transform: scale(1.05); pointer-events: none; }

      .ld__top { display: flex; align-items: center; gap: 10px; padding: 22px 26px; }
      .ld__iso { height: 26px; width: auto; color: #f6f3f0; }
      .ld__by { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8c8378; }

      .ld__stage { position: relative; display: grid; place-items: center; }

      /* Baraja */
      .ld__deck {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
      }
      .ld__card {
        position: absolute;
        left: 50%;
        top: 50%;
        width: clamp(160px, 30vw, 260px);
        aspect-ratio: 9 / 12;
        margin-left: calc(clamp(160px, 30vw, 260px) / -2);
        margin-top: calc(clamp(160px, 30vw, 260px) * 12 / 9 / -2);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        transform-origin: center center;
        will-change: transform, opacity;
        transition:
          transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
          opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .ld__card img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .ld__word {
        position: relative;
        z-index: 50;
        margin: 0;
        font-size: clamp(88px, 21vw, 230px);
        font-weight: 800;
        letter-spacing: -0.045em;
        line-height: 1;
        color: #f6f3f0;
        user-select: none;
        pointer-events: none;
        text-shadow: 0 2px 40px rgba(0, 0, 0, 0.35);
      }
      .ld__count {
        position: absolute;
        z-index: 60;
        top: calc(50% - clamp(150px, 19vw, 230px));
        right: max(7%, calc(50% - 250px));
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.1em;
        font-variant-numeric: tabular-nums;
        color: var(--brand-400, #ff6f3c);
      }

      .ld__bottom { display: flex; justify-content: center; padding: 0 26px 40px; }
      .ld__hint { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #8c8378; }

      @media (prefers-reduced-motion: reduce) {
        .ld { transition: opacity 0.3s ease; }
        .ld--out { transform: none; }
        .ld__card { transition: opacity 0.3s ease; }
      }
    `,
  ],
})
export class Loader implements OnInit, OnDestroy {
  /** Pool de URLs disponibles; se eligen `count` al azar en cada carga. */
  readonly images = input<string[]>(DEFAULT_IMAGES);
  /** Cuántas imágenes mostrar (seleccionadas aleatoriamente del pool). */
  readonly count = input(7);
  /** Texto del wordmark central. */
  readonly word = input('maya');
  /** Tiempo mínimo visible (ms) — evita parpadeos si carga al instante. */
  readonly minMs = input(1700);
  /** Tiempo máximo (ms) — nunca se queda colgado si una imagen falla. */
  readonly maxMs = input(6000);

  /** Se emite cuando termina la animación de salida. */
  readonly done = output<void>();

  protected readonly progress = signal(0);
  protected readonly leaving = signal(false);
  /** Selección aleatoria de `count` imágenes del pool (fija durante esta carga). */
  protected readonly deck = signal<string[]>([]);

  /** Índice de la carta "al frente"; avanza con el progreso. */
  protected readonly top = computed(() => {
    const n = this.deck().length;
    return Math.round((this.progress() / 100) * (n - 1));
  });

  private readonly doc = inject(DOCUMENT);
  private readonly reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rotación/offset deterministas por carta → baraja "desordenada" pero estable
  private readonly rot: number[] = [];
  private readonly offX: number[] = [];
  private readonly offY: number[] = [];

  private progressRaw = 0;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Baraja aleatoria del pool y toma las primeras `count` (Fisher-Yates)
    const pool = [...this.images()];
    for (let k = pool.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [pool[k], pool[j]] = [pool[j], pool[k]];
    }
    const imgs = pool.slice(0, Math.min(this.count(), pool.length));
    this.deck.set(imgs);

    imgs.forEach((_, i) => {
      this.rot[i] = ((i * 37) % 13) - 6; // -6..6 grados
      this.offX[i] = ((i * 53) % 28) - 14; // -14..14 px
      this.offY[i] = ((i * 29) % 22) - 11; // -11..11 px
    });

    // Precarga real de assets → alimenta el contador
    const total = imgs.length || 1;
    let loaded = 0;
    imgs.forEach((src) => {
      const im = new Image();
      let settled = false;
      const onSettle = () => {
        if (settled) return;
        settled = true;
        loaded += 1;
      };
      im.onload = onSettle;
      im.onerror = onSettle;
      im.src = src;
      // Si ya estaba en caché, `complete` es true y onload no se dispara
      if (im.complete) onSettle();
    });

    // Usamos setInterval (no requestAnimationFrame) para que el progreso avance
    // y complete aunque la pestaña esté en segundo plano.
    const start = Date.now();
    this.timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const loadFrac = loaded / total;
      const timeFrac = Math.min(1, elapsed / this.minMs());
      const finished = (loadFrac >= 1 && elapsed >= this.minMs()) || elapsed >= this.maxMs();
      const target = finished ? 100 : Math.min(loadFrac, timeFrac) * 100;

      // Suavizado hacia el objetivo
      this.progressRaw += (target - this.progressRaw) * 0.14;
      if (target === 100 && 100 - this.progressRaw < 0.5) this.progressRaw = 100;
      this.progress.set(Math.round(this.progressRaw));

      if (this.progressRaw >= 100) this.finish();
    }, 40);
  }

  /** Transform de cada carta según su distancia a la del frente (profundidad). */
  protected cardTransform(i: number): string {
    const d = this.top() - i;
    if (this.reduced) {
      return d === 0 ? 'translate(-0px,0) scale(1)' : 'scale(0.96)';
    }
    if (d < 0) {
      // Aún no revelada: aparece desde pequeño
      return `translate(0, 16px) scale(0.55) rotate(${this.rot[i] ?? 0}deg)`;
    }
    if (d === 0) {
      // Al frente: nítida y centrada
      return 'translate(0, 0) scale(1) rotate(0deg)';
    }
    // Detrás: retrocede con rotación y offset → profundidad de baraja
    const scale = Math.max(0.7, 1 - d * 0.06);
    const tx = (this.offX[i] ?? 0) * d * 0.6;
    const ty = -d * 9 + (this.offY[i] ?? 0) * 0.3;
    return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${(this.rot[i] ?? 0) * 0.7}deg)`;
  }

  protected cardOpacity(i: number): number {
    const d = this.top() - i;
    if (this.reduced) return d === 0 ? 1 : 0;
    if (d < 0) return 0; // futura
    if (d > 3) return 0; // tapada por las de adelante
    return 1 - d * 0.16;
  }

  protected cardZ(i: number): number {
    const d = this.top() - i;
    return 40 - Math.abs(d);
  }

  private finish(): void {
    if (this.timer) clearInterval(this.timer);
    this.doc.documentElement.classList.add('loaded');
    setTimeout(() => {
      this.leaving.set(true);
      setTimeout(() => this.done.emit(), 700);
    }, 260);
  }

  protected pad(n: number): string {
    return String(Math.min(100, Math.max(0, n))).padStart(3, '0');
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
