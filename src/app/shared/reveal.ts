import { Directive, DOCUMENT, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

/**
 * Scroll-reveal estilo OUTFIT, sin librerías. Cada elemento con [appReveal]
 * arranca oculto/desplazado y se revela al entrar en viewport (una sola vez)
 * con la curva y timing del sitio de referencia (1s expo.out, stagger 0.1s).
 *
 * Clave del flujo: en la carga inicial NO observamos hasta que el loader marca
 * `loaded` (al 50% del barrido de su cortina). Sin esta espera, los elementos
 * se animarían tapados por la cortina y al levantarse ya estarían quietos.
 * Los elementos visibles en ese momento entran en lote con stagger automático.
 *
 * Respeta prefers-reduced-motion (se muestra de inmediato).
 *
 * Uso: <section appReveal [revealDelay]="80"> … </section>
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal implements OnInit, OnDestroy {
  /** Retraso opcional (ms); si no se indica, el stagger de lote lo resuelve. */
  readonly revealDelay = input(0);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private observer?: IntersectionObserver;
  private onLoaded?: () => void;

  /** Stagger automático: elementos revelados casi a la vez se escalonan 90ms. */
  private static batchAt = 0;
  private static batchIdx = 0;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('reveal');

    const reduced =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal--in');
      return;
    }

    if (this.doc.documentElement.classList.contains('loaded')) {
      this.observar(node);
    } else {
      // Carga inicial: esperamos al loader (evento emitido al 50% de su cortina)
      this.onLoaded = () => this.observar(node);
      this.doc.defaultView?.addEventListener('maya-loaded', this.onLoaded, { once: true });
    }
  }

  private observar(node: HTMLElement): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const now = performance.now();
          if (now - Reveal.batchAt > 350) Reveal.batchIdx = 0;
          Reveal.batchAt = now;
          const delay = this.revealDelay() || Reveal.batchIdx++ * 90;
          node.style.transitionDelay = `${delay}ms`;
          node.classList.add('reveal--in');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.onLoaded) {
      this.doc.defaultView?.removeEventListener('maya-loaded', this.onLoaded);
    }
  }
}
