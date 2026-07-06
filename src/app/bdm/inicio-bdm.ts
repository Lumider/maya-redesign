import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { GESTION_BDM, INDICADORES_BDM, QUICKLINKS_BDM, USUARIA_BDM } from '../data/mock-bdm';
import { MATERIALES } from '../data/mock';

/**
 * Inicio (BDM) — Home del Portal para BDMs. Responde la pregunta de apertura
 * del diseño: "¿Qué vas a hacer hoy?".
 *
 * Estructura según la base de conocimiento (Vista BDM — Home, Figma 10-11067):
 * quicklinks de uso frecuente · indicadores clave (cada uno abre su detalle en
 * Mi campaña) · Gestión de tus Directoras (conteos por estado → 5 frentes) ·
 * material campañal. Como el resto de inicios, es cabina: espeja y enruta,
 * no es dueño de los datos (viven en mock-bdm).
 */
@Component({
  selector: 'app-inicio-bdm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">¡Hola, {{ nombre }}! 👋</h1>
        <p class="v2-sub">
          ¿Qué vas a hacer hoy? Así va tu unidad en la {{ u.campana }}, semana
          {{ u.semana.slice(1) }}.
        </p>
        <!-- Quicklinks: accesos de uso frecuente (bloque 2 del diseño) -->
        <nav class="quick" aria-label="Accesos rápidos">
          @for (q of quicklinks; track q.etiqueta) {
            <a class="chip" [routerLink]="q.ruta">
              <app-icon [name]="q.icono" [size]="14" /> {{ q.etiqueta }}
            </a>
          }
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Gestión de tus Directoras: conteos por estado → los 5 frentes -->
          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="users" [size]="18" /> Gestión de tus Directoras</h2>
            <p class="tiny" style="margin:4px 0 12px">
              Cuántas Directoras hay en cada estado; cada tarjeta lleva a su frente de gestión.
            </p>
            <div class="gest">
              @for (g of gestion; track g.etiqueta) {
                <a
                  class="gest__i card card--hover"
                  routerLink="/n/directoras"
                  [queryParams]="g.cuad ? { cuad: g.cuad } : { frente: g.frenteId }"
                >
                  <span class="gest__v" [class.gest__v--ok]="g.positivo">{{ g.valor }}</span>
                  <span class="gest__l">{{ g.etiqueta }}</span>
                  <span class="tiny">{{ g.frente }}</span>
                </a>
              }
            </div>
          </section>

          <!-- Material campañal (bloque 6): mismos materiales del sistema -->
          <section class="v2-section" appReveal [revealDelay]="80">
            <h2 class="v2-h"><app-icon name="sparkles" [size]="18" /> Material campañal</h2>
            <div class="mats">
              @for (m of materiales; track m.titulo) {
                <a class="mat card card--hover" routerLink="/n/herramientas">
                  <div class="mat__cover" [style.background]="m.gradiente">
                    @if (m.imagen) {
                      <img [src]="m.imagen" [alt]="m.titulo" />
                    } @else {
                      <span>{{ m.emoji }}</span>
                    }
                    @if (m.tag) {
                      <span class="badge badge--sys badge--neutral mat__tag">{{ m.tag }}</span>
                    }
                  </div>
                  <span class="mat__t">{{ m.titulo }}</span>
                </a>
              }
            </div>
          </section>
        </main>

        <aside>
          <!-- Indicadores del negocio (bloque 3): cada uno abre su card -->
          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="chart" [size]="16" /> Tus indicadores
            </h3>
            <p class="tiny" style="margin:2px 0 10px">
              Actualizado 09:30 a. m. — toca para el detalle
            </p>
            <div class="inds">
              @for (i of indicadores; track i.etiqueta) {
                <a class="ind" routerLink="/n/campana">
                  <span class="ind__l">{{ i.etiqueta }}</span>
                  <span class="ind__v"
                    >{{ i.valor }}
                    @if (i.nota) {
                      <span class="tiny">{{ i.nota }}</span>
                    }
                  </span>
                </a>
              }
            </div>
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
      .quick {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .quick .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      /* Gestión: tiles con el conteo grande (el estado manda, no el adorno) */
      .gest {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        gap: 12px;
      }
      .gest__i {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 14px 16px;
      }
      .gest__v {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 800;
        color: var(--danger);
      }
      .gest__v--ok {
        color: var(--success);
      }
      .gest__l {
        font-weight: 700;
        font-size: 13.5px;
      }

      /* Indicadores del lateral: lista compacta etiqueta ←→ valor */
      .inds {
        display: flex;
        flex-direction: column;
      }
      .ind {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 2px;
        border-bottom: 1px solid var(--line);
        border-radius: var(--radius-s);
        transition: background 0.12s ease;
      }
      .ind:last-child {
        border-bottom: 0;
      }
      .ind:hover {
        background: var(--sand);
      }
      .ind__l {
        font-size: 13px;
        color: var(--ink-2);
      }
      .ind__v {
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      /* Material campañal: strip horizontal reutilizando covers del sistema */
      .mats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
        gap: 12px;
      }
      .mat {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
      }
      .mat__cover {
        position: relative;
        height: 110px;
        border-radius: var(--radius-s);
        display: grid;
        place-items: center;
        font-size: 30px;
        overflow: hidden;
      }
      .mat__cover img {
        width: 78%;
        height: 78%;
        object-fit: contain;
      }
      .mat__tag {
        position: absolute;
        bottom: 6px;
        right: 6px;
      }
      .mat__t {
        font-size: 12.5px;
        font-weight: 700;
      }
    `,
  ],
})
export class InicioBdm {
  protected readonly u = USUARIA_BDM;
  protected readonly nombre = USUARIA_BDM.nombre.split(' ')[0];
  protected readonly indicadores = INDICADORES_BDM;
  protected readonly gestion = GESTION_BDM;
  protected readonly quicklinks = QUICKLINKS_BDM;
  protected readonly materiales = MATERIALES;
}
