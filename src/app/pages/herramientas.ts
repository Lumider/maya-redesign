import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../shared/icon';
import { HERRAMIENTAS, SUBCATEGORIAS } from '../data/mock';

const CATEGORIAS = [
  { nombre: 'Productos', emoji: '🧴', tag: '', tone: 'brand' },
  { nombre: 'Ofertas', emoji: '📣', tag: 'Vende', tone: 'teal' },
  { nombre: 'Ganancias', emoji: '🏅', tag: 'Gana', tone: 'warning' },
  { nombre: 'Negocio', emoji: '💼', tag: 'Crece', tone: 'info' },
] as const;

@Component({
  selector: 'app-herramientas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="page">
      <h1 class="page-title">Mis Herramientas</h1>
      <p class="muted" style="margin: 6px 0 22px">Materiales listos para compartir y hacer crecer tu negocio.</p>

      <label class="search">
        <app-icon name="search" [size]="18" />
        <input
          type="search"
          aria-label="Buscar material"
          placeholder="Buscar material…"
          [value]="busqueda()"
          (input)="busqueda.set(asValue($event))"
        />
      </label>

      <!-- Categorías -->
      <div class="cats">
        @for (c of categorias; track c.nombre) {
          <button class="cat card card--hover" [class.cat--active]="categoria() === c.nombre" (click)="categoria.set(c.nombre)">
            <span class="cat__emoji">{{ c.emoji }}</span>
            <span class="cat__name">{{ c.nombre }}</span>
            @if (c.tag) {
              <span class="badge" [class]="'badge badge--' + c.tone">{{ c.tag }}</span>
            }
          </button>
        }
      </div>

      <!-- Subcategorías -->
      <div class="subcats">
        @for (s of subcategorias; track s) {
          <button class="chip" [class.chip--active]="subcategoria() === s" (click)="toggleSub(s)">{{ s }}</button>
        }
      </div>

      <!-- Galería -->
      <div class="gallery">
        @for (h of filtradas(); track h.titulo) {
          <a class="item card--hover">
            <div class="item__cover" [style.background]="h.gradiente">
              <span>{{ h.emoji }}</span>
            </div>
            <div class="item__title">{{ h.titulo }}</div>
            <div class="tiny">{{ h.categoria }} · {{ h.subcategoria }}</div>
          </a>
        } @empty {
          <div class="empty card">
            <span>🗂️</span>
            <p>No hay materiales para ese filtro todavía.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 99px;
        padding: 12px 18px;
        color: var(--ink-3);
        margin-bottom: 18px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .search:focus-within { border-color: var(--brand-400); box-shadow: 0 0 0 3px var(--brand-100); }
      .search input { border: 0; outline: 0; background: none; font: inherit; color: var(--ink); width: 100%; }

      .cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
      .cat {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        font-weight: 700;
        font-size: 14px;
        color: var(--ink-2);
        cursor: pointer;
      }
      .cat__emoji { font-size: 22px; }
      .cat__name { flex: 1; text-align: left; }
      .cat--active {
        border-color: var(--brand-500);
        background: var(--brand-50);
        color: var(--brand-700);
        box-shadow: 0 0 0 3px var(--brand-100);
      }

      .subcats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }

      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
      .item { border-radius: var(--radius); cursor: pointer; }
      .item__cover {
        height: 190px;
        border-radius: var(--radius);
        display: grid;
        place-items: center;
        font-size: 44px;
        box-shadow: var(--shadow-s);
      }
      .item__title { font-size: 13.5px; font-weight: 700; margin: 10px 0 2px; padding: 0 4px; }
      .item .tiny { padding: 0 4px; }

      .empty { grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--ink-2); }
      .empty span { font-size: 34px; }
      .empty p { margin: 8px 0 0; }

      @media (max-width: 900px) {
        .cats { grid-template-columns: repeat(2, 1fr); }
      }
    `,
  ],
})
export class HerramientasPage {
  protected readonly categorias = CATEGORIAS;
  protected readonly subcategorias = SUBCATEGORIAS;
  protected readonly busqueda = signal('');
  protected readonly categoria = signal<string>('Productos');
  protected readonly subcategoria = signal<string | null>(null);

  protected readonly filtradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const cat = this.categoria();
    const sub = this.subcategoria();
    return HERRAMIENTAS.filter((h) => {
      if (q) return h.titulo.toLowerCase().includes(q);
      if (cat && h.categoria !== cat) return false;
      if (sub && h.subcategoria !== sub) return false;
      return true;
    });
  });

  protected toggleSub(s: string): void {
    this.subcategoria.update((cur) => (cur === s ? null : s));
  }

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
