import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AudienciaService } from '../shared/estatus';
import { InicioCes } from '../ces/inicio-ces';
import { CampanaCes } from '../ces/campana-ces';
import { InicioBdm } from '../bdm/inicio-bdm';
import { CampanaBdm } from '../bdm/campana-bdm';
import { InicioN } from './inicio-n';
import { CampanaN } from './campana-n';

/**
 * Hubs de la vista nueva: Inicio y Mi campaña existen para TODAS las
 * audiencias (Emprendedoras, Directoras y BDM), pero con contenido distinto.
 * Estos componentes eligen la página según la audiencia encarnada
 * (conmutador demo) sin duplicar rutas ni navegación.
 */
@Component({
  selector: 'app-inicio-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InicioCes, InicioN, InicioBdm],
  template: `
    @switch (audiencia.tipo()) {
      @case ('emprendedora') {
        <app-inicio-ces />
      }
      @case ('bdm') {
        <app-inicio-bdm />
      }
      @default {
        <app-inicio-n />
      }
    }
  `,
})
export class InicioHub {
  protected readonly audiencia = inject(AudienciaService);
}

@Component({
  selector: 'app-campana-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampanaCes, CampanaN, CampanaBdm],
  template: `
    @switch (audiencia.tipo()) {
      @case ('emprendedora') {
        <app-campana-ces />
      }
      @case ('bdm') {
        <app-campana-bdm />
      }
      @default {
        <app-campana-n />
      }
    }
  `,
})
export class CampanaHub {
  protected readonly audiencia = inject(AudienciaService);
}
