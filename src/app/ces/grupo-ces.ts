import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { GRUPO_CES, SEGMENTOS_CES, USUARIA_CES, type IntegranteCes } from '../data/mock-ces';

/**
 * Mi grupo (CES): la red de la Emprendedora (hijas y nietas — CNS/CEM, nunca
 * directoras). Los segmentos de gestión son FILTROS accionables (como los chips
 * del inicio de la Maya real) y cada persona muestra la acción que pide hoy,
 * con contacto directo (WhatsApp / llamar) porque el teléfono es la herramienta
 * real de gestión de una CES.
 */
@Component({
  selector: 'app-grupo-ces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">Mi grupo</h1>
        <p class="v2-sub">Las {{ total }} personas de tu red y lo que cada una necesita hoy.</p>

        <!-- Segmentos = filtros (un clic responde "¿a quién llamo hoy?") -->
        <div class="segs" role="group" aria-label="Filtrar por segmento">
          <button
            class="chip"
            [class.chip--active]="filtro() === 'todas'"
            (click)="filtro.set('todas')"
          >
            Todas <strong>{{ total }}</strong>
          </button>
          @for (s of segmentos; track s.id) {
            <button
              class="chip"
              [class.chip--active]="filtro() === s.id"
              (click)="filtro.set(s.id)"
              [title]="s.hint"
            >
              <span class="sem" [class]="'sem--' + tone(s.tone)"></span>
              {{ s.label }} <strong>{{ conteo(s.id) }}</strong>
            </button>
          }
        </div>
      </header>

      <div class="v2-grid">
        <main>
          <section class="lista" appReveal>
            @for (p of visibles(); track p.nombre) {
              <article class="persona card" [class]="'persona--' + p.estado">
                <span class="persona__av" aria-hidden="true">{{ p.iniciales }}</span>
                <div class="persona__body">
                  <div class="persona__top">
                    <strong>{{ p.nombre }}</strong>
                    <span
                      class="badge"
                      [class]="p.nivel === 'CEM' ? 'badge--brand' : 'badge--neutral'"
                      >{{ p.nivel }}</span
                    >
                  </div>
                  <span class="tiny">
                    Venta personal: S/ {{ p.ventaPersonal | number: '1.0-2' }}
                    @if (p.ventaGrupal !== undefined) {
                      · Venta grupal: S/ {{ p.ventaGrupal | number: '1.0-2' }}
                    }
                  </span>
                  <span class="persona__hint tiny">{{ p.hint }}</span>
                  @if (p.alerta) {
                    <span class="alert alert--warning persona__alerta">⚠️ {{ p.alerta }}</span>
                  }
                </div>
                <div class="persona__cta">
                  <button
                    class="btn btn--ghost btn--xs"
                    [attr.aria-label]="'Escribir por WhatsApp a ' + p.nombre"
                  >
                    WhatsApp
                  </button>
                  <button class="btn btn--soft btn--xs" [attr.aria-label]="'Llamar a ' + p.nombre">
                    Llamar
                  </button>
                </div>
              </article>
            } @empty {
              <div class="card pad vacio">
                <img src="icons/searching.png" alt="" aria-hidden="true" width="56" height="56" />
                <p class="muted">Nadie en este segmento — ¡buena señal! 🎉</p>
              </div>
            }
          </section>
        </main>

        <aside class="v2-aside">
          <div class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px">
              <app-icon name="users" [size]="16" /> Composición de tu red
            </h3>
            <div class="tiles" style="grid-template-columns:1fr 1fr">
              <div class="tile card">
                <span class="tile__label">Consultoras</span
                ><span class="tile__value">{{ nCns }}</span>
              </div>
              <div class="tile card">
                <span class="tile__label">Emprendedoras</span
                ><span class="tile__value">{{ nCem }}</span>
              </div>
            </div>
            <p class="tiny" style="margin:10px 0 0">
              Tu calificación CES pide <strong>5 activas directas</strong> — hoy tienes
              {{ activas }}.
            </p>
          </div>

          <div class="card pad festejo" appReveal [revealDelay]="80">
            <img src="icons/check.png" alt="" aria-hidden="true" width="40" height="40" />
            <div>
              <strong>2 celebraciones esta semana</strong>
              <p class="tiny" style="margin:2px 0 0">
                Katia cumplió su Inicio Ganador y Bertha calificó su bicampañal — un mensaje de
                reconocimiento sostiene la actividad.
              </p>
            </div>
          </div>

          <div class="card pad tipcard" appReveal [revealDelay]="140">
            <img src="icons/megaphone.png" alt="" aria-hidden="true" width="40" height="40" />
            <p class="tiny" style="margin:0">
              ¿Conociste a alguien con perfil?
              <a class="link" routerLink="/n/incorpora">Incorpórala y gana S/ 50 por campaña</a>.
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
      .link {
        color: var(--brand-600);
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .segs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 14px;
      }
      .segs .sem {
        width: 8px;
        height: 8px;
      }

      .lista {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .persona {
        display: flex;
        gap: 14px;
        padding: 14px 16px;
        align-items: flex-start;
        border-left: 3px solid var(--line);
      }
      .persona--activa {
        border-left-color: var(--success);
      }
      .persona--nueva {
        border-left-color: var(--info);
      }
      .persona--sin1er {
        border-left-color: var(--warning);
      }
      .persona--retener {
        border-left-color: var(--info);
      }
      .persona--reactivar {
        border-left-color: var(--warning);
      }
      .persona--deuda {
        border-left-color: var(--danger);
      }

      .persona__av {
        width: 38px;
        height: 38px;
        border-radius: 99px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        background: var(--sand);
        font-weight: 800;
        font-size: 12.5px;
        color: var(--ink-2);
      }
      .persona__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .persona__top {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .persona__hint {
        color: var(--ink-2);
      }
      .persona__alerta {
        margin-top: 6px;
        padding: 6px 10px;
        font-size: 12px;
        align-self: flex-start;
      }
      .persona__cta {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }
      .btn--xs {
        padding: 7px 12px;
        font-size: 12px;
        border-radius: 99px;
      }

      .vacio {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
        padding: 32px 20px;
      }
      .festejo,
      .tipcard {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      @media (max-width: 720px) {
        .persona {
          flex-wrap: wrap;
        }
        .persona__cta {
          width: 100%;
        }
        .persona__cta .btn {
          flex: 1;
        }
      }
    `,
  ],
})
export class GrupoCes {
  protected readonly u = USUARIA_CES;
  protected readonly segmentos = SEGMENTOS_CES;
  protected readonly total = GRUPO_CES.length;

  /** Filtro activo (chips). 'todas' | id de segmento. */
  protected readonly filtro = signal<string>('todas');
  protected readonly visibles = computed<IntegranteCes[]>(() =>
    this.filtro() === 'todas' ? GRUPO_CES : GRUPO_CES.filter((p) => p.estado === this.filtro()),
  );

  protected readonly nCns = GRUPO_CES.filter((p) => p.nivel === 'CNS').length;
  protected readonly nCem = GRUPO_CES.filter((p) => p.nivel === 'CEM').length;
  protected readonly activas = GRUPO_CES.filter((p) => p.estado === 'activa').length;

  protected conteo(id: string): number {
    return GRUPO_CES.filter((p) => p.estado === id).length;
  }

  /** Mapea el tone del segmento al modificador del semáforo (.sem--ok/warn/bad/info). */
  protected tone(t: string): string {
    return t === 'success' ? 'ok' : t === 'warning' ? 'warn' : t === 'danger' ? 'bad' : 'info';
  }
}
