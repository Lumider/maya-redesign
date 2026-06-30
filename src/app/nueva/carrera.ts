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
          <section id="sueno" class="card par v2-section" appReveal>
            <div class="par__cover">🌴</div>
            <div class="par__body">
              <span class="badge badge--brand">{{ par.nivel }}</span>
              <h2 class="par__title">{{ par.sueno }}</h2>
              <div class="progress" style="margin:10px 0 6px"><div class="progress__fill" [style.width.%]="suenoPct"></div></div>
              <span class="tiny">{{ suenoPct }}% · venta \${{ par.ventaC6 | number }} de \${{ par.metaSueno | number }}</span>

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
                @for (r of par.requisitos; track r) {
                  <div class="req"><span class="sem sem--warn"></span><span>{{ r }}</span></div>
                }
              </div>
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
      .par { overflow: hidden; }
      .par__cover { height: 130px; display: grid; place-items: center; font-size: 56px; background: linear-gradient(120deg, #0c5566, #0e7490 60%, #1287a8); }
      .par__body { padding: 18px 20px; }
      .par__title { font-size: 24px; margin: 8px 0 0; }
      .stars { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 18px 0; }
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
      @media (max-width: 560px) { .medals { grid-template-columns: 1fr; } .stars { grid-template-columns: repeat(3, 1fr); } }
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
}
