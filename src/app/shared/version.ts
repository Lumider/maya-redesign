import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'maya-version';

/**
 * Conmuta entre la versión actual del portal y la "Vista nueva (beta)".
 * La actual es la predeterminada; la nueva es opt-in y se persiste en localStorage.
 * La preferencia es independiente de la ruta — el shell decide qué navegación
 * mostrar según `nueva()`, y App sincroniza la ruta al alternar / al cargar.
 */
@Injectable({ providedIn: 'root' })
export class VersionService {
  readonly nueva = signal<boolean>(this.read());

  set(v: boolean): void {
    this.nueva.set(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? 'nueva' : 'actual');
    } catch {
      /* almacenamiento no disponible */
    }
  }

  toggle(): boolean {
    const v = !this.nueva();
    this.set(v);
    return v;
  }

  private read(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'nueva';
    } catch {
      return false;
    }
  }
}
