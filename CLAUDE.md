# CLAUDE.md

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

Very early stage. The Vite dev server proxies `/api/*` to `http://localhost:3000`, so the client can call the backend without CORS issues in development.

**Vue SFC convention:** Always put `<template>` before `<script setup>` in all Vue single-file components. Never add comments anywhere — no HTML comments, no JS/TS comments, no CSS comments.

## No Tests

There is currently no automated test setup in this project.
