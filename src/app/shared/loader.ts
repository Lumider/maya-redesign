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
              [style.transitionDelay]="cardDelay(i)"
            >
              <img [src]="src" alt="" loading="eager" decoding="async" />
            </div>
          }
        </div>

        <!-- Wordmark "Maya" en frente; el blend deja ver las imágenes a través de las letras -->
        <h1 class="ld__word" aria-label="Maya">
          <svg viewBox="0 0 246.75 91.68" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path class="ld__ltr" style="--i: 3" d="M206.858 73.0985C198.953 73.0985 193.819 67.8625 193.819 61.5998C193.819 54.7211 199.877 48.4585 219.691 40.7585L227.699 37.6785C227.391 24.7425 224.619 20.4305 217.741 20.4305C214.866 20.4305 212.71 21.4571 211.17 23.2025C208.398 25.9745 207.166 30.4918 205.729 33.0585C204.805 34.9065 203.367 35.7278 199.979 35.7278C196.591 35.7278 194.949 34.2905 194.949 32.5451C194.949 30.7998 196.283 28.5411 199.055 26.6931C203.675 23.5105 212.505 19.6091 219.486 19.6091C230.369 19.6091 237.863 24.7425 237.863 38.1918C237.863 44.7625 237.247 55.6451 237.247 60.2651C237.247 65.7065 237.863 68.3758 239.917 68.3758C241.765 68.3758 244.229 64.8851 245.358 62.3185C245.871 61.4971 247.206 62.2158 246.59 63.1398C245.05 65.5011 238.582 72.9958 233.141 72.9958C228.726 72.9958 226.673 70.4291 226.673 64.9878C226.673 62.6265 226.775 59.5465 226.981 57.6985C224.619 62.6265 216.098 73.0985 206.858 73.0985ZM203.573 57.8011C203.573 63.0371 207.679 67.2465 213.531 67.3491C219.999 67.3491 225.851 59.2385 227.083 55.6451C227.186 53.4891 227.699 47.5345 227.699 39.7318V38.3971L219.897 41.7851C207.474 47.0211 203.573 50.7171 203.573 57.8011Z" fill="currentColor"/>
            <path class="ld__ltr" style="--i: 2" d="M143.862 91.6813C138.01 91.6813 134.725 89.4226 134.725 87.5746C134.725 85.8293 138.318 80.9013 141.398 80.9013C145.094 80.9013 147.969 84.084 152.178 84.084C156.696 84.084 159.981 82.6466 163.985 73.7146L165.114 71.148L148.79 35.0093C143.041 22.484 141.706 21.4573 136.676 21.56C135.957 21.56 135.957 20.636 136.676 20.636C137.497 20.636 145.402 20.8413 146.942 20.8413C148.38 20.8413 157.722 20.636 160.494 20.636C161.316 20.636 161.316 21.56 160.494 21.56C157.312 21.56 155.669 21.868 155.361 23.6133C155.053 25.0507 155.977 27.6173 157.928 31.9293L170.248 59.444L180.514 36.344C184.826 26.488 182.362 21.56 175.792 21.56C174.97 21.56 174.97 20.636 175.792 20.636C178.666 20.636 184.005 20.8413 185.442 20.8413C186.982 20.8413 193.861 20.636 194.682 20.636C195.401 20.636 195.401 21.56 194.682 21.56C189.857 21.4573 185.75 27.104 181.438 36.96L165.012 73.92C159.468 86.4453 152.897 91.6813 143.862 91.6813Z" fill="currentColor"/>
            <path class="ld__ltr" style="--i: 1" d="M102.928 73.0985C95.023 73.0985 89.8896 67.8625 89.8896 61.5998C89.8896 54.7211 95.947 48.4585 115.762 40.7585L123.77 37.6785C123.462 24.7425 120.69 20.4305 113.811 20.4305C110.936 20.4305 108.78 21.4571 107.24 23.2025C104.468 25.9745 103.236 30.4918 101.799 33.0585C100.875 34.9065 99.4377 35.7278 96.0497 35.7278C92.6617 35.7278 91.019 34.2905 91.019 32.5451C91.019 30.7998 92.3536 28.5411 95.1256 26.6931C99.7456 23.5105 108.575 19.6091 115.556 19.6091C126.439 19.6091 133.934 24.7425 133.934 38.1918C133.934 44.7625 133.318 55.6451 133.318 60.2651C133.318 65.7065 133.934 68.3758 135.987 68.3758C137.835 68.3758 140.299 64.8851 141.428 62.3185C141.942 61.4971 143.276 62.2158 142.66 63.1398C141.12 65.5011 134.652 72.9958 129.211 72.9958C124.796 72.9958 122.743 70.4291 122.743 64.9878C122.743 62.6265 122.846 59.5465 123.051 57.6985C120.69 62.6265 112.168 73.0985 102.928 73.0985ZM99.643 57.8011C99.643 63.0371 103.75 67.2465 109.602 67.3491C116.07 67.3491 121.922 59.2385 123.154 55.6451C123.256 53.4891 123.77 47.5345 123.77 39.7318V38.3971L115.967 41.7851C103.544 47.0211 99.643 50.7171 99.643 57.8011Z" fill="currentColor"/>
            <path class="ld__ltr" style="--i: 0" d="M0.641667 71.9693C-0.179667 71.9693 -0.179667 71.0453 0.641667 71.0453H1.155C5.56967 70.9427 8.547 69.7107 8.64967 45.3787C8.64967 33.6747 8.75233 15.9133 8.75233 10.0613C8.75233 8.008 8.34167 6.05733 7.315 5.03067C5.67233 3.08 3.51633 1.64266 0.949667 1.64266H0.539C-0.179667 1.64266 -0.179667 0.821335 0.539 0.821335C12.243 0.821335 15.631 0 16.3497 0C16.9657 0 17.2737 0.205331 17.479 0.821335C18.3003 2.25867 19.943 5.13333 21.5857 7.7L43.351 41.7853L62.447 10.472C64.1923 7.59733 65.7323 4.82533 66.6563 3.18267C67.8883 1.12933 68.915 0.20533 70.147 0.20533C71.8923 0.20533 79.5923 0.821335 83.9043 0.821335C84.7257 0.821335 84.7257 1.74533 83.9043 1.74533H82.5697C77.539 1.74533 77.1283 2.464 77.1283 26.488V46.508C77.1283 70.532 77.6417 71.0453 82.6723 71.0453H83.9043C84.7257 71.0453 84.7257 71.9693 83.9043 71.9693C81.0297 71.9693 72.2003 71.6613 70.763 71.6613C69.223 71.6613 61.831 71.9693 58.9563 71.9693C58.135 71.9693 58.135 71.0453 58.9563 71.0453H60.907C66.2457 71.0453 66.8617 70.532 66.8617 45.3787V8.932C66.8617 7.7 66.759 7.18666 66.3483 7.18666C65.9377 7.18666 65.3217 8.21333 63.5763 11.088L40.0657 49.3827C39.2443 50.7173 38.9363 51.2307 38.5257 51.2307H37.807C37.499 51.2307 37.2937 50.82 36.883 50.204L10.087 8.11066L9.98433 45.3787C9.88167 69.8133 16.1443 71.0453 21.175 71.0453H22.6123C23.331 71.0453 23.331 71.9693 22.6123 71.9693C19.635 72.072 10.1897 71.6613 8.64967 71.6613C7.10967 71.6613 3.51633 71.9693 0.641667 71.9693Z" fill="currentColor"/>
          </svg>
        </h1>
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
        /* Salida: el panel se recorta de abajo hacia arriba revelando el home */
        clip-path: inset(0% 0% 0% 0%);
        contain: layout paint style;
        transition: clip-path 0.78s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .ld--out {
        clip-path: inset(0% 0% 100% 0%);
        pointer-events: none;
        will-change: clip-path;
      }

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
        margin: 0 auto;
        display: block;
        width: clamp(18rem, 32vw, 30rem);
        max-width: 72vw;
        color: #ede4dd; /* cream */
        /* El efecto "ver imágenes a través de las letras" lo da el blend, sin mask/clip */
        mix-blend-mode: difference;
        user-select: none;
        pointer-events: none;
      }
      .ld__word svg { display: block; width: 100%; height: auto; }
      /* Aparición letra por letra (stagger). Anima solo transform/opacity del path,
         no el blend del SVG padre. transform-box: fill-box → origen en cada letra. */
      .ld__word .ld__ltr {
        transform-box: fill-box;
        transform-origin: center bottom;
        opacity: 0;
        /* Stagger marcado para que se lea claramente letra por letra (M→a→y→a) */
        animation: ld-letter-in 0.42s cubic-bezier(0.4, 0, 0.2, 1) both;
        animation-delay: calc(var(--i, 0) * 0.24s);
      }
      @keyframes ld-letter-in {
        from { opacity: 0; transform: translateY(24%) scale(0.86); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (max-width: 720px) {
        .ld__word { width: 70%; max-width: 70%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ld__word .ld__ltr { animation: none; opacity: 1; transform: none; }
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
        .ld { clip-path: none; transition: opacity 0.3s ease; }
        .ld--out { clip-path: none; opacity: 0; }
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
  /** Las imágenes colapsan a scale(0) justo antes del recorte del overlay. */
  protected readonly collapsing = signal(false);
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
    // Salida: cada carta colapsa hacia su propio centro
    if (this.collapsing()) {
      return 'scale(0)';
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

  /** Ligero stagger al colapsar (las de atrás desaparecen un instante después). */
  protected cardDelay(i: number): string {
    if (!this.collapsing()) return '0s';
    const d = Math.max(0, this.top() - i);
    return `${Math.min(d, 4) * 0.04}s`;
  }

  private finish(): void {
    if (this.timer) clearInterval(this.timer);
    // Secuencia: contador en 100 → breve pausa → colapsan las imágenes →
    // (solapando) recorte del overlay hacia arriba → marca loaded + desmonta/emite
    setTimeout(() => {
      this.collapsing.set(true);
      setTimeout(() => {
        this.leaving.set(true);
        setTimeout(() => {
          this.doc.documentElement.classList.add('loaded');
          this.done.emit();
        }, 820);
      }, 300);
    }, 260);
  }

  protected pad(n: number): string {
    return String(Math.min(100, Math.max(0, n))).padStart(3, '0');
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
