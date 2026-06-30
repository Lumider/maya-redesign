import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', loadComponent: () => import('./pages/inicio').then((m) => m.InicioPage) },
  { path: 'mi-plan', loadComponent: () => import('./pages/mi-plan').then((m) => m.MiPlanPage) },
  { path: 'mi-campana', loadComponent: () => import('./pages/mi-campana').then((m) => m.MiCampanaPage) },
  {
    path: 'incorpora-y-gana',
    loadComponent: () => import('./pages/incorpora-gana').then((m) => m.IncorporaGanaPage),
  },
  {
    path: 'grupo-personal',
    loadComponent: () => import('./pages/grupo-personal').then((m) => m.GrupoPersonalPage),
  },
  { path: 'cuadrante', loadComponent: () => import('./pages/cuadrante').then((m) => m.CuadrantePage) },
  { path: 'herramientas', loadComponent: () => import('./pages/herramientas').then((m) => m.HerramientasPage) },
  { path: 'externa/:slug', loadComponent: () => import('./pages/externa').then((m) => m.ExternaPage) },

  // Vista nueva (beta) — rutas paralelas; la versión actual queda intacta
  { path: 'n/inicio', loadComponent: () => import('./nueva/inicio-n').then((m) => m.InicioN) },
  { path: 'n/negocio', loadComponent: () => import('./nueva/negocio').then((m) => m.Negocio) },
  { path: 'n/campana', loadComponent: () => import('./nueva/campana-n').then((m) => m.CampanaN) },
  { path: 'n/equipo', loadComponent: () => import('./nueva/equipo').then((m) => m.Equipo) },
  { path: 'n/carrera', loadComponent: () => import('./nueva/carrera').then((m) => m.Carrera) },
  { path: 'n/herramientas', loadComponent: () => import('./pages/herramientas').then((m) => m.HerramientasPage) },

  { path: '**', redirectTo: 'inicio' },
];
