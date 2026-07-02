import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AudienciaService } from '../shared/estatus';
import { InicioCes } from '../ces/inicio-ces';
import { CampanaCes } from '../ces/campana-ces';
import { InicioN } from './inicio-n';
import { CampanaN } from './campana-n';

/**
 * Hubs de la vista nueva: Inicio y Mi campaña existen para AMBAS audiencias,
 * pero con contenido distinto. Estos componentes eligen la página según la
 * audiencia encarnada (conmutador demo) sin duplicar rutas ni navegación.
 */
@Component({
  selector: 'app-inicio-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InicioCes, InicioN],
  template: `
    @if (audiencia.tipo() === 'emprendedora') {
      <app-inicio-ces />
    } @else {
      <app-inicio-n />
    }
  `,
})
export class InicioHub {
  protected readonly audiencia = inject(AudienciaService);
}

@Component({
  selector: 'app-campana-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampanaCes, CampanaN],
  template: `
    @if (audiencia.tipo() === 'emprendedora') {
      <app-campana-ces />
    } @else {
      <app-campana-n />
    }
  `,
})
export class CampanaHub {
  protected readonly audiencia = inject(AudienciaService);
}
