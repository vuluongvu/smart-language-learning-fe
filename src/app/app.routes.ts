import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './features/auth/auth.guards';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { QuizBuilderComponent } from './features/quizzes/quiz-builder.component';
import { QuizHistoryComponent } from './features/quizzes/quiz-history.component';
import { QuizPlayerComponent } from './features/quizzes/quiz-player.component';
import { QuizResultComponent } from './features/quizzes/quiz-result.component';
import { QuizzesListComponent } from './features/quizzes/quizzes-list.component';
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
      { path: 'quizzes', component: QuizzesListComponent },
      { path: 'quizzes/new', component: QuizBuilderComponent },
      { path: 'quizzes/:id/edit', component: QuizBuilderComponent },
      { path: 'quizzes/:id/take', component: QuizPlayerComponent },
      { path: 'quizzes/:id/history', component: QuizHistoryComponent },
      { path: 'attempts', component: QuizHistoryComponent },
      { path: 'attempts/:attemptId', component: QuizResultComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
