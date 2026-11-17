# OpenQuiz Frontend (`smart-language-learning-fe`)

Frontend web application for the **OpenQuiz** personal English self-learning platform, built with **Angular 21**, **Standalone Components**, **Signals**, and **SCSS**.

## Implemented Features (MVP Phases 1–6)

- **Authentication & Session Security (`/login`, `/register`, `/forgot-password`, `/reset-password`):**
  Email/password auth, optional Google Identity Services ID-token sign-in, automatic single-flight access/refresh token rotation interceptor (`authInterceptor`), and route guards (`authGuard`, `guestGuard`).
- **Dashboard (`/dashboard`):**
  Daily learning overview combining saved vocabulary stats, active streak state, today's quiz/flashcard activity, quick action shortcuts, and topic progress summary.
- **Topics & Vocabulary Bank (`/topics`, `/topics/:id`, `/vocabulary`):**
  Custom topic management (names & color badges), searchable/filterable personal vocabulary library with pronunciation, part of speech, examples, mastery status, and topic assignments.
- **Manual Quiz Studio & Interactive Quiz Player (`/quizzes`, `/quizzes/new`, `/quizzes/:id/edit`, `/quizzes/:id/take`, `/quizzes/attempts/:attemptId`):**
  Multiple-choice & fill-in-the-blank manual quizzes, deterministic zero-AI draft generator from owned vocabulary, resumable attempts (`PATCH /attempts/:id/progress`), score grading, and one-click saving of new terms from quiz questions directly into the learner's vocabulary bank.
- **Spaced Repetition Flashcards (`/flashcards`, `/flashcards/sessions/:id`):**
  SM-2 review scheduling (`Again` / `Hard` / `Good` / `Easy`), topic/all/due-only session filters, flip card keyboard/click interactions, live interval feedback, and session completion tracking.
- **AI English Tutor (`/ai-tutor`):**
  Conversational English tutor chat powered by backend Groq (`qwen/qwen3.8-27b` by default) integration (`/api/v1/ai/status`, `/api/v1/ai/chat`), starter prompts, rolling 20-turn context history, error recovery, and live server availability checks.
- **Progress, Streak & Leaderboard (`/progress`, `/leaderboard`):**
  7-day & 30-day activity history charts, daily streak timeline, accuracy metrics, opt-in privacy-preserving leaderboard rankings, and IANA timezone sync.
- **Settings & Accessibility (`/settings`, App Shell):**
  Profile updates, password management, Google provider status, leaderboard visibility toggle, Light/Dark theme persistence (`[data-theme="dark"]`), skip-to-content landmark, Escape-key drawer closing, ARIA navigation state, `prefers-reduced-motion` support, and 360px mobile responsive layout.

## Requirements

- Node.js >= 24
- npm >= 11

## Local Development Setup

1. Install dependencies:

```bash
npm ci
```

2. Configure `src/environments/environment.development.ts`:
   - Set `apiBaseUrl` (default: `http://localhost:3000/api/v1`) matching your running `smart-language-learning-be` instance.
   - Optionally set `googleClientId` to match backend `GOOGLE_CLIENT_ID` and add `http://localhost:4200` to Authorized JavaScript origins in Google Cloud Console. Never put `GOOGLE_CLIENT_SECRET` in frontend files.

3. Start the dev server:

```bash
npm start
```

The app runs at `http://localhost:4200`.

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start Angular dev server (`ng serve`) |
| `npm run build` | Production build (`ng build`) |
| `npm run test:ci` | Run Vitest unit tests once (`ng test --watch=false`) |
| `npm run format` | Format workspace files with Prettier |
| `npm run format:check` | Check formatting with Prettier |

## Folder Structure

```text
src/
  app/
    core/         # App-level configuration / auth token interceptor & guards
    features/     # auth, dashboard, vocabulary, topics, quizzes, flashcards, ai-tutor, progress, leaderboard, settings
    shared/
      api/        # API envelope types and HTTP helpers
      components/ # Reusable UI primitives
      layouts/    # Responsive AppShell (desktop sidebar + mobile drawer + bottom nav)
      services/   # ThemeService, GoogleIdentityService, shared services
      types/      # Domain TypeScript interfaces
  environments/   # Development & production environment config
  styles/         # Design tokens (_tokens.scss)
```

## Running Frontend in Docker (Full Stack)

Start `smart-language-learning-be` first (`docker compose up -d --build`) so the `openquiz-network` bridge and `openquiz-app` container are healthy, then build and run the Angular + Nginx container:

```bash
docker compose up -d --build
```

- Web UI: `http://localhost:4200`
- Reverse proxy: Nginx serves the built Angular SPA and proxies `/api/*` to `http://openquiz-app:3000`.

## Git Workflow

Develop on isolated feature branches off `develop`, verify `npm run format:check`, `npm run build`, and `npm run test:ci`, then merge (`--no-ff`) into `develop` and `master`.
