import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Icon } from '../shared/icon';
import { CONSULTORAS, Consultora } from '../data/mock';

const FILTROS = ['Todas', 'Activas', 'En riesgo', 'Nuevas', 'Con deuda'] as const;
type Filtro = (typeof FILTROS)[number];

const ESTADO_FILTRO: Record<Exclude<Filtro, 'Todas'>, Consultora['estado']> = {
  Activas: 'activa',
  'En riesgo': 'riesgo',
  Nuevas: 'nueva',
  'Con deuda': 'deuda',
};

@Component({
  selector: 'app-grupo-personal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, Icon],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <h1 class="page-title">Grupo Personal</h1>
          <p class="muted">{{ filtradas().length }} consultoras · campaña C6</p>
        </div>
        <div class="tabs">
          <button class="tabs__tab" [class.tabs__tab--active]="vista() === 'estructura'" (click)="vista.set('estructura')">
            <app-icon name="users" [size]="16" /> Mi estructura
          </button>
          <button class="tabs__tab" [class.tabs__tab--active]="vista() === 'reportes'" (click)="vista.set('reportes')">
            <app-icon name="file" [size]="16" /> Reportes
          </button>
        </div>
      </header>

      <!-- Buscador + filtros -->
      <div class="toolbar">
        <label class="search">
          <app-icon name="search" [size]="18" />
          <input
            type="search"
            placeholder="Buscar por nombre…"
            [value]="busqueda()"
            (input)="busqueda.set(asValue($event))"
          />
        </label>
        <div class="filters">
          @for (f of filtros; track f) {
            <button class="chip" [class.chip--active]="filtro() === f" (click)="filtro.set(f)">{{ f }}</button>
          }
        </div>
      </div>

      @if (vista() === 'estructura') {
        <div class="list">
          @for (c of filtradas(); track c.nombre) {
            <article class="row card card--hover" [class]="'row--' + c.estado">
              <div class="row__avatar">{{ iniciales(c.nombre) }}</div>
              <div class="row__main">
                <div class="row__name">
                  {{ c.nombre }}
                  <span class="badge" [class]="'badge ' + nivelBadge(c.nivel)">{{ c.nivel }}</span>
                  @if (c.estado === 'nueva') {
                    <span class="badge badge--violet">Nueva</span>
                  }
                  @if (c.estado === 'deuda') {
                    <span class="badge badge--danger">Deuda</span>
                  }
                </div>
                <div class="row__sales">
                  <span>Venta personal: <strong>\${{ c.ventaPersonal | number }}</strong></span>
                  @if (c.ventaGrupal) {
                    <span>Venta grupal: <strong>\${{ c.ventaGrupal | number }}</strong></span>
                  }
                </div>
              </div>
              <app-icon class="row__arrow" name="chevron-right" [size]="18" />
            </article>
          } @empty {
            <div class="empty card">
              <span>🔍</span>
              <p>No encontramos consultoras con ese criterio.</p>
            </div>
          }
        </div>
      } @else {
        <div class="reports">
          @for (r of reportes; track r.titulo) {
            <a class="report card card--hover">
              <span class="report__icon"><app-icon [name]="r.icon" [size]="20" /></span>
              <div>
                <div class="report__title">{{ r.titulo }}</div>
                <div class="tiny">{{ r.desc }}</div>
              </div>
              <app-icon class="row__arrow" name="external" [size]="16" />
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .head p { margin: 4px 0 0; }

      .tabs { display: inline-flex; background: var(--sand); border-radius: 99px; padding: 4px; gap: 2px; }
      .tabs__tab {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: none;
        border-radius: 99px;
        padding: 8px 18px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--ink-2);
      }
      .tabs__tab--active { background: var(--ink); color: #fff; }

      .toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 99px;
        padding: 11px 18px;
        color: var(--ink-3);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .search:focus-within { border-color: var(--brand-400); box-shadow: 0 0 0 3px var(--brand-100); }
      .search input {
        border: 0;
        outline: 0;
        background: none;
        font: inherit;
        color: var(--ink);
        width: 100%;
      }
      .filters { display: flex; gap: 8px; flex-wrap: wrap; }

      .list { display: flex; flex-direction: column; gap: 10px; }
      .row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        border-left: 4px solid var(--line);
        cursor: pointer;
      }
      .row--activa { border-left-color: var(--success); }
      .row--riesgo { border-left-color: var(--warning); }
      .row--nueva { border-left-color: var(--violet); }
      .row--deuda { border-left-color: var(--danger); }

      .row__avatar {
        width: 42px;
        height: 42px;
        flex: 0 0 42px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        background: var(--sand);
        color: var(--ink-2);
        font-weight: 700;
        font-size: 14px;
      }
      .row__main { min-width: 0; }
      .row__name {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-weight: 700;
        font-size: 14.5px;
      }
      .row__sales { display: flex; gap: 18px; font-size: 13px; color: var(--ink-2); margin-top: 3px; flex-wrap: wrap; }
      .row__arrow { margin-left: auto; color: var(--ink-3); }

      .empty { padding: 48px; text-align: center; color: var(--ink-2); }
      .empty span { font-size: 34px; }
      .empty p { margin: 8px 0 0; }

      .reports { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
      .report { display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; }
      .report__icon {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: var(--brand-50);
        color: var(--brand-600);
      }
      .report__title { font-weight: 700; font-size: 14px; }
    `,
  ],
})
export class GrupoPersonalPage {
  protected readonly filtros = FILTROS;
  protected readonly vista = signal<'estructura' | 'reportes'>('estructura');
  protected readonly busqueda = signal('');
  protected readonly filtro = signal<Filtro>('Todas');

  protected readonly reportes = [
    { titulo: 'Reporte de actividad', desc: 'Pedidos y actividad por consultora', icon: 'chart' },
    { titulo: 'Estado de deuda', desc: 'Saldos y vencimientos del grupo', icon: 'wallet' },
    { titulo: 'Incorporaciones', desc: 'Nuevas consultoras por campaña', icon: 'heart-plus' },
    { titulo: 'Reporte PAR+', desc: 'Avance hacia tu sueño PAR+', icon: 'plane' },
  ];

  protected readonly filtradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const f = this.filtro();
    return CONSULTORAS.filter((c) => {
      if (q && !c.nombre.toLowerCase().includes(q)) return false;
      if (f !== 'Todas' && c.estado !== ESTADO_FILTRO[f]) return false;
      return true;
    });
  });

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected iniciales(nombre: string): string {
    const partes = nombre.split(' ');
    return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
  }

  protected nivelBadge(nivel: Consultora['nivel']): string {
    switch (nivel) {
      case 'CEM': return 'badge--warning';
      case 'CES': return 'badge--info';
      case 'ASP': return 'badge--violet';
      default: return 'badge--teal';
    }
  }
}
