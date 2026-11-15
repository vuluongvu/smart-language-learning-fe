import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './features/auth/auth.guards';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SettingsComponent } from './features/settings/settings.component';
import { TopicDetailComponent } from './features/topics/topic-detail.component';
import { TopicsListComponent } from './features/topics/topics-list.component';
import { VocabularyListComponent } from './features/vocabulary/vocabulary-list.component';
import { AppShellComponent } from './shared/layouts/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vocabulary', component: VocabularyListComponent },
      { path: 'topics', component: TopicsListComponent },
      { path: 'topics/:id', component: TopicDetailComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
