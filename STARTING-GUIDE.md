# Starting Guide: Create a New Full-Stack Project with Bun

Use this guide when **creating a new project from scratch**. It gives all Bun commands and the minimal files needed for a monorepo with a **backend** (NestJS + Prisma) and **frontend** (Vue 3 + Vite + Tailwind).

---

## Prerequisites

- **Bun** installed:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

---

## 1. Root monorepo

From an empty folder:

```bash
# Init root package (use your project name for <project-name>)
bun init -y
```

Edit `package.json` so it looks like this (set `"name"` and add workspaces + scripts):

```json
{
  "name": "<project-name>",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "bun run index.ts",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@types/bun": "latest",
    "concurrently": "^9.2.1",
    "prettier": "^3.4.2"
  },
  "peerDependencies": {
    "typescript": "^5"
  },
  "workspaces": ["packages/*"]
}
```

```bash
# Install root deps and create runner
bun add -d concurrently @types/bun prettier
bun add -d typescript
```

Create `index.ts` at project root to run server and client together:

```ts
// index.ts
import concurrently from 'concurrently';

concurrently([
  {
    name: 'server',
    command: 'bun run dev',
    prefixColor: 'green',
    cwd: 'packages/server',
  },
  {
    name: 'client',
    command: 'bun run dev',
    prefixColor: 'blue',
    cwd: 'packages/client',
  },
]);
```

Create the packages directory:

```bash
mkdir -p packages
```

---

## 2. Backend (NestJS + Prisma)

### 2.1 Create package and install dependencies

```bash
mkdir -p packages/server
cd packages/server

bun init -y
```

Edit `packages/server/package.json` to:

```json
{
  "name": "server",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "bun run src/main.ts",
    "dev": "bun --watch run src/main.ts"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "prisma": "^7.4.0"
  },
  "peerDependencies": {
    "typescript": "^5"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/platform-express": "^10.4.15",
    "@prisma/adapter-pg": "^7.4.0",
    "@prisma/client": "^7.4.0",
    "dotenv": "^17.2.3",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^4.3.6"
  }
}
```

Then from `packages/server`:

```bash
bun add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
bun add @prisma/client @prisma/adapter-pg dotenv zod
bun add -d prisma @types/bun typescript
```

### 2.2 Folder structure and entry files

From `packages/server`:

```bash
mkdir -p src prisma generated
```

Create **`packages/server/src/main.ts`**:

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
```

Create **`packages/server/src/app.module.ts`**:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
```

Create **`packages/server/src/app.controller.ts`**:

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/hello')
  getApiHello() {
    return { message: 'Hello from API' };
  }
}
```

Create **`packages/server/src/app.service.ts`**:

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World';
  }
}
```

Create **`packages/server/src/prisma.service.ts`** (injectable Prisma client for use in services):

```ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL || "",
    });
    super({ adapter });
  }
}
```

### 2.3 Prisma (PostgreSQL)

From `packages/server`:

```bash
bunx prisma init
```

Create **`packages/server/prisma.config.ts`** (so Prisma uses env for DB URL):

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env['DATABASE_URL'] },
});
```

Edit **`packages/server/prisma/schema.prisma`** – set generator output and keep provider:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Generate the client (no DB required yet):

```bash
bunx prisma generate
```

Create **`packages/server/.env.example`**:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
PRISMA_CONNECT=postgresql://user:password@localhost:5432/mydb
```

Copy to `.env` and fill in real values when you have a DB.

### 2.4 TypeScript config (backend)

Create **`packages/server/tsconfig.json`** (NestJS needs decorator support):

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*", "prisma.config.ts"]
}
```

---

## 3. Frontend (Vue 3 + Vite + Tailwind)

### 3.1 Scaffold with Vite

From **project root**:

```bash
cd packages
bunx create-vite client --template vue-ts
cd ..
```

### 3.2 Install dependencies

From **project root** (so workspace is used):

```bash
bun install
```

Then add frontend-specific deps in the client package:

```bash
cd packages/client
bun add vue
bun add axios tailwindcss @tailwindcss/vite
bun add -d vite @vitejs/plugin-vue typescript vue-tsc @types/node
```

### 3.3 Vite config: alias and API proxy

Create or replace **`packages/client/vite.config.ts`**:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
```

