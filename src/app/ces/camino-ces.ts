import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { EstatusService } from '../shared/estatus';
import { CAMINO_CES, PERFILES } from '../data/mock-ces';

/**
 * Mi camino: lo que la Maya actual NO tiene — la carrera de la Audiencia
 * Emprendedoras contada como un camino con posición clara. La página entera
 * reacciona al estatus encarnado (conmutador demo):
 *  · El "estás aquí" del stepper se mueve con el estatus.
 *  · Los requisitos son los del PASO que ese estatus está jugando
 *    (CNS→CEM · CEM→CES · CES recupera calificación · ASP→DIR).
 * Las varas intimidan (barrera documentada): cada requisito va con su acción
 * concreta, no solo con el número.
 */
@Component({
  selector: 'app-camino-ces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">Mi camino</h1>
        <p class="v2-sub">De Consultora a Directora: dónde estás y qué sigue.</p>
      </header>

      <div class="v2-grid">
        <main>
          <!-- El camino completo, con la posición del estatus encarnado -->
          <section class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="star" [size]="18" /> La carrera</h2>
            <ol class="ruta" aria-label="Niveles de la carrera">
              @for (n of niveles(); track n.sigla) {
                <li class="ruta__paso" [class]="'ruta__paso--' + n.estado">
                  <span class="ruta__dot" aria-hidden="true">
                    @if (n.estado === 'logrado') {
                      ✓
                    } @else {
                      {{ n.sigla }}
                    }
                  </span>
                  <div class="ruta__body">
                    <strong>{{ n.nombre }}</strong>
                    <span class="tiny">{{ n.gana }} · ~S/ {{ n.ganancia | number }}/campaña</span>
                    @if (n.estado === 'actual') {
                      <span class="badge badge--brand">Estás aquí</span>
                    }
                  </div>
                </li>
              }
            </ol>
            <p class="tiny" style="margin:12px 0 0">
              Ganancias referenciales del modelo (Perú). El título se conserva; la calificación se
              juega cada campaña.
            </p>
          </section>

          <!-- Requisitos del paso que este estatus está jugando -->
          <section class="card pad v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="target" [size]="18" /> {{ p().paso.titulo }}</h2>
            <p class="muted" style="margin:0 0 14px">
              {{ p().paso.nota }} Hoy llevas {{ cumplidos() }} de {{ p().paso.requisitos.length }}.
            </p>
            @for (r of p().paso.requisitos; track r.texto) {
              <div class="req">
                <span class="req__check" [class.req__check--ok]="r.cumple" aria-hidden="true">{{
                  r.cumple ? '✓' : ''
                }}</span>
                <div class="req__body">
                  <strong [class.muted]="r.cumple">{{ r.texto }}</strong>
                  <div class="progress" style="margin:6px 0 3px">
                    <div
                      class="progress__fill"
                      [class.progress__fill--ok]="r.cumple"
                      [style.width.%]="pct(r.actual, r.meta)"
                    ></div>
                  </div>
                  <span class="tiny">{{ r.detalle }}</span>
                </div>
              </div>
            }
            <a
              class="btn btn--primary btn--sm"
              [routerLink]="p().capacidades.grupo ? '/n/grupo' : '/n/campana'"
              style="margin-top:8px"
              >{{ p().capacidades.grupo ? 'Trabajar con mi grupo' : 'Trabajar mi campaña' }}</a
            >
          </section>

          <!-- El paso que sigue después del actual -->
          @if (p().estatus === 'CES') {
            <section class="card pad asp v2-section" appReveal>
              <img src="icons/goals.png" alt="" aria-hidden="true" width="56" height="56" />
              <div>
                <h2 class="v2-h" style="margin-bottom:6px">Siguiente paso: Aspirante</h2>
                <p class="muted" style="margin:0 0 10px">
                  Cuando sostengas tu calificación CES, la postulación pide:
                </p>
                <ul class="asp__l">
                  @for (r of camino.requisitosAsp; track r) {
                    <li>{{ r }}</li>
                  }
                </ul>
                <p class="tiny" style="margin:10px 0 0">{{ camino.formacion }}</p>
              </div>
            </section>
          } @else if (p().estatus === 'ASP') {
            <section class="card pad asp v2-section" appReveal>
              <img src="icons/medal-01.png" alt="" aria-hidden="true" width="56" height="56" />
              <div>
                <h2 class="v2-h" style="margin-bottom:6px">Al graduarte: Directora</h2>
                <p class="muted" style="margin:0 0 10px">
                  Título permanente, contrato multinivel, el 10% de la venta neta de tu Grupo
                  Personal, bono de desempeño por Cuadrante A y la puerta al PAR+ (medallas, bonos,
                  viajes y autos).
                </p>
                <p class="tiny" style="margin:0">{{ camino.formacion }}</p>
              </div>
            </section>
          }
        </main>

        <aside class="v2-aside">
          <div class="card pad gan" appReveal>
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="trending" [size]="16" /> Cuánto crece tu ganancia
            </h3>
            @for (n of niveles(); track n.sigla) {
              <div class="gan__row" [class.gan__row--on]="n.estado === 'actual'">
                <span class="gan__sigla">{{ n.sigla }}</span>
                <div class="gan__bar" aria-hidden="true">
                  <div class="gan__fill" [style.width.%]="barra(n.ganancia)"></div>
                </div>
                <span class="gan__v">S/ {{ n.ganancia | number }}</span>
              </div>
            }
            <p class="tiny" style="margin:10px 0 0">
              Cada paso suma una fuente nueva de ingreso — sin perder las anteriores.
            </p>
          </div>

          <div class="card pad med" appReveal [revealDelay]="80">
            <img src="icons/medal-01.png" alt="" aria-hidden="true" width="44" height="44" />
            <div>
              <strong>Tu constancia</strong>
              <p class="tiny" style="margin:2px 0 0">
                Calificaste {{ p().estatus }} en C5 y C6. Una campaña más y retomas tu mejor racha
                del año.
              </p>
            </div>
          </div>

          <div class="card pad med" appReveal [revealDelay]="140">
            <img src="icons/airplane-01.png" alt="" aria-hidden="true" width="44" height="44" />
            <div>
              <strong>Como Directora…</strong>
              <p class="tiny" style="margin:2px 0 0">
                entras al PAR+: bonos, medallas y viajes internacionales. El camino empieza con la
                campaña que estás jugando hoy.
              </p>
            </div>
          </div>

          <div class="card pad med" appReveal [revealDelay]="200">
            <img src="icons/file.png" alt="" aria-hidden="true" width="40" height="40" />
            <p class="tiny" style="margin:0">
              Los cursos de Créana viven en
              <a class="link" routerLink="/externa/cursos">Mis Cursos ↗</a>
            </p>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .pad {
        padding: 18px 20px;
      }
      .btn--sm {
        padding: 8px 14px;
        font-size: 13px;
      }
      .link {
        color: var(--brand-600);
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      /* Stepper vertical de carrera */
      .ruta {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .ruta__paso {
        display: flex;
        gap: 14px;
        position: relative;
        padding-bottom: 18px;
      }
      .ruta__paso:last-child {
        padding-bottom: 0;
      }
      .ruta__paso::before {
        content: '';
        position: absolute;
        left: 17px;
        top: 34px;
        bottom: 0;
        width: 2px;
        background: var(--line);
      }
      .ruta__paso:last-child::before {
        display: none;
      }
      .ruta__dot {
        width: 36px;
        height: 36px;
        border-radius: 99px;
        flex-shrink: 0;
        z-index: 1;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid var(--line-strong);
        background: var(--surface);
        color: var(--ink-3);
      }
      .ruta__paso--logrado .ruta__dot {
        border-color: var(--success);
        background: var(--success-bg);
        color: var(--success);
      }
      .ruta__paso--actual .ruta__dot {
        border-color: var(--brand-600);
        background: var(--brand-100);
        color: var(--brand-700);
      }
      .ruta__body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: flex-start;
        padding-top: 2px;
      }
      .ruta__paso--logrado .ruta__body strong {
        color: var(--ink-2);
      }

      /* Requisitos con check + progreso */
      .req {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--line);
      }
      .req:last-of-type {
        border-bottom: 0;
      }
      .req__check {
        width: 26px;
        height: 26px;
        border-radius: 99px;
        flex-shrink: 0;
        margin-top: 2px;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 13px;
        border: 1.5px dashed var(--line-strong);
        color: var(--ink-3);
      }
      .req__check--ok {
        border-style: solid;
        border-color: var(--success);
        background: var(--success-bg);
        color: var(--success);
      }
      .req__body {
        flex: 1;
      }
      .progress__fill--ok {
        background: linear-gradient(90deg, #34d399, var(--success));
      }

      .asp {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }
      .asp__l {
        margin: 0;
        padding-left: 18px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13.5px;
      }

      /* Barras de ganancia por nivel */
      .gan__row {
        display: grid;
        grid-template-columns: 34px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 0;
      }
      .gan__sigla {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--ink-3);
      }
      .gan__row--on .gan__sigla {
        color: var(--brand-700);
      }
      .gan__bar {
        height: 8px;
        border-radius: 99px;
        background: var(--sand);
        overflow: hidden;
      }
      .gan__fill {
        height: 100%;
        border-radius: 99px;
        background: var(--brand-grad);
      }
      .gan__v {
        font-size: 12px;
        font-weight: 700;
      }

      .med {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      @media (max-width: 720px) {
        .asp {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class CaminoCes {
  private readonly estatusSrv = inject(EstatusService);

  protected readonly camino = CAMINO_CES;
  protected readonly p = computed(() => PERFILES[this.estatusSrv.estatus()]);

  /** Stepper con estado derivado del estatus encarnado (logrado ← actual → futuro). */
  protected readonly niveles = computed(() => {
    const orden = CAMINO_CES.niveles.map((n) => n.sigla);
    const idx = orden.indexOf(this.p().estatus);
    return CAMINO_CES.niveles.map((n, i) => ({
      ...n,
      estado: i < idx ? 'logrado' : i === idx ? 'actual' : i === idx + 1 ? 'siguiente' : 'futuro',
    }));
  });

  protected readonly cumplidos = computed(
    () => this.p().paso.requisitos.filter((r) => r.cumple).length,
  );

  protected pct(actual: number, meta: number): number {
    return Math.min(100, Math.round((actual / meta) * 100));
  }

  /** Ancho de barra relativo al nivel más alto (DIR). */
  protected barra(g: number): number {
    const max = Math.max(...CAMINO_CES.niveles.map((n) => n.ganancia));
    return Math.round((g / max) * 100);
  }
}
