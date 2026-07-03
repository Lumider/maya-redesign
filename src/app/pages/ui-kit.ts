import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../shared/icon';
import { Icon3d } from '../shared/icon3d';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';

/**
 * UI Kit (styleguide viviente) — ruta oculta /ui, sin enlace en la navegación.
 * Muestra todos los tokens y componentes del sistema en un solo lugar para:
 * evitar duplicados, detectar inconsistencias y alinear al equipo.
 * No es parte del producto: es una herramienta de trabajo del prototipo.
 */
@Component({
  selector: 'app-ui-kit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Icon3d, Ring, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">UI Kit · Maya Redesign</h1>
        <p class="v2-sub">
          Styleguide viviente — todos los tokens y componentes del sistema. Ruta oculta: no aparece
          en la navegación.
        </p>
      </header>

      <!-- Primitives FrYDA -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🧬 Primitives FrYDA</h2>
        <p class="tiny" style="margin:0 0 12px">
          Las 23 familias × 10 tonos del Figma Variables (design-tokens/Primitives.json →
          <code>--fry-familia-tono</code>). Los componentes FrYDA (botón, badge) beben de aquí. Pasa
          el mouse para ver el nombre de cada token.
        </p>
        @for (f of familias; track f) {
          <div class="prim-fila">
            <code class="prim-nombre">{{ f }}</code>
            <div class="prim-tonos">
              @for (t of tonos; track t) {
                <span
                  class="prim-sw"
                  [style.background]="'var(--fry-' + f + '-' + t + ')'"
                  [title]="'--fry-' + f + '-' + t"
                ></span>
              }
            </div>
          </div>
        }
      </section>

      <!-- Tokens de color -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🎨 Tokens de color (redesign)</h2>
        <span class="tiny">Rampa de marca</span>
        <div class="sw-row">
          @for (t of rampa; track t) {
            <div class="sw" [style.background]="'var(' + t + ')'">
              <code>{{ t }}</code>
            </div>
          }
        </div>
        <span class="tiny">Neutros y superficie</span>
        <div class="sw-row">
          @for (t of neutros; track t) {
            <div class="sw sw--line" [style.background]="'var(' + t + ')'">
              <code>{{ t }}</code>
            </div>
          }
        </div>
        <span class="tiny">Estados (texto + fondo suave)</span>
        <div class="sw-row">
          @for (t of estados; track t) {
            <div
              class="sw"
              [style.background]="'var(--' + t + '-bg)'"
              [style.color]="'var(--' + t + ')'"
            >
              <code>--{{ t }}</code>
            </div>
          }
        </div>
      </section>

      <!-- Tipografía, radios y sombras -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🔤 Tipografía · forma · sombra</h2>
        <p style="font-size:26px;font-weight:800;margin:0">Plus Jakarta Sans 800 — títulos</p>
        <p style="font-size:14.5px;margin:4px 0">Cuerpo 14.5px — texto de lectura</p>
        <p class="tiny" style="margin:0 0 14px">tiny 12px — apoyos y pies</p>
        <div class="fila">
          <div class="demo-r" style="border-radius:var(--radius-s)"><code>--radius-s</code></div>
          <div class="demo-r" style="border-radius:var(--radius)"><code>--radius</code></div>
          <div class="demo-r" style="border-radius:var(--radius-l)"><code>--radius-l</code></div>
          <div class="demo-r" style="box-shadow:var(--shadow-s)"><code>--shadow-s</code></div>
          <div class="demo-r" style="box-shadow:var(--shadow)"><code>--shadow</code></div>
          <div class="demo-r" style="box-shadow:var(--shadow-l)"><code>--shadow-l</code></div>
        </div>
      </section>

      <!-- Botones y chips -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🔘 Botones y chips</h2>
        <div class="fila">
          <button class="btn btn--primary">btn--primary</button>
          <button class="btn btn--ghost">btn--ghost</button>
          <button class="btn btn--soft">btn--soft</button>
          <button class="btn btn--primary" style="padding:8px 14px;font-size:13px">btn--sm</button>
        </div>
        <div class="fila">
          <span class="chip">chip</span>
          <span class="chip chip--active">chip--active</span>
          <a class="anchor">anchor</a>
          <a class="anchor anchor--ext">anchor externa</a>
        </div>
      </section>

      <!-- Estados del botón primario (sistema FrYDA, oficial desde C7 2026) -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🔘 Botón primario FrYDA — estados oficiales</h2>
        <p class="tiny" style="margin:0 0 14px">
          Adoptado del Figma FrYDA Foundations (9957-1325): píldora, estados explícitos y focus ring
          azul, con la tipografía del redesign (Plus Jakarta 14/700). Default #C94E22 = AA con
          blanco (4.57:1) ✓ · Reemplazó al botón de radio 8px con degradado.
        </p>

        <span class="vs__label">Vivo — interactúa: hover, clic sostenido y Tab para el foco</span>
        <div class="fila" style="margin:6px 0 14px">
          <button class="btn btn--primary">Button</button>
          <button class="btn btn--primary" disabled>Disabled</button>
        </div>

        <span class="vs__label">Anterior (se conserva como referencia)</span>
        <div class="fila" style="margin:6px 0 14px">
          <button
            class="btn"
            tabindex="-1"
            style="border-radius:var(--radius-s);background:var(--brand-grad-strong);color:#fff"
          >
            Button
          </button>
          <span class="tiny">radio 8px · degradado · reemplazado por FrYDA en C7 2026</span>
        </div>

        <span class="vs__label">Estados (referencia estática)</span>
        <div class="fila" style="margin:6px 0 0">
          <span class="estado">
            <button class="btn btn--primary" tabindex="-1">Button</button>
            <code>default</code>
          </span>
          <span class="estado">
            <button
              class="btn btn--primary"
              tabindex="-1"
              style="background:var(--fryda-btn-hover);color:var(--fryda-btn-hover-content)"
            >
              Button
            </button>
            <code>hover</code>
          </span>
          <span class="estado">
            <button
              class="btn btn--primary"
              tabindex="-1"
              style="background:var(--fryda-btn-pressed);color:var(--fryda-btn-pressed-content)"
            >
              Button
            </button>
            <code>pressed</code>
          </span>
          <span class="estado">
            <button
              class="btn btn--primary"
              tabindex="-1"
              style="box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--fryda-focus-ring)"
            >
              Button
            </button>
            <code>focus</code>
          </span>
          <span class="estado">
            <button class="btn btn--primary" disabled>Button</button>
            <code>disabled</code>
          </span>
        </div>
      </section>

      <!-- Badges (sistema FrYDA) y semáforos -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🏷️ Badges FrYDA y semáforos</h2>
        <p class="tiny" style="margin:0 0 12px">
          Adoptado del Figma FrYDA Foundations (16853-3196): intents en dos variantes — Business
          (suave, default) y System (sólida, veredictos) — con dot opcional. Tipografía del
          redesign. "violet" = intent Reenroll (reactivadas).
        </p>

        <span class="vs__label">Business (default)</span>
        <div class="fila" style="margin:6px 0 12px">
          @for (b of intentsFryda; track b) {
            <span class="badge" [class]="'badge--' + b">{{ b }}</span>
          }
        </div>

        <span class="vs__label">System (sólida) — .badge--sys</span>
        <div class="fila" style="margin:6px 0 12px">
          @for (b of intentsFryda; track b) {
            <span class="badge badge--sys" [class]="'badge--' + b">{{ b }}</span>
          }
        </div>

        <span class="vs__label">Con dot · y tonos propios del redesign</span>
        <div class="fila" style="margin:6px 0 12px">
          <span class="badge badge--success"><i class="badge__dot"></i> con dot</span>
          <span class="badge badge--sys badge--danger"><i class="badge__dot"></i> con dot</span>
          <span class="badge badge--teal">teal</span>
          <span class="badge badge--brand">brand</span>
        </div>

        <span class="vs__label">Candidatos FrYDA para los tonos propios — comparar y decidir</span>
        <div class="fila" style="margin:6px 0 4px; align-items:center">
          <span class="badge badge--teal">teal actual</span>
          <span style="color:var(--ink-3)">→</span>
          <span class="badge badge--teal-fry">teal aegean</span>
          <span class="badge badge--sys badge--teal-fry">teal aegean sys</span>
          <span class="tiny">aegean-10 / aegean-60 · AA 8.4:1 (mint ya es success)</span>
        </div>
        <div class="fila" style="margin:0 0 4px; align-items:center">
          <span class="badge badge--brand">brand actual</span>
          <span style="color:var(--ink-3)">→</span>
          <span class="badge badge--brand-fry">brand orange</span>
          <span class="badge badge--sys badge--brand-fry">brand orange sys</span>
          <span class="badge badge--brand-fry-alt">alt peach</span>
          <span class="tiny">yanbal-orange-20 / -90 · AA 5.2:1 · alternativa peach 4.8:1</span>
        </div>
        <div class="fila" style="margin:0 0 12px; align-items:center">
          <span class="badge badge--neutral">neutral FrYDA</span>
          <span style="color:var(--ink-3)">→</span>
          <span class="badge badge--neutral-suave">A black suave</span>
          <span class="badge badge--sys badge--neutral-suave">A sys</span>
          <span class="badge badge--neutral-slate">B slate</span>
          <span class="badge badge--neutral-bone">C bone</span>
          <span class="tiny"
            >el FrYDA pesa 13.4:1 vs 5–8:1 de sus hermanos · candidatos: 5.5 / 5.6 / 5.8:1</span
          >
        </div>

        <span class="vs__label">Anteriores (se conservan como referencia)</span>
        <div class="fila" style="margin:6px 0 12px">
          @for (t of estados; track t) {
            <span
              class="badge"
              [style.background]="'var(--' + t + '-bg)'"
              [style.color]="'var(--' + t + ')'"
              >{{ t }}</span
            >
          }
          <span class="badge" style="background:var(--sand);color:var(--ink-2)">neutral</span>
          <span class="tiny" style="align-self:center"
            >paleta previa · reemplazada por FrYDA en C7 2026</span
          >
        </div>

        <div class="fila" style="align-items:center">
          @for (s of sems; track s) {
            <span style="display:inline-flex;align-items:center;gap:6px">
              <span class="sem" [class]="'sem--' + s"></span><code>sem--{{ s }}</code>
            </span>
          }
        </div>
      </section>

      <!-- Indicadores de progreso -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">📈 Progreso</h2>
        <div class="fila" style="align-items:center">
          <app-ring [pct]="84" [size]="92" label="ring 84%" [expected]="100" />
          <app-ring [pct]="100" [size]="92" label="ring 100%" [expected]="100" />
          <app-ring [pct]="35" [size]="92" label="ring 35%" [expected]="70" />
          <div style="flex:1;min-width:200px">
            <div class="progress"><div class="progress__fill" style="width:62%"></div></div>
            <span class="tiny">progress 62%</span>
            <div class="progress progress--success" style="margin-top:10px">
              <div class="progress__fill" style="width:100%"></div>
            </div>
            <span class="tiny">progress--success</span>
            <div class="dots" style="margin-top:12px">
              <span class="dot dot--on">1</span><span class="dot dot--on">2</span
              ><span class="dot">3</span><span class="dot">4</span>
            </div>
            <span class="tiny">dots (2 de 4)</span>
          </div>
        </div>
      </section>

      <!-- Cards y alerts -->
      <section class="v2-section" appReveal>
        <h2 class="v2-h">🗂️ Cards, tiles y alerts</h2>
        <div class="tiles" style="grid-template-columns:repeat(3,1fr)">
          <div class="tile card">
            <div class="tile__top">
              <span class="tile__label">tile__label</span><span class="sem sem--ok"></span>
            </div>
            <div class="tile__value">S/ 1,234</div>
            <div class="tile__hint">tile__hint de apoyo</div>
          </div>
          <div class="card card--hover pad">
            <strong>card--hover</strong>
            <p class="tiny">pasa el mouse</p>
          </div>
          <div class="card pad" style="display:flex;flex-direction:column;gap:8px">
            <div class="alert alert--warning">⚠️ alert--warning</div>
            <div class="alert alert--info">💡 alert--info</div>
          </div>
        </div>
      </section>

      <!-- Iconos de línea -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">✒️ app-icon ({{ iconos.length }})</h2>
        <div class="icon-grid">
          @for (i of iconos; track i) {
            <div class="icon-cell">
              <app-icon [name]="i" [size]="22" />
              <code>{{ i }}</code>
            </div>
          }
        </div>
      </section>

      <!-- Ilustraciones 3D (SVG) -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🧊 app-icon3d ({{ iconos3d.length }})</h2>
        <div class="icon-grid icon-grid--l">
          @for (i of iconos3d; track i) {
            <div class="icon-cell">
              <app-icon3d [name]="i" [size]="64" />
              <code>{{ i }}</code>
            </div>
          }
        </div>
      </section>

      <!-- Iconos PNG 3D -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🖼️ Iconos PNG · public/icons ({{ pngs.length }})</h2>
        <div class="icon-grid icon-grid--l">
          @for (p of pngs; track p) {
            <div class="icon-cell">
              <img [src]="'icons/' + p + '.png'" [alt]="p" width="56" height="56" />
              <code>{{ p }}</code>
            </div>
          }
        </div>
      </section>

      <!-- Componentes mayores e inventario -->
      <section class="card pad v2-section" appReveal>
        <h2 class="v2-h">🧩 Componentes mayores y páginas</h2>
        <ul class="inv">
          @for (c of inventario; track c.nombre) {
            <li>
              <code>{{ c.nombre }}</code> — {{ c.donde }}
            </li>
          }
        </ul>
        <p class="tiny" style="margin:12px 0 0">
          El conmutador de estatus (abajo a la izquierda) y la puerta de acceso son componentes
          vivos de esta misma página — ya los estás viendo.
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .pad {
        padding: 18px 20px;
      }
      .fila {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: flex-start;
        margin: 10px 0 16px;
      }
      code {
        font-size: 11px;
        background: color-mix(in srgb, var(--ink) 6%, transparent);
        padding: 1px 6px;
        border-radius: 5px;
      }

      .sw-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 8px 0 16px;
      }
      .sw {
        min-width: 108px;
        height: 56px;
        border-radius: var(--radius-s);
        display: flex;
        align-items: flex-end;
        padding: 6px;
      }
      .sw code {
        background: var(--surface);
      }
      .sw--line {
        border: 1px solid var(--line);
      }

      .demo-r {
        width: 108px;
        height: 64px;
        border: 1px solid var(--line-strong);
        background: var(--surface);
        display: grid;
        place-items: center;
      }

      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 10px;
      }
      .icon-grid--l {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      }
      .icon-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 6px;
        border: 1px solid var(--line);
        border-radius: var(--radius-s);
        text-align: center;
      }

      .inv {
        margin: 0;
        padding-left: 18px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13.5px;
      }

      /* Primitives FrYDA */
      .prim-fila {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 3px 0;
      }
      .prim-nombre {
        width: 190px;
        flex-shrink: 0;
        text-align: right;
      }
      .prim-tonos {
        display: flex;
        gap: 4px;
        flex: 1;
      }
      .prim-sw {
        flex: 1;
        max-width: 44px;
        height: 22px;
        border-radius: 5px;
        border: 1px solid var(--line);
      }
      @media (max-width: 720px) {
        .prim-nombre {
          width: 120px;
          font-size: 9.5px;
        }
      }

      /* Comparativa de botones */
      .vs__label {
        display: block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ink-3);
        margin-top: 6px;
      }
      .estado {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class UiKitPage {
  protected readonly rampa = [
    '--brand-50',
    '--brand-100',
    '--brand-200',
    '--brand-300',
    '--brand-400',
    '--brand-500',
    '--brand-600',
    '--brand-700',
    '--brand-800',
  ];
  protected readonly neutros = [
    '--bg',
    '--sand',
    '--surface',
    '--line',
    '--line-strong',
    '--ink-3',
    '--ink-2',
    '--ink',
  ];
  protected readonly estados = ['success', 'warning', 'danger', 'info', 'teal', 'violet'];
  /** Primitives FrYDA: 23 familias × tonos 10–100 (fryda-primitives.scss). */
  protected readonly familias = [
    'yanbal-orange',
    'yanbal-orange-overlay',
    'yanbal-black',
    'yanbal-black-overlay',
    'aegean',
    'blue',
    'bone',
    'coconut',
    'crimson',
    'green',
    'indigo',
    'magenta',
    'marigold',
    'mint',
    'olive',
    'peach',
    'pearl',
    'pink',
    'pistachio',
    'purple',
    'salt',
    'slate',
    'wine',
  ];
  protected readonly tonos = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  /** Intents FrYDA del badge (Business y System). */
  protected readonly intentsFryda = ['neutral', 'success', 'warning', 'danger', 'info', 'violet'];
  protected readonly sems = ['ok', 'warn', 'bad', 'info'];

  protected readonly iconos = [
    'home',
    'star',
    'users',
    'sparkles',
    'cap',
    'heart-plus',
    'cart',
    'bell',
    'search',
    'chevron-right',
    'chevron-down',
    'menu',
    'x',
    'external',
    'box',
    'chart',
    'file',
    'calendar',
    'wallet',
    'alert',
    'check',
    'filter',
    'sort',
    'gift',
    'plane',
    'trending',
    'arrow-right',
    'arrow-left',
    'target',
    'sun',
    'moon',
  ];
  protected readonly iconos3d = ['bag', 'chart', 'gift', 'plane', 'rocket', 'heart', 'cap'];
  protected readonly pngs = [
    'check',
    'goals',
    'medal-01',
    'money-01',
    'megaphone',
    'growth',
    'alert-02',
    'airplane-01',
    'file',
    'searching',
  ];

  /** Inventario de componentes/directivas mayores y dónde viven. */
  protected readonly inventario = [
    { nombre: '<app-ring>', donde: 'shared/ring — anillo de progreso con umbral de color' },
    { nombre: '<app-icon> / <app-icon3d>', donde: 'shared/icon, shared/icon3d — iconografía SVG' },
    { nombre: '<app-loader>', donde: 'shared/loader — pantalla de entrada con fotos' },
    { nombre: '<app-acceso-gate>', donde: 'shared/acceso-gate — puerta de clave de la demo' },
    {
      nombre: '<app-estatus-switch-global>',
      donde: 'shared/estatus-switch-global — conmutador CNS→REG',
    },
    {
      nombre: 'appReveal / appAnchor',
      donde: 'shared/reveal, shared/anchor — directivas de scroll',
    },
    { nombre: 'InicioHub / CampanaHub', donde: 'nueva/hubs — alternan página según audiencia' },
    {
      nombre: 'Páginas Emprendedora (5)',
      donde: 'ces/ — inicio, campana, grupo, incorpora, camino',
    },
    {
      nombre: 'Páginas Directora (5)',
      donde: 'nueva/ — inicio, negocio, campana, equipo, carrera',
    },
    { nombre: 'Vista actual (8 páginas)', donde: 'pages/ — réplica de la Maya vigente + esta /ui' },
  ];
}
