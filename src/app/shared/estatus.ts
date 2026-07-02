import { Injectable, signal } from '@angular/core';

/** Estatus de la Audiencia Consultoras/Emprendedoras que la demo puede encarnar. */
export type Estatus = 'CNS' | 'CEM' | 'CES' | 'ASP';

export const ESTATUS_ORDEN: Estatus[] = ['CNS', 'CEM', 'CES', 'ASP'];

const STORAGE_KEY = 'maya-estatus';

/**
 * Estatus activo de la vista Emprendedora (demo). Permite "encarnar" a la misma
 * usuaria en cada paso de su carrera y ver qué cambia en la app: navegación,
 * indicadores, programas disponibles y requisitos del siguiente paso.
 */
@Injectable({ providedIn: 'root' })
export class EstatusService {
  readonly estatus = signal<Estatus>(this.read());

  set(e: Estatus): void {
    this.estatus.set(e);
    try {
      localStorage.setItem(STORAGE_KEY, e);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private read(): Estatus {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'CNS' || v === 'CEM' || v === 'CES' || v === 'ASP') return v;
    } catch {
      /* almacenamiento no disponible */
    }
    return 'CES';
  }
}

const STORAGE_KEY_DIR = 'maya-estatus-dir';

/**
 * Estatus activo de la vista Líder (demo) — Audiencia Directoras.
 * Mismo patrón que EstatusService pero para la escalera JNR → SNR → SSE → REG.
 */
@Injectable({ providedIn: 'root' })
export class EstatusDirService {
  readonly estatus = signal<'JNR' | 'SNR' | 'SSE' | 'REG'>(this.read());

  set(e: 'JNR' | 'SNR' | 'SSE' | 'REG'): void {
    this.estatus.set(e);
    try {
      localStorage.setItem(STORAGE_KEY_DIR, e);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private read(): 'JNR' | 'SNR' | 'SSE' | 'REG' {
    try {
      const v = localStorage.getItem(STORAGE_KEY_DIR);
      if (v === 'JNR' || v === 'SNR' || v === 'SSE' || v === 'REG') return v;
    } catch {
      /* almacenamiento no disponible */
    }
    return 'SSE';
  }
}
