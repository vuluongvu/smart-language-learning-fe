# OpenQuiz Frontend (`smart-language-learning-fe`)

Frontend web application cho nền tảng tự học tiếng Anh cá nhân hóa **OpenQuiz**, xây dựng bằng **Angular 21 + TypeScript + SCSS**.

## Stack

- **Framework:** Angular `21` (Standalone Components, Signals, Router, `HttpClient` with `fetch`)
- **Styling:** SCSS + CSS Custom Properties design tokens (Light Mode mặc định, hỗ trợ Dark Mode `[data-theme="dark"]`)
- **Testing & Formatting:** Vitest (`ng test`), Prettier

## Yêu cầu môi trường

- Node.js >= 24
- npm >= 11

## Cài đặt & Chạy local

1. Cài dependencies:

```bash
npm ci
```

2. Đảm bảo Backend đang chạy tại `http://localhost:3000/api/v1` (cấu hình trong `src/environments/environment.development.ts`).
   - Để bật Google Sign-In ở frontend, điền `googleClientId` (khớp với `GOOGLE_CLIENT_ID` của backend và cấu hình `http://localhost:4200` trong Authorized JavaScript origins của Google Cloud Console). Không bao giờ đặt `GOOGLE_CLIENT_SECRET` ở frontend.

3. Khởi động dev server:

```bash
npm start
```

- Ứng dụng chạy tại: `http://localhost:4200`

## Scripts chính

| Script | Mô tả |
| --- | --- |
| `npm start` | Chạy dev server (`ng serve`) |
| `npm run build` | Build production |
| `npm run test:ci` | Chạy unit tests một lần với Vitest |
| `npm run format` | Format code bằng Prettier |
| `npm run format:check` | Kiểm tra format bằng Prettier |

## Cấu trúc thư mục dự kiến

```text
src/
  app/
    features/     # auth, dashboard, vocabulary, topics, quizzes, flashcards, progress, streaks, leaderboard, settings
    shared/
      api/        # HTTP client & response types
      components/ # Reusable UI components
      layouts/    # Desktop sidebar & mobile navigation shells
      types/      # Domain interfaces
      utils/      # Helpers
  environments/
  styles/         # Design tokens (_tokens.scss)
```

## Git workflow

Phát triển theo nhánh feature, kiểm tra `build`, `format:check`, `test:ci` trước khi merge vào `develop` và `master`.
