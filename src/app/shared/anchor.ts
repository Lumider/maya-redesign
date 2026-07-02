import { Directive, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/core';

/**
 * Scroll a una sección dentro de la misma vista, sin navegar.
 * Evita usar href="#id": con <base href> los enlaces de solo-fragmento
 * recargan la app (van al base). Aquí hacemos scrollIntoView programático.
 *
 * Uso: <a class="anchor" appAnchor="qhacer">Qué hacer</a>
 */
@Directive({
  selector: '[appAnchor]',
  host: {
    role: 'button',
    tabindex: '0',
    '(click)': 'go($event)',
    '(keydown.enter)': 'go($event)',
    '(keydown.space)': 'go($event)',
  },
})
export class Anchor {
  readonly appAnchor = input.required<string>();
  private readonly doc = inject(DOCUMENT);

  go(e: Event): void {
    e.preventDefault();
    this.doc
      .getElementById(this.appAnchor())
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
