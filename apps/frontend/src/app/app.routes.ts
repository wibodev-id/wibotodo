import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'todos',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'todos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/todos/todos-page.component').then((m) => m.TodosPageComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: '**',
    redirectTo: 'todos',
  },
];
