import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'maya-theme';

/** Gestiona el tema claro/oscuro: lo aplica al <html>, lo persiste y respeta la preferencia del sistema. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Tema actual. Se inicializa desde el atributo que ya fijó el script anti-FOUC en index.html. */
  readonly theme = signal<Theme>(this.read());

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#131110' : '#ffffff');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private read(): Theme {
    const fromAttr = document.documentElement.getAttribute('data-theme');
    if (fromAttr === 'dark' || fromAttr === 'light') return fromAttr;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      /* almacenamiento no disponible */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
