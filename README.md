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

## Live dev environment

You can test the API without running anything locally:

- **Base URL:** [https://checkvisa-dev.up.railway.app/api/v1](https://checkvisa-dev.up.railway.app/api/v1)
- **Swagger UI:** [https://checkvisa-dev.up.railway.app/docs#/](https://checkvisa-dev.up.railway.app/docs#/)

Use the Swagger UI to try endpoints (e.g. `GET /data`, `POST /data` with query params). The scraper routes (`POST /scraper`, `POST /scraper/recover`) require an `x-api-key` header.

## Querying data

To get visa requirements for a specific origin → destination pair, send a POST request to `/api/v1/data/` with body like the following:

```
{
    "originCountryCode": "BD",
    "destinationCountryCode": "CA"
}
```

Use [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes (e.g. `BD` Bangladesh, `IN` India, `PK` Pakistan, `MX` Mexico). The response includes the primary requirement, any conditions (e.g. visa waivers if you hold another visa), source URL, and when it was last verified.

**Example response** (Bangladesh → Mexico):

```json
{
  "id": "cmlrjljbp0033btk5gr05krke",
  "originCountryCode": "BD",
  "destinationCountryCode": "MX",
  "primaryRequirement": "CONDITIONAL_WAIVER",
  "duration": null,
  "sourceUrl": "https://en.wikipedia.org/wiki/Visa_requirements_for_Bangladeshi_citizens",
  "lastVerified": "2026-02-18T04:23:19.941Z",
  "notesHash": "d046926e06a29b3174fd7d1284571dc8",
  "createdAt": "2026-02-18T04:39:03.443Z",
  "updatedAt": "2026-02-18T04:39:03.443Z",
  "conditions": [
    {
      "id": "cmlrjlkcj005ybtk56n7dkd3x",
      "visaRequirementId": "cmlrjljbp0033btk5gr05krke",
      "type": "REQUIRES_RESIDENCY",
      "description": "Visa not required if holding a permanent residency card from Canada, Chile, Colombia, Japan, United Kingdom, Peru, United States, or any of the Schengen countries",
      "acceptedCountries": [
        "CA",
        "CL",
        "CO",
        "JP",
        "GB",
        "PE",
        "US",
        "SCHENGEN"
      ],
      "mustBeValid": true,
      "durationIfMet": null,
      "createdAt": "2026-02-18T04:39:04.771Z",
      "updatedAt": "2026-02-18T04:39:04.771Z"
    },
    {
      "id": "cmlrjlkcj005zbtk5k5peeeva",
      "visaRequirementId": "cmlrjljbp0033btk5gr05krke",
      "type": "REQUIRES_VISA",
      "description": "Visa not required if holding a valid visa from Canada, Japan, United Kingdom, United States, or any of the Schengen countries",
      "acceptedCountries": ["CA", "JP", "GB", "US", "SCHENGEN"],
      "mustBeValid": true,
      "durationIfMet": null,
      "createdAt": "2026-02-18T04:39:04.771Z",
      "updatedAt": "2026-02-18T04:39:04.771Z"
    }
  ]
}
```

Here Mexico is `CONDITIONAL_WAIVER`: no visa needed if you meet one of the listed conditions (e.g. valid US/UK/Schengen visa or residency). The `conditions` array spells out each option with `acceptedCountries` and `mustBeValid`.

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

### API docs (Swagger)

With the server running, open the interactive API docs at:

**http://localhost:3000/docs**

You can explore endpoints, see request/response schemas, and try requests from the browser. (Use your actual port if you set `PORT` in `.env`.)

## Why This Exists

Started this because I was planning a trip and got frustrated trying to figure out where I could go with my existing visas. Thought "there has to be a better way than checking 20 embassy websites."

Turns out there isn't - at least not one that's free and covers complex conditional requirements.

So building it.
