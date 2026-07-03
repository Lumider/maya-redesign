import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', loadComponent: () => import('./pages/inicio').then((m) => m.InicioPage) },
  { path: 'mi-plan', loadComponent: () => import('./pages/mi-plan').then((m) => m.MiPlanPage) },
  {
    path: 'mi-campana',
    loadComponent: () => import('./pages/mi-campana').then((m) => m.MiCampanaPage),
  },
  {
    path: 'incorpora-y-gana',
    loadComponent: () => import('./pages/incorpora-gana').then((m) => m.IncorporaGanaPage),
  },
  {
    path: 'grupo-personal',
    loadComponent: () => import('./pages/grupo-personal').then((m) => m.GrupoPersonalPage),
  },
  {
    path: 'cuadrante',
    loadComponent: () => import('./pages/cuadrante').then((m) => m.CuadrantePage),
  },
  {
    path: 'herramientas',
    loadComponent: () => import('./pages/herramientas').then((m) => m.HerramientasPage),
  },
  {
    path: 'externa/:slug',
    loadComponent: () => import('./pages/externa').then((m) => m.ExternaPage),
  },

  // Vista nueva (beta) — TODA la carrera vive bajo /n/. El estatus encarnado
  // (conmutador demo) decide qué se muestra: Inicio y Mi campaña alternan por
  // audiencia (hubs); el resto de secciones pertenece a una sola audiencia.
  { path: 'n/inicio', loadComponent: () => import('./nueva/hubs').then((m) => m.InicioHub) },
  { path: 'n/campana', loadComponent: () => import('./nueva/hubs').then((m) => m.CampanaHub) },
  // — Audiencia Directoras (JNR → REG)
  { path: 'n/negocio', loadComponent: () => import('./nueva/negocio').then((m) => m.Negocio) },
  { path: 'n/equipo', loadComponent: () => import('./nueva/equipo').then((m) => m.Equipo) },
  { path: 'n/carrera', loadComponent: () => import('./nueva/carrera').then((m) => m.Carrera) },
  // — Audiencia Emprendedoras (CNS → ASP)
  { path: 'n/grupo', loadComponent: () => import('./ces/grupo-ces').then((m) => m.GrupoCes) },
  {
    path: 'n/incorpora',
    loadComponent: () => import('./ces/incorpora-ces').then((m) => m.IncorporaCes),
  },
  { path: 'n/camino', loadComponent: () => import('./ces/camino-ces').then((m) => m.CaminoCes) },
  {
    path: 'n/herramientas',
    loadComponent: () => import('./pages/herramientas').then((m) => m.HerramientasPage),
  },

  // Rutas /e/ retiradas: redirigen a /n/ (compatibilidad con links compartidos)
  { path: 'e/inicio', redirectTo: 'n/inicio' },
  { path: 'e/campana', redirectTo: 'n/campana' },
  { path: 'e/grupo', redirectTo: 'n/grupo' },
  { path: 'e/incorpora', redirectTo: 'n/incorpora' },
  { path: 'e/camino', redirectTo: 'n/camino' },

  // UI Kit (styleguide viviente) — ruta oculta, sin enlace en la navegación
  { path: 'ui', loadComponent: () => import('./pages/ui-kit').then((m) => m.UiKitPage) },

  { path: '**', redirectTo: 'inicio' },
];
