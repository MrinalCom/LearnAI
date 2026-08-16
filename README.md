# LearnAI

A learning platform: a docs/course site (Next.js + [Fumadocs](https://fumadocs.dev)) with a
separate Express + Postgres API for auth, course metadata, progress tracking, and quizzes.

## Live

- **Web (docs/courses):** https://learnai-web-eosin.vercel.app
- **API:** https://learnai-api-tau.vercel.app (`GET /health`)

Both are deployed on Vercel, each as its own project, sharing this pnpm workspace as their
build root. The API is backed by a live Neon Postgres instance (provisioned via the Vercel
Marketplace integration), migrated and reachable.

**Known gap:** the web app doesn't currently call the API anywhere in its source — it renders
docs/course content statically from local MDX via Fumadocs, and the auth/progress/quiz API is
deployed and working standalone but not yet wired into any UI. Connecting them is a frontend
feature-building task, not a deployment one.

## Structure

```
apps/
  web/     Next.js + Fumadocs docs/course site
  api/     Express API — auth, courses, progress, quizzes (Postgres via Drizzle)
packages/
  shared/  Shared types/schemas (zod), built to dist/ and consumed by both apps
```

## Local development

```bash
pnpm install
pnpm --filter @learning/shared build   # required once, and after any shared/ change
pnpm db:migrate                        # requires DATABASE_URL
pnpm dev:web    # terminal 1
pnpm dev:api    # terminal 2
```
