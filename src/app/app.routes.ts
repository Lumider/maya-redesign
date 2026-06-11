import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', loadComponent: () => import('./pages/inicio').then((m) => m.InicioPage) },
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
  { path: '**', redirectTo: 'inicio' },
];
