import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './features/auth/auth.guards';
import { AppShellComponent } from './shared/layouts/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'vocabulary',
        loadComponent: () =>
          import('./features/vocabulary/vocabulary-list.component').then(
            (m) => m.VocabularyListComponent,
          ),
      },
      {
        path: 'topics',
        loadComponent: () =>
          import('./features/topics/topics-list.component').then((m) => m.TopicsListComponent),
      },
      {
        path: 'topics/:id',
        loadComponent: () =>
          import('./features/topics/topic-detail.component').then((m) => m.TopicDetailComponent),
      },
      {
        path: 'flashcards',
        loadComponent: () =>
          import('./features/flashcards/flashcards-home.component').then(
            (m) => m.FlashcardsHomeComponent,
          ),
      },
      {
        path: 'flashcards/sessions/:id',
        loadComponent: () =>
          import('./features/flashcards/flashcard-session.component').then(
            (m) => m.FlashcardSessionComponent,
          ),
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./features/quizzes/quizzes-list.component').then((m) => m.QuizzesListComponent),
      },
      {
        path: 'quizzes/new',
        loadComponent: () =>
          import('./features/quizzes/quiz-builder.component').then((m) => m.QuizBuilderComponent),
      },
      {
        path: 'quizzes/:id/edit',
        loadComponent: () =>
          import('./features/quizzes/quiz-builder.component').then((m) => m.QuizBuilderComponent),
      },
      {
        path: 'quizzes/:id/take',
        loadComponent: () =>
          import('./features/quizzes/quiz-player.component').then((m) => m.QuizPlayerComponent),
      },
      {
        path: 'quizzes/:id/history',
        loadComponent: () =>
          import('./features/quizzes/quiz-history.component').then((m) => m.QuizHistoryComponent),
      },
      {
        path: 'attempts',
        loadComponent: () =>
          import('./features/quizzes/quiz-history.component').then((m) => m.QuizHistoryComponent),
      },
      {
        path: 'attempts/:attemptId',
        loadComponent: () =>
          import('./features/quizzes/quiz-result.component').then((m) => m.QuizResultComponent),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/progress/progress-streak.component').then(
            (m) => m.ProgressStreakComponent,
          ),
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.component').then(
            (m) => m.LeaderboardComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
