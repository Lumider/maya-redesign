import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'maya-acceso';

/**
 * Hash SHA-256 de la clave de acceso a la demo. Para cambiar la clave:
 *   echo -n "nueva-clave" | shasum -a 256
 * y pegar el resultado aquí. La clave nunca viaja ni se guarda en texto plano.
 *
 * ⚠️ Esto es una puerta de cortesía para una demo con datos FICTICIOS, no
 * seguridad real: el bundle es público. Si algún día hay datos reales,
 * migrar a protección en el borde (p. ej. Cloudflare Access).
 */
const CLAVE_HASH = '18c2905a2dc7161295f95f76e60f8d1bb0ed2b3e4ba85f7b0d6288192cfb35fb';

/** Controla el acceso a la demo: valida la clave y recuerda la sesión en el dispositivo. */
@Injectable({ providedIn: 'root' })
export class AccesoService {
  readonly autorizado = signal<boolean>(this.read());

  /** Valida la clave; si es correcta, autoriza y persiste. Devuelve el resultado. */
  async entrar(clave: string): Promise<boolean> {
    const ok = (await sha256(clave.trim())) === CLAVE_HASH;
    if (ok) {
      this.autorizado.set(true);
      try {
        localStorage.setItem(STORAGE_KEY, CLAVE_HASH);
      } catch {
        /* almacenamiento no disponible */
      }
    }
    return ok;
  }

  private read(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === CLAVE_HASH;
    } catch {
      return false;
    }
  }
}

async function sha256(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
