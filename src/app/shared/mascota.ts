import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Expresiones de la mascota: la cara acompaña el tono del consejo. */
export type ExpresionMascota = 'normal' | 'celebra' | 'alerta';

/** Hacia dónde mira Yana, normalizado −1…1 en ambos ejes (null = al frente). */
export interface MiradaMascota {
  x: number;
  y: number;
}

/**
 * Yana, la mascota del asistente (proyecto interno "Clippy"): una chispa
 * naranja con cara, dibujada en el mismo lenguaje que las ilustraciones 3D
 * del sistema (icon3d.ts): SVG puro con degradados de marca, brillo especular
 * y sombra de apoyo. Los naranjas van hardcodeados a propósito — es una
 * ilustración, la misma excepción consciente que Icon3d.
 *
 * La vida del personaje (referencia: el asistente de cloudstudio.es) se logra
 * con tres capas baratas — solo transform/opacity, nada por frame en JS:
 * · idle: el cuerpo respira y la sombra late a contrafase (vende levitación);
 * · parpadeo periódico (solo cuando los ojos están abiertos);
 * · mirada: las pupilas siguen un vector que entrega el CONTENEDOR — la
 *   mascota no escucha eventos globales, así es reutilizable y testeable.
 * `animada=false` (galería) y prefers-reduced-motion lo apagan todo.
 */
