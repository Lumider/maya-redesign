import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Anillo de progreso (dona SVG) — comunica el avance de un vistazo, sin texto "$x/$y".
 * El color refleja estado: verde si ≥ esperado, ámbar si cerca, rojo si lejos.
 */
@Component({
  selector: 'app-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
        aria-hidden="true"
      >
        <circle
          [attr.cx]="c()"
          [attr.cy]="c()"
          [attr.r]="r()"
          fill="none"
          stroke="var(--line)"
          [attr.stroke-width]="stroke()"
        />
        <circle
          [attr.cx]="c()"
          [attr.cy]="c()"
          [attr.r]="r()"
          fill="none"
          [attr.stroke]="color()"
          [attr.stroke-width]="stroke()"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circ()"
          [attr.stroke-dashoffset]="offset()"
          [attr.transform]="'rotate(-90 ' + c() + ' ' + c() + ')'"
          style="transition: stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)"
        />
      </svg>
      <div class="ring__txt">
        <div class="ring__pct">{{ pct() }}%</div>
        @if (label()) {
          <div class="ring__cap">{{ label() }}</div>
        }
      </div>
    </div>
  `,
})
export class Ring {
  readonly pct = input(0);
  readonly size = input(92);
  readonly label = input('');
  /** Umbral esperado (%) para colorear verde/ámbar/rojo. */
  readonly expected = input(70);

  protected readonly stroke = computed(() => Math.max(6, Math.round(this.size() * 0.1)));
  protected readonly c = computed(() => this.size() / 2);
  protected readonly r = computed(() => this.c() - this.stroke() / 2 - 1);
  protected readonly circ = computed(() => 2 * Math.PI * this.r());
  protected readonly offset = computed(
    () => this.circ() * (1 - Math.min(100, Math.max(0, this.pct())) / 100),
  );
  protected readonly color = computed(() => {
    const p = this.pct();
    const e = this.expected();
    if (p >= e) return 'var(--success)';
    if (p >= e * 0.75) return 'var(--warning)';
    return 'var(--danger)';
  });
}
