# Resumate-Bro Project Brief

## Purpose
Resumate-Bro is a career-readiness platform for students and early-career developers.
It analyzes resumes, tracks progress, and generates role-focused learning guidance.

## Current Stack
- Next.js App Router
- TypeScript
- Drizzle ORM
- Neon Postgres
- JWT authentication with HTTP-only cookies
- Gemini API integration for AI-driven analysis
- Tailwind CSS + shadcn/ui for UI

## Core Product Areas
- Resume upload and analysis
- Resume score and job-readiness insights
- Skill-gap and improvement suggestions
- Practice interview question generation
- Roadmap, projects, and weekly reports dashboards

## Security and Environment Notes
- `JWT_SECRET` must be set for auth token signing and verification.
- `ENABLE_AUTH_DEV_FALLBACK` is optional and should only be enabled in local development.
- Dev fallback is disabled automatically in production.
- Passwords are stored as bcrypt hashes and verified using bcrypt comparison.
- Resume profile cookies are size-limited and HTTP-only.

## Branching and Collaboration
- Branch from `dev`.
- Open pull requests back into `dev`.
- Keep `main` for stable, release-ready changes.

## Team Workflow
- Frontend: dashboard and user flows
- Backend: API routes, DB integration, auth/session handling
- Prompt/AI: model prompts and output quality
- QA/coordination: testing, UX validation, and release checks

## Delivery Guidance
Feature scope can change based on time and complexity.
Prioritize secure authentication, stable API contracts, and tested dashboard flows first.
