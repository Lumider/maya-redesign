import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { CAMPANA, PAR_ESTRELLAS, RECONOCIMIENTOS } from '../data/mock';

/** Mi carrera (aspira): PAR+ Sueño, reconocimientos/medallas, ascensos y autos. */
@Component({
  selector: 'app-carrera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi carrera</nav>
        <h1 class="v2-title">Mi carrera</h1>
        <p class="v2-sub">A dónde vas: tu sueño PAR+, tus reconocimientos y tu siguiente estatus.</p>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" appAnchor="sueno">Sueño PAR+</a>
          <a class="anchor" appAnchor="recon">Reconocimientos</a>
          <a class="anchor" appAnchor="ascensos">Ascensos y autos</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Hero full-bleed estilo editorial: media + overlay + kicker + titular + progreso -->
          <section id="sueno" class="card par-hero v2-section" appReveal>
            <div class="par-hero__bg" aria-hidden="true">
              @if (usarVideo && !reducedMotion) {
                <video
                  class="par-hero__media"
                  autoplay
                  muted
                  loop
                  playsinline
                  poster="media/punta-cana.jpg"
                  aria-hidden="true"
                  tabindex="-1"
                >
                  <source src="media/punta-cana.mp4" type="video/mp4" />
                </video>
              } @else {
                <!-- Fondo del hero: foto propia de Punta Cana (estática, liviana,
                     funciona también con reduce-motion). Para usar video: usarVideo=true
                     y un .mp4 corto/mudo/optimizado en public/media/. -->
                <img class="par-hero__media" src="media/punta-cana.jpg" alt="" aria-hidden="true" tabindex="-1" />
              }
            </div>
            <div class="par-hero__overlay" aria-hidden="true"></div>

            <div class="par-hero__content">
              <div class="par-hero__left">
                <span class="par-hero__kicker">{{ par.nivel }}</span>
                <h2 class="par-hero__title">{{ par.sueno }}</h2>
              </div>
              <div class="par-hero__card">
                <span class="par-hero__cap">Progreso del sueño</span>
                <div class="par-hero__pct">{{ suenoPct }}%</div>
                <div class="progress"><div class="progress__fill" [style.width.%]="suenoPct"></div></div>
                <span class="par-hero__cap">venta \${{ par.ventaC6 | number }} de \${{ par.metaSueno | number }}</span>
              </div>
            </div>
          </section>

          <!-- Estrellas y requisitos (debajo del hero, sin cambios funcionales) -->
          <section class="card pad v2-section" appReveal>
            <div class="stars">
              @for (e of estrellas; track e.n) {
                <div class="star" [class.star--done]="e.n < estrellaActual" [class.star--cur]="e.n === objetivoEstrella">
                  <span class="star__ic">★</span>
                  <span class="star__n">Estrella {{ e.n }}</span>
                  <span class="tiny">{{ e.hito }}</span>
                </div>
              }
            </div>
            <div class="reqs">
              <span class="tiny" style="font-weight:700">Para tu Estrella {{ objetivoEstrella }} necesitas:</span>
              @for (req of par.requisitos; track req) {
                <div class="req"><span class="sem sem--warn"></span><span>{{ req }}</span></div>
              }
            </div>
          </section>

          <section id="recon" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="star" [size]="18" /> Reconocimientos</h2>
            <div class="medals">
              <div class="medal card pad">
                <span class="medal__ic" [class]="'medal__ic--' + r.excelenciaGP.medalla.toLowerCase()">🏅</span>
                <strong>Excelencia GP</strong>
                <span class="badge badge--brand">{{ r.excelenciaGP.medalla }}</span>
                <span class="tiny">{{ r.excelenciaGP.cumplidas }}/{{ r.excelenciaGP.de }} campañas en Cuadrante A</span>
              </div>
              <div class="medal card pad">
                <span class="medal__ic medal__ic--plata">🏅</span>
                <strong>Liderazgo</strong>
                <span class="badge badge--brand">{{ r.liderazgo.medalla }}</span>
                <span class="tiny">{{ r.liderazgo.hijasEnA }}% de hijas en Cuadrante A (meta {{ r.liderazgo.meta }}%)</span>
              </div>
            </div>
            <div class="card pad poderosa" [class.poderosa--on]="r.liderPoderosa" appReveal>
              <span class="medal__ic">👑</span>
              <div><strong>Líder Poderosa</strong><p class="tiny" style="margin:2px 0 0">{{ r.liderPoderosa ? '¡Lo lograste!' : 'Te falta: Medalla Oro de Liderazgo + Hito PAR+ 3 o más.' }}</p></div>
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <div id="ascensos" class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px"><app-icon name="trending" [size]="16" /> Ascensos</h3>
            <div class="ladder">
              <div class="rung rung--done"><span>SSE</span><span class="tiny">Eres aquí</span></div>
              <div class="rung rung--next"><span>REG</span><span class="tiny">Forma 1 hija más</span></div>
              <div class="rung"><span>EST</span><span class="tiny">Líder de líderes</span></div>
            </div>
          </div>
          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px">🚗 Auto Yanbal</h3>
            <span class="tiny">Disponible desde SSE. Un auto por estatus — meta camioneta.</span>
            <div class="progress" style="margin-top:10px"><div class="progress__fill" style="width:35%"></div></div>
            <span class="tiny">Conteo en paralelo con tu ascenso</span>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .crumbs { margin-bottom: 6px; } .crumbs a { color: var(--ink-2); }
      .pad { padding: 18px 20px; }

      /* ----- Hero del sueño (full-bleed, estilo editorial) ----- */
      .par-hero {
        position: relative;
        min-height: clamp(420px, 70vh, 640px);
        padding: 0;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        isolation: isolate;
      }
      /* Fallback detrás del media (visible si la imagen aún no carga) */
      .par-hero__bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, #0c5566, #0e7490 60%, #1287a8);
      }
      .par-hero__media {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      /* iframe cover (solo si se usara YouTube de referencia) */
      .par-hero__yt {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100vw;
        height: 56.25vw;
        min-height: 100%;
        min-width: 177.78vh;
        pointer-events: none;
        border: 0;
      }
      /* Overlay oscuro en degradado, más fuerte abajo (legibilidad AA) */
      .par-hero__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.12) 100%);
      }
      .par-hero__content {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 30px 32px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 22px;
      }
      .par-hero__left { flex: 1; min-width: 0; }
      .par-hero__kicker {
        display: inline-block;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.28);
        padding: 5px 12px;
        border-radius: 99px;
        backdrop-filter: blur(4px);
      }
      .par-hero__title {
        font-size: clamp(40px, 7vw, 96px);
        font-weight: 800;
        line-height: 0.95;
        letter-spacing: -0.02em;
        color: #fff;
        margin: 16px 0 0;
        text-shadow: 0 2px 30px rgba(0, 0, 0, 0.55);
      }
      .par-hero__card {
        flex-shrink: 0;
        width: 264px;
        background: rgba(18, 15, 13, 0.55);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: var(--radius);
        padding: 16px 18px;
        color: #fff;
      }
      .par-hero__pct { font-family: var(--font-display); font-weight: 800; font-size: 34px; line-height: 1; margin: 4px 0 2px; }
      .par-hero__card .progress { background: rgba(255, 255, 255, 0.22); margin: 6px 0 8px; }
      .par-hero__cap { display: block; font-size: 12px; color: rgba(255, 255, 255, 0.82); }

      /* ----- Estrellas y requisitos ----- */
      .stars { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 0 0 18px; }
      .star { text-align: center; padding: 10px 6px; border-radius: var(--radius-s); background: var(--sand); opacity: 0.6; }
      .star__ic { font-size: 18px; display: block; color: var(--ink-3); }
      .star__n { font-size: 11px; font-weight: 700; display: block; margin-top: 2px; }
      .star--done { opacity: 1; } .star--done .star__ic { color: var(--brand-500); }
      .star--cur { opacity: 1; outline: 2px solid var(--brand-500); background: var(--brand-50); }
      .star--cur .star__ic { color: var(--brand-600); }
      .reqs { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--line); padding-top: 14px; }
      .req { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }

      .medals { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .medal { display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
      .medal__ic { font-size: 30px; filter: grayscale(0.1); }
      .medal__ic--plata { filter: grayscale(0.5) brightness(1.1); }
      .poderosa { display: flex; gap: 14px; align-items: center; margin-top: 12px; opacity: 0.85; }
      .poderosa--on { outline: 2px solid var(--brand-500); opacity: 1; }
      .ladder { display: flex; flex-direction: column; gap: 8px; }
      .rung { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; border-radius: var(--radius-s); background: var(--sand); font-weight: 700; }
      .rung--done { background: var(--success-bg); color: var(--success); }
      .rung--next { outline: 2px solid var(--brand-500); background: var(--brand-50); }

      /* Seguridad extra: con reduce-motion, nunca mostrar media en movimiento */
      /* Con reduce-motion la imagen estática se mantiene; el video no se renderiza (guard en TS) */

      @media (max-width: 560px) {
        .par-hero { min-height: 60vh; }
        .par-hero__content { flex-direction: column; align-items: stretch; gap: 14px; padding: 22px 18px; }
        .par-hero__left { max-width: 100%; }
        .par-hero__title { font-size: clamp(32px, 11vw, 56px); }
        .par-hero__card { width: 100%; }
        .medals { grid-template-columns: 1fr; }
        .stars { grid-template-columns: repeat(3, 1fr); }
      }
    `,
  ],
})
export class Carrera {
  protected readonly par = CAMPANA.par;
  protected readonly estrellas = PAR_ESTRELLAS;
  protected readonly r = RECONOCIMIENTOS;
  protected readonly estrellaActual = CAMPANA.par.estrellaActual;
  protected readonly objetivoEstrella = 3;
  protected readonly suenoPct = Math.round((CAMPANA.par.ventaC6 / CAMPANA.par.metaSueno) * 100);

  /** Fondo del hero: imagen estática por defecto. true = usar mp4 propio en public/media/. */
  protected readonly usarVideo = false;
  /** Con reduce-motion no se reproduce video: queda la imagen estática. */
  protected readonly reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
