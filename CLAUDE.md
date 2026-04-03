# [CLAUDE.md](http://CLAUDE.md)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CheckVisa is a full-stack visa requirement lookup platform. It scrapes Wikipedia for visa data, uses GPT-4o-mini to parse unstructured rules into structured records, stores them in PostgreSQL, and serves them via a NestJS REST API. The Vue 3 frontend is in early development.

## Monorepo Structure

- `packages/server/` — NestJS backend (Bun runtime, Prisma, OpenAI, Cheerio)
- `packages/client/` — Vue 3 + Vite + Tailwind frontend
- `index.ts` — Root entry: runs both packages concurrently via `concurrently`

## Commands

### Run everything (from repo root)

```bash
bun run dev
```

### Server only

```bash
cd packages/server
bun run dev           # watch mode
bun run dev:inspect   # with Bun debugger on port 6499
bun run start         # no watch
```

### Client only

```bash
cd packages/client
bun run dev           # Vite dev server
bun run build         # vue-tsc type check + Vite build
```

### Formatting (from repo root)

```bash
bun run format        # Prettier across all files
```

### Database migrations (from packages/server)

```bash
bunx prisma migrate dev     # apply migrations
bunx prisma generate        # regenerate Prisma client
bunx prisma studio          # open Prisma Studio GUI
```

## Environment Setup

Copy `packages/server/.env.example` to `packages/server/.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — for LLM visa note parsing
- `ANTHROPIC_API_KEY` — present in env, not yet used in code
- `SCRAPER_API_KEY` — protects the scraper endpoints (sent as `x-api-key` header)
- `PORT` — defaults to 3000

## Architecture

### Backend (NestJS + Bun)

**API:** All routes prefixed with `api/v1`. Swagger docs at `/docs`.

**Key modules:**

- `scraper/` — `ScraperService` scrapes Wikipedia HTML via Cheerio, batches visa notes, sends to `LlmService` for parsing, stores results via Prisma. `ScraperController` requires `x-api-key` header.
- `data/` — `DataService` + `DataController` expose the visa query endpoint. Query by origin/destination ISO-3166-1 alpha-2 country codes.
- `db/` — `DbService` wraps the Prisma client; manages connect/disconnect lifecycle.
- `logger/` — Shared logging service used across modules.
- `health/` — Simple health check endpoint.

**LLM caching:** `LlmService` MD5-hashes each visa note; re-uses cached parsed results if the note is unchanged. Concurrency is limited to 5 parallel OpenAI calls via `p-limit`.

### Database (Prisma + PostgreSQL)

Two models:

- `VisaRequirement` — origin/destination country codes, primary requirement type, stay duration, raw notes
- `VisaCondition` — related conditions linked to a `VisaRequirement` (e.g., visa waivers, residency requirements)

Schema and migrations live in `packages/server/prisma/`.

### Frontend (Vue 3 + Vite)

Located in `packages/client/src/`. The Vite dev server proxies `/api/` to `http://localhost:3000`.

**Vue SFC convention:** Always put `<template>` before `<script setup>` in all Vue single-file components. Never add comments anywhere — no HTML comments, no JS/TS comments, no CSS comments.

**Stack:**

- Vue 3 (Composition API), Vue Router 5, vue-i18n 11 (English only, locale at `src/locales/en.json`)
- Tailwind CSS v4 (config inline in `src/style.css`), shadcn-vue "new-york" style
- reka-ui for headless components, lucide-vue-next icons, flag-icons for country flags
- axios installed but not yet used; `@vueuse/core` for composables
- No Pinia/Vuex — components use local `ref()` state only

**Directory layout:**

- `src/components/HeroSection/` — landing hero with headline and embedded SearchCard
- `src/components/NavBar/` — fixed header with glassmorphism (backdrop-blur), logo + nav links
- `src/components/SearchCard/` — main search form: passport country input, destination input, 6 visa-toggle switches (US/UK/EU/UAE/Canada/Australia), CTA button
- `src/components/ui/` — shadcn-vue primitives: Button, Card family, Input, Switch, NavigationMenu family
- `src/views/HomeView.vue` — home page, wraps HeroSection
- `src/router/index.ts` — single route: `/` → HomeView (web history mode)
- `src/i18n/index.ts` — i18n setup (legacy: false, composition API mode)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Brand / design tokens** (defined as CSS vars in `src/style.css`):

- `--color-pp-primary`: #00152a (navy), `--color-pp-primary-container`: #102a43
- `--color-pp-secondary`: #006b5c (teal), `--color-pp-secondary-container`: #68fadd
- `--color-pp-surface`: #f6fafe (page bg), `--color-pp-surface-low`: #f0f4f8 (input bg)
- Fonts: Plus Jakarta Sans (display/headlines), Inter (body)

**Path alias:** `@/` → `src/`

**Scope of changes:** Only modify files directly required by the task. Do not fix, clean up, or refactor unrelated files — even if they have lint errors, unused imports, or other issues.

**Code organisation preferences:**

- Do not use composables (`use*` functions with Vue reactivity). Put component logic (refs, `onMounted`, data fetching) directly inside `<script setup>`.
- API calls go in `src/services/api.service.ts` as plain async functions. Components import and call these directly.
- Shared types live in `src/types/` (e.g. `src/types/country.ts`). Helper functions that belong to a type can live alongside it in that file.

Use shadcn components where necessary, avoid having to create components from scratch

## No Tests

There is currently no automated test setup in this project.
