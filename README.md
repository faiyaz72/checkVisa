# CheckVisa

A visa requirement lookup platform for travelers. In the MVP phase, data is available for Bangladeshi, Indian, and Pakistani passport holders.

**Status:** Early development - backend data pipeline complete, frontend coming soon.

## What I'm Building

Trying to solve a problem I've faced myself: figuring out visa requirements is a pain. Information is scattered across embassy websites, travel forums, and Wikipedia. Even worse, the rules are often complex - "you can enter without a visa IF you have a valid US/Schengen visa" type situations that are buried in fine print.

This project aggregates visa data and uses AI to parse the messy, unstructured text into something actually usable.

## What Works Now

Built the core data pipeline:

- Scrapes visa requirements from Wikipedia
- Uses GPT-4.1-nano to parse complex conditions (like "visa-free with US visa")
- Stores everything in a PostgreSQL database with proper relationships
- REST API built with NestJS

The AI parsing is the interesting part. Something like this:

> "Visa not required for 180 days if holding a valid visa from USA, Canada, Japan, UK, or Schengen countries"

Gets structured into actual queryable data with country codes, conditions, and durations. No regex hell.

## What's Next

- Build the actual frontend (Vue 3)
- Add search and filtering
- "Where can I go with my X visa?" feature
- Expand beyond Bangladesh, India, and Pakistan to other countries
- Mobile responsiveness

## Tech Stack

**Backend**

- NestJS + TypeScript
- Bun runtime
- PostgreSQL + Prisma
- OpenAI API (GPT-4o-mini)
- Cheerio for scraping

**Frontend** (not started yet)

- Vue 3
- Vite
- Tailwind CSS

**Deployment**

- Railway

## Technical Bits

The interesting challenge was parsing unstructured text. Wikipedia has tables like:

| Country | Requirement   | Duration | Notes                                                                                             |
| ------- | ------------- | -------- | ------------------------------------------------------------------------------------------------- |
| Mexico  | Visa required | -        | Visa not required for max 180 days if holding valid visa from USA, Canada, Japan, UK, or Schengen |

That "notes" column is where all the complexity lives. Built a system that:

1. Scrapes the data with Cheerio
2. Sends notes to GPT-4o-mini with a structured JSON schema
3. Model extracts conditions, required visas, durations
4. Stores in normalized PostgreSQL tables (VisaRequirement → VisaCondition → RequiredVisa)

Added some optimizations:

- Parallel processing with p-limit (10 concurrent requests)
- MD5 hash caching - only re-parse if notes changed
- Confidence scoring from the model

Currently processing ~196 countries takes about 2 minutes.

## Running Locally

```bash
git clone https://github.com/yourusername/checkvisa.git
cd checkvisa

bun install

# Set up .env with DATABASE_URL and OPENAI_API_KEY
cp packages/server/.env.example packages/server/.env

cd packages/server
bunx prisma migrate dev
bunx prisma generate

cd ../..
bun run dev
```

Backend runs on http://localhost:3000

## Why This Exists

Started this because I was planning a trip and got frustrated trying to figure out where I could go with my existing visas. Thought "there has to be a better way than checking 20 embassy websites."

Turns out there isn't - at least not one that's free and covers complex conditional requirements.

So building it.
