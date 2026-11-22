import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface ChipOpcion {
  valor: number | string;
  /** Texto grande del chip ("11", "C12", "CEM Senior"). */
  big: string;
  /** Etiqueta pequeña bajo el texto grande ("Ritmo parejo"). */
  label: string;
}

/**
 * Grupo de chips de selección única del simulador (ritmo, campaña de inicio,
 * nivel). Chips grandes y táctiles (mobile-first): el valor seleccionado se
 * expone como model para re-simular en vivo al cambiar.
 */
@Component({
  selector: 'app-sim-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- "opt", no "chip": styles.scss ya define un .chip global con otro layout -->
    <div
      class="opts"
      [class.opts--texto]="texto()"
      role="radiogroup"
      [attr.aria-label]="etiqueta()"
    >
      @for (o of opciones(); track o.valor) {
        <button
          type="button"
          class="opt"
          role="radio"
          [class.opt--on]="o.valor === valor()"
          [attr.aria-checked]="o.valor === valor()"
          (click)="valor.set(o.valor)"
        >
          <b>{{ o.big }}</b>
          <span>{{ o.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .opts {
        display: flex;
        gap: 8px;
      }
      .opt {
        flex: 1;
        min-width: 0;
        min-height: 60px;
        display: block;
        text-align: center;
        border: 1.5px solid var(--line-strong);
        background: var(--surface);
        border-radius: var(--radius);
        padding: 10px 4px;
        cursor: pointer;
        color: var(--ink);
        transition:
          border-color 0.15s ease,
          background 0.15s ease;
      }
      .opt:hover {
        border-color: var(--brand-500);
      }
      .opt b {
        display: block;
        font-size: 16px;
        font-weight: 800;
        line-height: 1.2;
      }
      .opt span {
        display: block;
        margin-top: 2px;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .opt--on {
        border-color: var(--brand-600);
        background: var(--brand-100);
      }
      .opt--on b {
        color: var(--brand-700);
      }
      .opt--on span {
        color: var(--brand-700);
      }
      /* Variante para textos largos ("Emprendedora"): tipografía menor para
         que el nombre completo quepa en un tercio de pantalla a 360px. */
      .opts--texto .opt b {
        font-size: 13px;
        line-height: 1.25;
      }
    `,
  ],
})
export class SimChips {
  readonly opciones = input.required<ChipOpcion[]>();
  readonly etiqueta = input.required<string>();
  /** true cuando los textos grandes son palabras largas, no números/campañas. */
  readonly texto = input(false);
  readonly valor = model.required<number | string>();
}
