import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Icon } from '../shared/icon';

interface AppExterna {
  titulo: string;
  desc: string;
  emoji: string;
  url: string;
}

const APPS: Record<string, AppExterna> = {
  'mis-pedidos': {
    titulo: 'Mis Pedidos',
    desc: 'Arma y consulta tus pedidos en la tienda B2B de Yanbal.',
    emoji: '🛍️',
    url: 'https://pedidos.yanbal.com',
  },
  'status-pedidos': {
    titulo: 'Reporte de Status de Pedidos',
    desc: 'Sigue el estado de facturación y entrega de cada pedido.',
    emoji: '🚚',
    url: 'https://misreportes.yanbal.com',
  },
  par: {
    titulo: 'Reporte PAR+',
    desc: 'Tu avance hacia el sueño PAR+ y los viajes de reconocimiento.',
    emoji: '🌴',
    url: 'https://misreportes.yanbal.com',
  },
  reportes: {
    titulo: 'Reportes',
    desc: 'Todos los reportes de tu negocio en un solo lugar.',
    emoji: '📈',
    url: 'https://misreportes.yanbal.com',
  },
  cursos: {
    titulo: 'Mis Cursos',
    desc: 'Capacítate a tu ritmo en la plataforma Yanbal te Entrena.',
    emoji: '🎓',
    url: 'https://yanbalteentrena.yanbal.com',
  },
  incorporacion: {
    titulo: 'Incorporación',
    desc: 'Incorpora nuevas consultoras a tu grupo en línea.',
    emoji: '🤝',
    url: 'https://incorporate.yanbal.com',
  },
};

@Component({
  selector: 'app-externa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="page wrap">
      <div class="card box">
        <div class="box__emoji">{{ app().emoji }}</div>
        <h1>{{ app().titulo }}</h1>
        <p class="muted">{{ app().desc }}</p>
        <p class="tiny">
          Esta sección vive en una aplicación externa de Yanbal y se abre con tu misma sesión (SSO).
          En el prototipo se muestra como acceso directo.
        </p>
        <div class="box__actions">
          <a class="btn btn--primary" [href]="app().url" target="_blank" rel="noopener">
            Abrir {{ app().titulo }}
            <app-icon name="external" [size]="16" />
          </a>
          <a class="btn btn--ghost" routerLink="/inicio">
            <app-icon name="arrow-left" [size]="16" />
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap { display: grid; place-items: center; min-height: 60vh; }
      .box { max-width: 480px; padding: 40px; text-align: center; }
      .box__emoji { font-size: 56px; }
      .box h1 { font-size: 26px; margin: 12px 0 6px; }
      .box p { margin: 0 0 10px; }
      .box__actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
    `,
  ],
})
export class ExternaPage {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: '',
  });

  protected readonly app = computed<AppExterna>(
    () =>
      APPS[this.slug()] ?? {
        titulo: 'Aplicación externa',
        desc: 'Este módulo vive fuera de Maya.',
        emoji: '🔗',
        url: 'https://maya.yanbal.com',
      },
  );
}
