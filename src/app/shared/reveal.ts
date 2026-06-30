import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

/**
 * Scroll-reveal sutil y rápido, sin librerías. Cada elemento con [appReveal]
 * arranca oculto/desplazado y se revela al entrar en viewport (una sola vez).
 * Respeta prefers-reduced-motion (se muestra de inmediato).
 *
 * Uso: <section appReveal [revealDelay]="80"> … </section>
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal implements OnInit, OnDestroy {
  /** Retraso opcional (ms) para escalonar bloques contiguos. */
  readonly revealDelay = input(0);

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('reveal');
    if (this.revealDelay()) node.style.transitionDelay = `${this.revealDelay()}ms`;

    const reduced =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal--in');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            node.classList.add('reveal--in');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
