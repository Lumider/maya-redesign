import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import {
  CAMPANA_BDM,
  DIRECTORAS_BDM,
  FRENTES_BDM,
  MEDALLA_LIDERAZGO_UMBRAL,
  USUARIA_BDM,
  cuadranteDe,
  medallaGpDe,
  type CuadranteLetra,
  type DirectoraBdm,
} from '../data/mock-bdm';

/** Directora + campos derivados con las fórmulas del doc (se calculan una vez). */
interface DirVista extends DirectoraBdm {
  cuadrante: CuadranteLetra;
  ventaFaltante: number;
  ppedFaltantes: number;
  medallaGp: 'Oro' | 'Plata' | 'Bronce' | null;
  hijasCaPct: number;
  hijasCdPct: number;
  ventaPct: number;
}

/**
 * Mis Directoras (BDM) — la herramienta de gestión del portal: el frente
 * "Cuadrantes y Medallas" (Vista BDM — Cuadrantes y Medallas, Figma 748:18331,
 * el único de los 5 frentes con spec completa en la base de conocimiento; los
 * otros 4 se muestran "en diseño" hasta tener insumos).
 *
 * Es la vista accionable del Play 1 (análisis de genealogías) y Play 4
 * (acompañamiento al BP): tabs por cuadrante para trabajar un segmento a la
 * vez (foco Delta = D), buscador, y por cada DIR el banner semaforizado con
 * su gap exacto a CA, las medallas proyectadas, el % de hijas en CA/CD y el
 * contacto directo. Fórmulas del doc: cuadrante = f(MRM, PPED); gaps; medalla
 * de Liderazgo ⇐ ≥60% de hijas directas en CA.
 */