### 3.4 TypeScript path alias

In **`packages/client/tsconfig.json`** (or `tsconfig.app.json`), ensure you have:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

If you use a separate `tsconfig.app.json`, add the same `baseUrl` and `paths` there.

### 3.5 Global CSS (Tailwind)

In **`packages/client/src/style.css`** add:

```css
@import 'tailwindcss';
```

---

## 4. Install all workspaces and run

From **project root**:

```bash
bun install
bun run dev
```

- Backend: http://localhost:3000
- Frontend: Vite dev server (e.g. http://localhost:5173)
- Frontend calls to `/api/*` are proxied to the backend.

---

## 5. Backend layout (for new features)

- **Modules** → **`src/<name>.module.ts`**: declare controllers and providers; import into `AppModule` or feature modules.
- **Controllers** → **`src/<name>/<name>.controller.ts`** (or `src/<name>.controller.ts`): use `@Controller('path')`, `@Get()`, `@Post()`, etc.; validate with Zod or Nest pipes; call services.
- **Services** → **`src/<name>/<name>.service.ts`**: business logic; inject `PrismaService` (or other services) in the constructor.
- **Prisma**: inject **`PrismaService`** (from `src/prisma.service.ts`) in any service that needs the DB.
- **Optional**: **repositories** or **lib** for shared utilities.

New Prisma models: edit **`prisma/schema.prisma`**, then from `packages/server`:

```bash
bunx prisma migrate dev --name <migration_name>
bunx prisma generate
```

---

## 6. Frontend layout (for new features)

- **Components** in **`src/components/`**.
- Call backend with relative URLs: **`/api/...`** (proxied by Vite).
- Use **`@/`** for `src/` (e.g. `import X from '@/components/X.vue'`).

---

## Command summary (copy-paste order)

Run from an **empty project folder**:

```bash
# Root
bun init -y
# (Edit package.json: name, "workspaces": ["packages/*"], scripts, devDependencies)
bun add -d concurrently @types/bun prettier typescript
# Create index.ts (concurrently server + client)
mkdir -p packages

# Backend (NestJS)
mkdir -p packages/server && cd packages/server
bun init -y
# (Edit package.json: name, scripts, dependencies as in guide — NestJS + Prisma)
bun add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
bun add @prisma/client @prisma/adapter-pg dotenv zod
bun add -d prisma @types/bun typescript
mkdir -p src prisma generated
# Create src/main.ts, src/app.module.ts, src/app.controller.ts, src/app.service.ts, src/prisma.service.ts
# Create prisma.config.ts, .env.example; edit prisma/schema.prisma (generator output, datasource)
bunx prisma init
bunx prisma generate
cd ../..

# Frontend (from repo root)
cd packages && bunx create-vite client --template vue-ts && cd ..
bun install
cd packages/client
bun add vue axios tailwindcss @tailwindcss/vite
bun add -d vite @vitejs/plugin-vue typescript vue-tsc @types/node
# Create/update vite.config.ts (vue, tailwindcss, alias @/, proxy /api)
# Add path alias in tsconfig / tsconfig.app.json
# Add @import "tailwindcss" in src/style.css
cd ../..

# Run
bun install
bun run dev
```

---

## Resulting structure

```
<project>/
├── package.json          # workspaces, dev script
├── index.ts              # concurrently(server, client)
├── packages/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma.config.ts
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   └── prisma.service.ts
│   │   ├── prisma/schema.prisma
│   │   └── generated/prisma/
│   └── client/
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── style.css
│           └── components/
```

Use this guide whenever you start a new full-stack project with Bun.
