import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

/** Un nivel del breadcrumb. Sin `link` = nivel actual (no navegable, en negrita). */
export interface Miga {
  label: string;
  /** routerLink del nivel; si falta, es la página actual. */
  link?: string;
}

/**
 * Breadcrumb — componente FrYDA (Figma Foundations 16355-636, "Breadcrumb").
 *
 * Navegación jerárquica secundaria: home + niveles separados por chevron. El
 * último nivel es el actual (negrita, no navegable); los intermedios son
 * enlaces. Con muchos niveles colapsa los del medio en "…", igual que la
 * variante "+4 levels" del design system.
 *
 * ⚠️ Desktop-only por decisión de FrYDA: en móvil la jerarquía se resuelve con
 * el back nativo, así que el componente se oculta bajo 720px.
 *
 * Tipografía del redesign (Plus Jakarta 14/20, +0.2px); color = `--ink`
 * (yanbal-black-100), como en la spec. Uso:
 * `<app-breadcrumb [items]="[{label:'Mi negocio',link:'/n/negocio'},{label:'Cuadrante'}]" />`
 */
@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <nav class="bc" [attr.aria-label]="ariaLabel()">
      <ol class="bc__list">
        <!-- Home siempre primero -->
        <li class="bc__item">
          <a class="bc__link bc__home" [routerLink]="homeLink()">
            <app-icon name="home" [size]="16" />
            <span>{{ homeLabel() }}</span>
          </a>
        </li>

        @for (m of visibles(); track $index) {
          <li class="bc__item">
            <app-icon class="bc__sep" name="chevron-right" [size]="16" aria-hidden="true" />
            @if (m.ellipsis) {
              <span class="bc__ellipsis" aria-hidden="true">…</span>
            } @else if (m.current) {
              <span class="bc__current" aria-current="page">{{ m.label }}</span>
            } @else {
              <a class="bc__link" [routerLink]="m.link">{{ m.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      /* Desktop-only (decisión FrYDA): oculto en móvil. */
      @media (max-width: 720px) {
        :host {
          display: none;
        }
      }
      .bc__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .bc__item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      /* Chevron separador: tenue para no competir con los rótulos. */
      .bc__sep {
        color: var(--ink-3);
        flex-shrink: 0;
      }
      .bc__link,
      .bc__current,
      .bc__ellipsis {
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.2px;
        color: var(--ink);
      }
      /* Niveles navegables: peso normal, con afordancia al pasar el mouse. */
      .bc__link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        max-width: 144px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-radius: var(--radius-s);
        transition: color 0.15s ease;
      }
      .bc__home {
        flex-shrink: 0;
      }
      .bc__home span,
      .bc__link:not(.bc__home) {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .bc__link:hover {
        color: var(--brand-600);
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      /* Nivel actual: negrita (Demi en FrYDA), no navegable. */
      .bc__current {
        font-weight: 700;
        max-width: 144px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .bc__ellipsis {
        color: var(--ink-3);
      }
    `,
  ],
})
export class Breadcrumb {
  /** Niveles después del home; el último (sin link) es la página actual. */
  readonly items = input<Miga[]>([]);
  /** Ruta y rótulo del home (primer nivel, siempre presente). */
  readonly homeLink = input('/n/inicio');
  readonly homeLabel = input('Ir al inicio');
  /** Cuántos niveles mostrar antes de colapsar el medio en "…". */
  readonly maxNiveles = input(3);

  protected readonly ariaLabel = input('Ruta de navegación');

  /** Niveles a pintar: si superan `maxNiveles`, colapsa el medio en "…"
   *  (primeros dos · … · último), como la variante "+4 levels" de FrYDA. */
  protected readonly visibles = computed(() => {
    const its = this.items();
    const n = its.length;
    const marca = (m: Miga, i: number) => ({ ...m, current: i === n - 1, ellipsis: false });
    if (n <= this.maxNiveles()) return its.map(marca);
    return [
      marca(its[0], 0),
      marca(its[1], 1),
      { label: '…', current: false, ellipsis: true },
      marca(its[n - 1], n - 1),
    ];
  });
}