@Component({
  selector: 'app-mascota',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      [class.quieta]="!animada()"
    >
      <defs>
        <linearGradient
          id="masc-cuerpo"
          x1="30"
          y1="20"
          x2="66"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#ff8950" />
          <stop offset="1" stop-color="#c84008" />
        </linearGradient>
        <linearGradient
          id="masc-punta"
          x1="42"
          y1="12"
          x2="54"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#ffb892" />
          <stop offset="1" stop-color="#ff8950" />
        </linearGradient>
        <radialGradient id="masc-luz" cx="0.38" cy="0.3" r="0.75">
          <stop stop-color="#ffd9c2" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffd9c2" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- sombra de apoyo: late a contrafase de la respiración -->
      <ellipse class="sombra" cx="48" cy="87" rx="23" ry="5" fill="#222" opacity="0.08" />

      <g class="cuerpo">
        <!-- cuerpo: chispa/gota con punta -->
        <path
          d="M48 10 C36 26 23 38 23 57 a25 25 0 0 0 50 0 C73 38 60 26 48 10 Z"
          fill="url(#masc-cuerpo)"
        />
        <path
          d="M48 10 C42 18 36 25 32 33 c4-3 10-5 16-5s12 2 16 5c-4-8-10-15-16-23Z"
          fill="url(#masc-punta)"
        />
        <!-- luz ambiental superior + sombra interior en la base: profundidad -->
        <path
          d="M48 10 C36 26 23 38 23 57 a25 25 0 0 0 50 0 C73 38 60 26 48 10 Z"
          fill="url(#masc-luz)"
        />
        <path d="M25 62a23 23 0 0 0 46 0 25 25 0 0 1-46 0Z" fill="#8a2d06" opacity="0.18" />
        <!-- brillo especular -->
        <ellipse cx="36" cy="52" rx="5" ry="11" fill="#fff" opacity="0.25" />
        <circle cx="41" cy="43" r="2.2" fill="#fff" opacity="0.5" />
        <!-- mejillas -->
        <ellipse cx="32.5" cy="64" rx="4.2" ry="2.6" fill="#ffb892" opacity="0.5" />
        <ellipse cx="63.5" cy="64" rx="4.2" ry="2.6" fill="#ffb892" opacity="0.5" />

        @switch (expresion()) {
          @case ('celebra') {
            <!-- ojos felices (^ ^), sonrisa abierta y destellos -->
            <path
              d="M34 56q5-6 10 0"
              stroke="#5b1f06"
              stroke-width="3.2"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M52 56q5-6 10 0"
              stroke="#5b1f06"
              stroke-width="3.2"
              stroke-linecap="round"
              fill="none"
            />
            <path d="M39 64q9 10 18 0c-2 7-6 10-9 10s-7-3-9-10Z" fill="#5b1f06" />
            <path
              d="M13 34l1.8 4.4 4.4 1.8-4.4 1.8-1.8 4.4-1.8-4.4-4.4-1.8 4.4-1.8Z"
              fill="#ffb892"
            />
            <path
              d="M82 24l1.5 3.7 3.7 1.5-3.7 1.5-1.5 3.7-1.5-3.7-3.7-1.5 3.7-1.5Z"
              fill="#ffc4a8"
            />
          }
          @case ('alerta') {
            <!-- cejas altas, ojos grandes, boca "oh" y globo de atención -->
            <path d="M33 47l10-3" stroke="#5b1f06" stroke-width="3" stroke-linecap="round" />
            <path d="M63 47l-10-3" stroke="#5b1f06" stroke-width="3" stroke-linecap="round" />
            <g class="parpado">
              <ellipse cx="39" cy="57" rx="5.5" ry="6.5" fill="#fff" />
              <ellipse cx="57" cy="57" rx="5.5" ry="6.5" fill="#fff" />
              <g class="pupilas" [style.transform]="giroPupilas()">
                <circle cx="39" cy="55.5" r="2.6" fill="#5b1f06" />
                <circle cx="57" cy="55.5" r="2.6" fill="#5b1f06" />
              </g>
            </g>
            <ellipse cx="48" cy="70" rx="4" ry="4.6" fill="#5b1f06" />
            <circle cx="79" cy="19" r="11" fill="#dc582a" />
            <rect x="77.2" y="11.5" width="3.6" height="9.5" rx="1.8" fill="#fff" />
            <circle cx="79" cy="25" r="2.1" fill="#fff" />
          }
          @default {
            <!-- expresión normal: atenta y sonriente -->
            <g class="parpado">
              <ellipse cx="39" cy="56" rx="5" ry="6" fill="#fff" />
              <ellipse cx="57" cy="56" rx="5" ry="6" fill="#fff" />
              <g class="pupilas" [style.transform]="giroPupilas()">
                <circle cx="40" cy="57" r="2.5" fill="#5b1f06" />
                <circle cx="58" cy="57" r="2.5" fill="#5b1f06" />
              </g>
            </g>
            <path
              d="M40 68q8 7 16 0"
              stroke="#5b1f06"
              stroke-width="3.2"
              stroke-linecap="round"
              fill="none"
            />
          }
        }
      </g>
    </svg>
  `,
  styles: [
    `
      /* Los transforms sobre elementos SVG requieren transform-box para que el
         origen sea el propio dibujo y no el viewport del SVG. */
      .cuerpo {
        transform-box: fill-box;
        transform-origin: 50% 92%;
        animation: masc-respira 3.4s ease-in-out infinite;
      }
      .sombra {
        transform-box: fill-box;
        transform-origin: center;
        animation: masc-sombra 3.4s ease-in-out infinite;
      }
      .parpado {
        transform-box: fill-box;
        transform-origin: center;
        animation: masc-parpadea 4.6s ease-in-out infinite;
      }
      .pupilas {
        transition: transform 0.16s ease-out;
      }

      @keyframes masc-respira {
        0%,
        100% {
          transform: scale(1, 1);
        }
        50% {
          transform: scale(0.99, 1.025) translateY(-0.8px);
        }
      }
      @keyframes masc-sombra {
        0%,
        100% {
          transform: scaleX(1);
          opacity: 0.08;
        }
        50% {
          transform: scaleX(0.94);
          opacity: 0.06;
        }
      }
      /* Parpadeo: un burst corto al final de cada ciclo, el resto ojos abiertos. */
      @keyframes masc-parpadea {
        0%,
        92%,
        100% {
          transform: scaleY(1);
        }
        95% {
          transform: scaleY(0.08);
        }
        98% {
          transform: scaleY(1);
        }
      }

      /* Galería o quien la necesite quieta. */
      .quieta .cuerpo,
      .quieta .sombra,
      .quieta .parpado {
        animation: none;
      }
      .quieta .pupilas {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .cuerpo,
        .sombra,
        .parpado {
          animation: none;
        }
        .pupilas {
          transition: none;
        }
      }
    `,
  ],
})
export class Mascota {
  readonly expresion = input<ExpresionMascota>('normal');
  readonly size = input(64);
  /** Apaga idle/parpadeo (galería, contextos estáticos). */
  readonly animada = input(true);
  /** Vector de mirada que entrega el contenedor; null = mirar al frente. */
  readonly mirada = input<MiradaMascota | null>(null);

  /** Desplazamiento de pupilas acotado a ±2.5px — suficiente para "seguir"
   *  al cursor sin que los ojos se salgan del blanco. */
  protected readonly giroPupilas = computed(() => {
    const m = this.mirada();
    if (!m || !this.animada()) return 'translate(0, 0)';
    const x = Math.max(-1, Math.min(1, m.x)) * 2.5;
    const y = Math.max(-1, Math.min(1, m.y)) * 2.2;
    return `translate(${x}px, ${y}px)`;
  });
}