@Component({
  selector: 'app-directoras-bdm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">Mis Directoras</h1>
        <p class="v2-sub">
          Cuadrantes y Medallas — {{ c.campana }} · {{ u.semana }} · Actualizado 09:30 a. m.
        </p>

        <!-- Agregado de cabecera del diseño: proyección de Medalla Oro GP -->
        <div class="agg card" appReveal>
          <img src="icons/medal-01.png" alt="" aria-hidden="true" width="34" height="34" />
          <strong>{{ proyectanOro() }}/{{ total }} DIR</strong>
          <span>proyectan Medalla Oro de GP este año</span>
        </div>

        <!-- Los 5 frentes del release: solo Cuadrante tiene spec en la base -->
        <nav class="frentes" aria-label="Frentes de gestión">
          @for (f of frentes; track f.id) {
            <span
              class="chip"
              [class.chip--active]="f.disponible"
              [class.frente--off]="!f.disponible"
              [title]="f.disponible ? '' : 'En diseño — spec pendiente en la base de conocimiento'"
            >
              {{ f.etiqueta }}
              @if (!f.disponible) {
                <span class="tiny">· en diseño</span>
              }
            </span>
          }
        </nav>
      </header>

      <!-- Buscador + Filtrar (transversales del diseño) -->
      <div class="herr" appReveal>
        <label class="buscar">
          <app-icon name="search" [size]="16" />
          <input
            type="search"
            placeholder="Buscar por nombre…"
            [value]="q()"
            (input)="q.set(asValue($event))"
            aria-label="Buscar Directora por nombre"
          />
        </label>
        <button
          class="btn btn--ghost"
          disabled
          title="Criterios de filtro por confirmar en la base de conocimiento"
        >
          <app-icon name="filter" [size]="15" /> Filtrar
        </button>
      </div>

      <!-- Tabs por cuadrante: trabajar un segmento a la vez (foco Delta = D) -->
      <div class="tabs" role="tablist" aria-label="Filtrar por cuadrante" appReveal>
        @for (t of letras; track t) {
          <button
            class="tabs__t"
            role="tab"
            [class.tabs__t--on]="tab() === t"
            [attr.aria-selected]="tab() === t"
            (click)="tab.set(t)"
          >
            Cuadrante {{ t }} <span class="tabs__n">{{ conteos()[t] }}</span>
          </button>
        }
      </div>

      <!-- Lista de Directoras del segmento -->
      <div class="lista">
        @for (d of filtradas(); track d.nombre) {
          <article class="dir card" appReveal>
            <div class="dir__top">
              <div>
                <div class="dir__meta">
                  <span class="badge badge--neutral">{{ d.estatus }}</span>
                  <span class="tiny">{{ d.relacion }} de {{ d.lider }}</span>
                </div>
                <strong class="dir__nombre">{{ d.nombre }}</strong>
              </div>
              <div class="dir__acciones">
                <button
                  class="btn btn--ghost btn--xs"
                  [attr.aria-label]="'Escribir por WhatsApp a ' + d.nombre"
                >
                  WhatsApp
                </button>
                <button class="dir__mas" [attr.aria-label]="'Más acciones para ' + d.nombre">
                  ⋮
                </button>
              </div>
            </div>

            <!-- Banner semaforizado: logro + medalla, o gap exacto a CA -->
            @if (d.cuadrante === 'A') {
              <div class="alert alert--success">
                ✅ Logró CA{{ d.medallaGp ? ' y proyecta Medalla ' + d.medallaGp + ' de GP' : '' }}
              </div>
            } @else if (d.cuadrante === 'B') {
              <div class="alert alert--warning">
                ⚠️ Le falta{{ d.ppedFaltantes > 1 ? 'n' : '' }} {{ d.ppedFaltantes }} PPED para
                lograr CA
              </div>
            } @else if (d.cuadrante === 'C') {
              <div class="alert alert--warning">
                ⚠️ Le faltan S/ {{ d.ventaFaltante | number: '1.0-2' }} para lograr CA
              </div>
            } @else {
              <div class="alert alert--danger">
                🔴 Le faltan S/ {{ d.ventaFaltante | number: '1.0-2' }} y {{ d.ppedFaltantes }} PPED
                para lograr CA
              </div>
            }

            <!-- Hijas CA/CD: insumo de la Medalla de Liderazgo y del foco Delta -->
            <div class="hijas tiny">
              <span
                >Hijas en CA: <strong>{{ d.hijasCA }} ({{ d.hijasCaPct }}%)</strong></span
              >
              <span
                >Hijas en CD: <strong>{{ d.hijasCD }} ({{ d.hijasCdPct }}%)</strong></span
              >
              @if (d.hijasCaPct >= umbralLiderazgo) {
                <span class="badge badge--success">Medalla Liderazgo</span>
              }
            </div>

            <!-- Acordeón del diseño: desglose del avance de requisitos CA -->
            <details class="req">
              <summary>Ver avance de requisitos CA</summary>
              <div class="req__body">
                <div class="req__item">
                  <span class="tiny"
                    >Venta GP: S/ {{ d.ventaGP | number: '1.0-2' }} de S/
                    {{ d.mrm | number: '1.0-2' }} (MRM)</span
                  >
                  <div class="progress">
                    <div
                      class="progress__fill"
                      [class.progress__fill--ok]="d.ventaGP >= d.mrm"
                      [style.width.%]="d.ventaPct"
                    ></div>
                  </div>
                </div>
                <div class="req__item">
                  <span class="tiny"
                    >Primeros pedidos: {{ d.ppedLogrados }} de {{ d.ppedRequeridos }}</span
                  >
                  <div class="dots">
                    @for (n of rango(d.ppedRequeridos); track n) {
                      <span class="dot" [class.dot--on]="n < d.ppedLogrados">{{ n + 1 }}</span>
                    }
                  </div>
                </div>
                <p class="tiny req__med">
                  Medalla de Liderazgo: requiere ≥{{ umbralLiderazgo }}% de hijas en CA — hoy
                  {{ d.hijasCaPct }}%. Medalla de GP proyectada:
                  {{ d.medallaGp ?? 'aún ninguna' }} ({{ d.campanasCA }} campañas del año en CA).
                </p>
              </div>
            </details>
          </article>
        } @empty {
          <div class="card pad vacio">
            <span>🔍</span>
            <p>Ninguna Directora en Cuadrante {{ tab() }} con esa búsqueda.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .pad {
        padding: 18px 20px;
      }
      .agg {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        margin-top: 12px;
        font-size: 14px;
      }
      .frentes {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .frente--off {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .herr {
        display: flex;
        gap: 10px;
        margin: 16px 0 12px;
      }
      .buscar {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--surface);
        border: 1px solid var(--line-strong);
        border-radius: 99px;
        padding: 10px 16px;
        color: var(--ink-3);
      }
      .buscar input {
        border: 0;
        outline: 0;
        background: none;
        font: inherit;
        color: var(--ink);
        width: 100%;
      }

      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .tabs__t {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        border-radius: 99px;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        font-size: 13px;
        font-weight: 700;
        color: var(--ink-2);
        transition: all 0.15s ease;
      }
      .tabs__t--on {
        background: var(--fill-brand);
        border-color: transparent;
        color: #fff;
      }
      .tabs__n {
        background: color-mix(in srgb, currentColor 14%, transparent);
        border-radius: 99px;
        padding: 1px 8px;
        font-size: 11.5px;
      }

      .lista {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dir {
        padding: 16px 18px;
      }
      .dir__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .dir__meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .dir__nombre {
        font-size: 15.5px;
      }
      .dir__acciones {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .btn--xs {
        padding: 7px 14px;
        font-size: 12.5px;
      }
      .dir__mas {
        border: 0;
        background: none;
        color: var(--ink-2);
        font-size: 18px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: var(--radius-s);
      }
      .dir__mas:hover {
        background: var(--sand);
      }
      .dir .alert {
        margin: 10px 0;
      }

      .hijas {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .req {
        margin-top: 10px;
        border-top: 1px solid var(--line);
        padding-top: 10px;
      }
      .req summary {
        cursor: pointer;
        font-size: 13px;
        font-weight: 700;
        color: var(--brand-600);
      }
      .req__body {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px 0 2px;
      }
      .req__item {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .progress__fill--ok {
        background: var(--fill-success);
      }
      .req__med {
        margin: 0;
      }

      .vacio {
        text-align: center;
        color: var(--ink-2);
      }
      .vacio span {
        font-size: 28px;
      }

      @media (max-width: 700px) {
        .herr {
          flex-direction: column;
        }
        .dir__top {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class DirectorasBdm {
  private readonly route = inject(ActivatedRoute);

  protected readonly u = USUARIA_BDM;
  protected readonly c = CAMPANA_BDM;
  protected readonly frentes = FRENTES_BDM;
  protected readonly letras: CuadranteLetra[] = ['A', 'B', 'C', 'D'];
  protected readonly umbralLiderazgo = MEDALLA_LIDERAZGO_UMBRAL;
  protected readonly total = DIRECTORAS_BDM.length;

  protected readonly tab = signal<CuadranteLetra>('A');
  protected readonly q = signal('');

  /** Dataset con derivados (fórmulas del doc), calculado una sola vez. */
  private readonly dirs: DirVista[] = DIRECTORAS_BDM.map((d) => ({
    ...d,
    cuadrante: cuadranteDe(d),
    ventaFaltante: Math.max(0, d.mrm - d.ventaGP),
    ppedFaltantes: Math.max(0, d.ppedRequeridos - d.ppedLogrados),
    medallaGp: medallaGpDe(d),
    hijasCaPct: d.hijasTotal ? Math.round((d.hijasCA / d.hijasTotal) * 100) : 0,
    hijasCdPct: d.hijasTotal ? Math.round((d.hijasCD / d.hijasTotal) * 100) : 0,
    ventaPct: Math.min(100, Math.round((d.ventaGP / d.mrm) * 100)),
  }));

  protected readonly conteos = computed(() => {
    const c: Record<CuadranteLetra, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const d of this.dirs) c[d.cuadrante]++;
    return c;
  });

  protected readonly filtradas = computed(() => {
    const term = this.q().trim().toLowerCase();
    return this.dirs.filter(
      (d) => d.cuadrante === this.tab() && (!term || d.nombre.toLowerCase().includes(term)),
    );
  });

  /** Agregado de cabecera: cuántas DIR proyectan Medalla Oro de GP. */
  protected readonly proyectanOro = computed(
    () => this.dirs.filter((d) => d.medallaGp === 'Oro').length,
  );

  constructor() {
    // El tab inicial puede venir por query param (?cuad=D desde el Home o Mi campaña)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const c = p.get('cuad');
      if (c === 'A' || c === 'B' || c === 'C' || c === 'D') this.tab.set(c);
    });
  }

  protected rango(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
