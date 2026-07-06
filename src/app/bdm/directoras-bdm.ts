import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import {
  CAMPANA_BDM,
  DIRECTORAS_BDM,
  FORMADORA_FACTOR_MRM,
  FRENTES_BDM,
  MEDALLA_LIDERAZGO_UMBRAL,
  USUARIA_BDM,
  cuadranteDe,
  esEjemplo,
  esLider,
  esLiderazgo,
  esPoderosa,
  esPotencialFormadora,
  medallaGpDe,
  type CuadranteLetra,
  type DirectoraBdm,
  type FrenteId,
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
  /* derivados de los frentes propuestos */
  ventaOk: boolean;
  activasOk: boolean;
  metaOk: boolean;
  activasPct: number;
  activasFaltan: number;
  varaFormadora: number;
  formadora: boolean;
  liderSse: boolean;
  ejemplo: boolean;
  liderazgo: boolean;
  poderosa: boolean;
  hijasNePct: number;
}

/** Segmento (tab) de un frente, con su conteo. */
interface Segmento {
  id: string;
  label: string;
}

/**
 * Mis Directoras (BDM) — la herramienta de gestión del portal, con los 5
 * frentes del release 1. "Cuadrantes y Medallas" sigue su spec (Figma
 * 748:18331); los otros 4 (Meta de Venta y Activas, Formaciones, PAR+,
 * Poderosas) son PROPUESTA del prototipo: reutilizan la misma anatomía
 * (tabs de segmento → banner semaforizado con el gap exacto → dato de
 * apoyo) y sus fórmulas citan las cards de Mi Campaña y el glosario.
 *
 * Es la vista accionable de los Plays: 1 (genealogías, cuadrante), 4 (BP,
 * meta), 5 (capitalización, formaciones) y 3 (PAR+/Poderosas). Cada card
 * de indicador de Mi campaña aterriza aquí con su frente preseleccionado
 * (?frente=…), igual que los tiles del Home.
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
          {{ subtitulo() }}
          @if (esPropuesta()) {
            <span
              class="badge badge--neutral"
              title="Diseño propuesto desde la base de conocimiento — spec Figma pendiente"
              >Propuesta</span
            >
          }
        </p>

        <!-- Agregado de cabecera: el dato-resumen del frente activo -->
        <div class="agg card" appReveal>
          <img [src]="agregado().img" alt="" aria-hidden="true" width="34" height="34" />
          <strong>{{ agregado().v }}</strong>
          <span>{{ agregado().t }}</span>
        </div>

        <!-- Los 5 frentes del release: Cuadrante con spec; el resto, propuesta -->
        <nav class="frentes" aria-label="Frentes de gestión">
          @for (fr of frentes; track fr.id) {
            <button
              class="chip"
              [class.chip--active]="frente() === fr.id"
              [attr.aria-pressed]="frente() === fr.id"
              (click)="verFrente(fr.id)"
            >
              {{ fr.etiqueta }}
              @if (fr.propuesta) {
                <span class="tiny">· propuesta</span>
              }
            </button>
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

      <!-- Tabs del frente: trabajar un segmento a la vez -->
      <div class="tabs" role="tablist" [attr.aria-label]="'Segmentos de ' + frente()" appReveal>
        @if (frente() === 'cuadrante') {
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
        } @else {
          @for (s of segmentos(); track s.id) {
            <button
              class="tabs__t"
              role="tab"
              [class.tabs__t--on]="seg() === s.id"
              [attr.aria-selected]="seg() === s.id"
              (click)="seg.set(s.id)"
            >
              {{ s.label }} <span class="tabs__n">{{ conteoSeg()[s.id] }}</span>
            </button>
          }
        }
      </div>

      @if (frente() === 'poderosas') {
        <p class="tiny elegibles">
          Solo Líderes (SSE+) son elegibles: {{ lideresN }} de {{ total }} DIR.
        </p>
      }

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

            @switch (frente()) {
              <!-- ——— Cuadrantes y Medallas (spec Figma 748:18331) ——— -->
              @case ('cuadrante') {
                @if (d.cuadrante === 'A') {
                  <div class="alert alert--success">
                    ✅ Logró CA{{
                      d.medallaGp ? ' y proyecta Medalla ' + d.medallaGp + ' de GP' : ''
                    }}
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
                    🔴 Le faltan S/ {{ d.ventaFaltante | number: '1.0-2' }} y
                    {{ d.ppedFaltantes }} PPED para lograr CA
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
                      {{ d.medallaGp ?? 'aún ninguna' }} ({{ d.campanasCA }} campañas del año en
                      CA).
                    </p>
                  </div>
                </details>
              }

              <!-- ——— Meta de Venta y Activas (propuesta) ——— -->
              @case ('meta') {
                @if (d.metaOk) {
                  <div class="alert alert--success">✅ En meta: venta y activas al día</div>
                } @else if (!d.ventaOk && !d.activasOk) {
                  <div class="alert alert--danger">
                    🔴 Le faltan S/ {{ d.ventaFaltante | number: '1.0-2' }} de venta y
                    {{ d.activasFaltan }} activas para su meta
                  </div>
                } @else if (!d.ventaOk) {
                  <div class="alert alert--warning">
                    ⚠️ Le faltan S/ {{ d.ventaFaltante | number: '1.0-2' }} para su meta de venta
                    (MRM)
                  </div>
                } @else {
                  <div class="alert alert--warning">
                    ⚠️ Le falta{{ d.activasFaltan > 1 ? 'n' : '' }} {{ d.activasFaltan }} activa{{
                      d.activasFaltan > 1 ? 's' : ''
                    }}
                    para su meta
                  </div>
                }
                <div class="metas2">
                  <div class="req__item">
                    <span class="tiny"
                      >Venta GP: S/ {{ d.ventaGP | number: '1.0-2' }} de S/
                      {{ d.mrm | number: '1.0-2' }} (MRM)</span
                    >
                    <div class="progress">
                      <div
                        class="progress__fill"
                        [class.progress__fill--ok]="d.ventaOk"
                        [style.width.%]="d.ventaPct"
                      ></div>
                    </div>
                  </div>
                  <div class="req__item">
                    <span class="tiny"
                      >Activas: {{ d.activas }} de {{ d.activasMeta }} (su BP)</span
                    >
                    <div class="progress">
                      <div
                        class="progress__fill"
                        [class.progress__fill--ok]="d.activasOk"
                        [style.width.%]="d.activasPct"
                      ></div>
                    </div>
                  </div>
                </div>
              }

              <!-- ——— Formaciones / Capitalización (propuesta) ——— -->
              @case ('formaciones') {
                @if (d.formadora) {
                  <div class="alert alert--success">
                    ✅ Potencial formadora:
                    {{
                      d.asps > 0
                        ? 'en CA con ' + d.asps + ' ASP en camino a DIR'
                        : 'su GP supera 1.5× el MRM'
                    }}
                  </div>
                } @else if (d.asps > 0) {
                  <div class="alert alert--warning">
                    ⚠️ Tiene {{ d.asps }} ASP en camino — asegura su CA para capitalizar
                  </div>
                } @else {
                  <div class="alert alert--info">
                    Sin ASP en su GP — trabaja aspirantes en la asesoría (Plays 5–6)
                  </div>
                }
                <div class="hijas tiny">
                  <span
                    >ASP en su GP: <strong>{{ d.asps }}</strong></span
                  >
                  <span
                    >Vara de Capitalización:
                    <strong>S/ {{ d.varaFormadora | number: '1.0-2' }}</strong> (1.5× MRM)</span
                  >
                  <span
                    >Venta GP: <strong>S/ {{ d.ventaGP | number: '1.0-2' }}</strong></span
                  >
                </div>
              }

              <!-- ——— PAR+ · Nivel de Estrella (propuesta) ——— -->
              @case ('par') {
                @if (d.ne >= 3) {
                  <div class="alert alert--success">
                    🌟 Estrella {{ d.ne }} — Hito PAR+ 3 a más: cuenta para Líder Ejemplo
                  </div>
                } @else if (d.ne >= 1) {
                  <div class="alert alert--info">
                    ⭐ Estrella {{ d.ne }} — siguiente hito: ★{{ d.ne + 1 }}
                  </div>
                } @else {
                  <div class="alert alert--warning">
                    ⚠️ Sin Estrella — su primer hito PAR+ la engancha al programa
                  </div>
                }
                <div class="hijas tiny">
                  <span
                    >Hijas con NE: <strong>{{ d.hijasNE }} ({{ d.hijasNePct }}%)</strong></span
                  >
                  <span
                    >Medalla GP proyectada:
                    <strong>{{ d.medallaGp ?? 'aún ninguna' }}</strong></span
                  >
                </div>
              }

              <!-- ——— Líderes Poderosas (propuesta) ——— -->
              @case ('poderosas') {
                @if (d.poderosa) {
                  <div class="alert alert--success">🏆 Líder Poderosa: Ejemplo ✓ y Liderazgo ✓</div>
                } @else if (dimsDe(d) === 1) {
                  <div class="alert alert--warning">
                    ⚠️ En camino: le falta la dimensión {{ d.ejemplo ? 'Liderazgo' : 'Ejemplo' }}
                  </div>
                } @else {
                  <div class="alert alert--danger">
                    🔴 En desarrollo: aún sin las dimensiones Ejemplo y Liderazgo
                  </div>
                }
                <div class="dims">
                  <div class="dim card" [class.dim--ok]="d.ejemplo">
                    <strong>Ejemplo {{ d.ejemplo ? '✓' : '—' }}</strong>
                    <span class="tiny"
                      >Medalla Oro GP:
                      {{ d.medallaGp === 'Oro' ? '✓' : '✗ (' + (d.medallaGp ?? 'ninguna') + ')' }}
                      · PAR+ ★3+: {{ d.ne >= 3 ? '✓' : '✗' }} (★{{ d.ne }})</span
                    >
                  </div>
                  <div class="dim card" [class.dim--ok]="d.liderazgo">
                    <strong>Liderazgo {{ d.liderazgo ? '✓' : '—' }}</strong>
                    <span class="tiny"
                      >Hijas en CA: {{ d.hijasCaPct }}% (≥{{ umbralLiderazgo }}%) · Hijas con NE:
                      {{ d.hijasNePct }}% (≥{{ umbralLiderazgo }}%)</span
                    >
                  </div>
                </div>
              }
            }
          </article>
        } @empty {
          <div class="card pad vacio">
            <span>🔍</span>
            <p>Ninguna Directora en este segmento con esa búsqueda.</p>
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
      .v2-sub .badge {
        margin-left: 8px;
        vertical-align: middle;
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
      /* El "· propuesta" debe leerse también dentro del chip activo (oscuro) */
      .chip--active .tiny {
        color: inherit;
        opacity: 0.8;
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
      .elegibles {
        margin: -8px 0 12px;
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

      /* Meta de Venta y Activas: las dos barras del frente, siempre visibles */
      .metas2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      /* Poderosas: las dos dimensiones del glosario, lado a lado */
      .dims {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .dim {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 14px;
      }
      .dim--ok {
        border-color: var(--success);
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
        .metas2,
        .dims {
          grid-template-columns: 1fr;
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

  protected readonly frente = signal<FrenteId>('cuadrante');
  protected readonly tab = signal<CuadranteLetra>('A');
  /** segmento activo de los frentes propuestos (tabs no-cuadrante) */
  protected readonly seg = signal('no');
  protected readonly q = signal('');

  /** Segmentos (tabs) por frente propuesto; el primero es el foco de gestión. */
  private readonly SEGMENTOS: Record<Exclude<FrenteId, 'cuadrante'>, Segmento[]> = {
    meta: [
      { id: 'no', label: 'No cumplen meta' },
      { id: 'ok', label: 'En meta' },
    ],
    formaciones: [
      { id: 'pot', label: 'Potenciales formadoras' },
      { id: 'asp', label: 'Con ASP por asegurar' },
      { id: 'sin', label: 'Sin ASP' },
    ],
    par: [
      { id: '0', label: '★0 · Sin Estrella' },
      { id: '12', label: '★1–2' },
      { id: '36', label: '★3–6' },
    ],
    poderosas: [
      { id: 'pod', label: 'Poderosas' },
      { id: 'camino', label: 'En camino' },
      { id: 'des', label: 'En desarrollo' },
    ],
  };

  /** Dataset con derivados (fórmulas del doc y del glosario), calculado una vez. */
  private readonly dirs: DirVista[] = DIRECTORAS_BDM.map((d) => ({
    ...d,
    cuadrante: cuadranteDe(d),
    ventaFaltante: Math.max(0, d.mrm - d.ventaGP),
    ppedFaltantes: Math.max(0, d.ppedRequeridos - d.ppedLogrados),
    medallaGp: medallaGpDe(d),
    hijasCaPct: d.hijasTotal ? Math.round((d.hijasCA / d.hijasTotal) * 100) : 0,
    hijasCdPct: d.hijasTotal ? Math.round((d.hijasCD / d.hijasTotal) * 100) : 0,
    ventaPct: Math.min(100, Math.round((d.ventaGP / d.mrm) * 100)),
    ventaOk: d.ventaGP >= d.mrm,
    activasOk: d.activas >= d.activasMeta,
    metaOk: d.ventaGP >= d.mrm && d.activas >= d.activasMeta,
    activasPct: Math.min(100, Math.round((d.activas / d.activasMeta) * 100)),
    activasFaltan: Math.max(0, d.activasMeta - d.activas),
    varaFormadora: d.mrm * FORMADORA_FACTOR_MRM,
    formadora: esPotencialFormadora(d),
    liderSse: esLider(d),
    ejemplo: esEjemplo(d),
    liderazgo: esLiderazgo(d),
    poderosa: esPoderosa(d),
    hijasNePct: d.hijasTotal ? Math.round((d.hijasNE / d.hijasTotal) * 100) : 0,
  }));

  protected readonly conteos = computed(() => {
    const c: Record<CuadranteLetra, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const d of this.dirs) c[d.cuadrante]++;
    return c;
  });

  protected readonly segmentos = computed(() =>
    this.frente() === 'cuadrante'
      ? []
      : this.SEGMENTOS[this.frente() as Exclude<FrenteId, 'cuadrante'>],
  );

  protected readonly conteoSeg = computed(() => {
    const n: Record<string, number> = {};
    for (const s of this.segmentos())
      n[s.id] = this.dirs.filter((d) => this.enSegmento(d, this.frente(), s.id)).length;
    return n;
  });

  protected readonly filtradas = computed(() => {
    const term = this.q().trim().toLowerCase();
    const f = this.frente();
    const s = f === 'cuadrante' ? this.tab() : this.seg();
    return this.dirs.filter(
      (d) => this.enSegmento(d, f, s) && (!term || d.nombre.toLowerCase().includes(term)),
    );
  });

  /* --- agregados de cabecera por frente --- */
  protected readonly proyectanOro = computed(
    () => this.dirs.filter((d) => d.medallaGp === 'Oro').length,
  );
  protected readonly lideresN = this.dirs.filter((d) => d.liderSse).length;
  private readonly enMetaN = this.dirs.filter((d) => d.metaOk).length;
  private readonly formadorasN = this.dirs.filter((d) => d.formadora).length;
  private readonly aspsN = this.dirs.reduce((acc, d) => acc + d.asps, 0);
  private readonly conNeN = this.dirs.filter((d) => d.ne >= 1).length;
  private readonly poderosasN = this.dirs.filter((d) => d.poderosa).length;
  private readonly caminoN = this.dirs.filter(
    (d) => d.liderSse && !d.poderosa && this.dimsDe(d) === 1,
  ).length;

  protected readonly agregado = computed(() => {
    switch (this.frente()) {
      case 'meta':
        return {
          img: 'icons/money-01.png',
          v: `${this.enMetaN}/${this.total} DIR`,
          t: 'en su meta de venta y activas',
        };
      case 'formaciones':
        return {
          img: 'icons/growth.png',
          v: `${this.formadorasN} potenciales formadoras`,
          t: `· ${this.aspsN} ASP en camino a DIR`,
        };
      case 'par':
        return {
          img: 'icons/goals.png',
          v: `${this.conNeN}/${this.total} DIR`,
          t: 'con Nivel de Estrella PAR+ (★1 a más)',
        };
      case 'poderosas':
        return {
          img: 'icons/medal-01.png',
          v: `${this.poderosasN} Líder Poderosa`,
          t: `· ${this.caminoN} en camino (de ${this.lideresN} Líderes)`,
        };
      default:
        return {
          img: 'icons/medal-01.png',
          v: `${this.proyectanOro()}/${this.total} DIR`,
          t: 'proyectan Medalla Oro de GP este año',
        };
    }
  });

  protected readonly subtitulo = computed(() => {
    const f = this.frentes.find((x) => x.id === this.frente());
    return `${f?.etiqueta ?? ''} — ${this.c.campana} · ${this.u.semana} · Actualizado 09:30 a. m.`;
  });

  protected readonly esPropuesta = computed(
    () => this.frentes.find((x) => x.id === this.frente())?.propuesta ?? false,
  );

  constructor() {
    // Deep-links desde el Home y Mi campaña: ?frente=… (+ ?cuad= / ?ne=)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const f = p.get('frente') as FrenteId | null;
      if (f && this.frentes.some((x) => x.id === f)) this.verFrente(f);
      const cuad = p.get('cuad');
      if (cuad === 'A' || cuad === 'B' || cuad === 'C' || cuad === 'D') {
        this.frente.set('cuadrante');
        this.tab.set(cuad);
      }
      const ne = p.get('ne');
      if (f === 'par' && (ne === '0' || ne === '12' || ne === '36')) this.seg.set(ne);
    });
  }

  /** Cambia de frente y aterriza en su segmento-foco (el primero). */
  protected verFrente(f: FrenteId): void {
    this.frente.set(f);
    if (f !== 'cuadrante') this.seg.set(this.SEGMENTOS[f][0].id);
  }

  /** ¿La DIR pertenece al segmento s del frente f? (una sola fuente de verdad) */
  private enSegmento(d: DirVista, f: FrenteId, s: string): boolean {
    switch (f) {
      case 'meta':
        return s === 'ok' ? d.metaOk : !d.metaOk;
      case 'formaciones':
        if (s === 'pot') return d.formadora;
        if (s === 'asp') return !d.formadora && d.asps > 0;
        return !d.formadora && d.asps === 0;
      case 'par':
        if (s === '0') return d.ne === 0;
        if (s === '12') return d.ne >= 1 && d.ne <= 2;
        return d.ne >= 3;
      case 'poderosas':
        if (!d.liderSse) return false;
        if (s === 'pod') return d.poderosa;
        if (s === 'camino') return !d.poderosa && this.dimsDe(d) === 1;
        return !d.poderosa && this.dimsDe(d) === 0;
      default:
        return d.cuadrante === s;
    }
  }

  /** Cuántas dimensiones de Poderosa cumple (Ejemplo + Liderazgo). */
  protected dimsDe(d: DirVista): number {
    return (d.ejemplo ? 1 : 0) + (d.liderazgo ? 1 : 0);
  }

  protected rango(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
