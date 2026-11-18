# Argon Learning Frontend Rules

## Git & GitHub Workflow (Per Feature / Branch)

- Never develop or commit new features directly on `master`.
- Before writing code for a new feature, fix, or refactor, create a dedicated branch from the latest `develop` (or `master` after syncing `develop` with `master`):
  - Features: `feat/<short-feature-name>`
  - Bug fixes: `fix/<short-fix-name>`
  - Maintenance / Docker / Refactor: `chore/<short-task-name>` or `refactor/<short-task-name>`
- Use Conventional Commits (`feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`). Keep each commit focused on a single feature or logical unit.
- Never commit `.env` files, API keys, JWT secrets, or database credentials.
- Run `npm run test:ci`, `npm run format:check`, and `npm run build` before finalizing commits on a feature branch.
- Promote completed and verified feature branches by merging (`--no-ff`) into `develop`, then merging `develop` (`--no-ff`) into `master`.
- Push the feature branch, `develop`, and `master` to GitHub (`origin`) once the feature is complete and approved for remote push.
