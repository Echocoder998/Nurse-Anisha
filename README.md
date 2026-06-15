# Anisha's Apothecary

NCLEX pharmacology study companion. Five integrated modes — AI tutor, spaced-repetition flashcards, NCLEX practice questions, drug card library, and audio review — all sharing one Turso-backed drug library.

## Personality

The AI is built around a single persona that runs through every feature (tutor, practice generator, library extractor, audio scripts). It's tuned for Anisha specifically — a Filipina Muslim nursing student preparing for the NCLEX-RN. The voice is **warm older-sister energy**: sharp, encouraging, real. Treats her as a capable future nurse. Never pandering, never preachy.

Cultural awareness is built in but understated:
- Matches Islamic greetings naturally (Assalamu alaikum → Wa alaikum salam) and mirrors Islamic phrases only when she uses them
- Aware of Ramadan medication-timing, hijab-PPE realities, halal/haram pharma concerns (alcohol-based vehicles, porcine gelatin, heparin sourcing) — surfaces these only when clinically relevant
- Knows the Filipino nursing journey (NCLEX-to-deployment path, family expectations) but doesn't lean on it

The persona lives in `lib/persona.ts` and is composed into every system prompt across the app.

## Language support: EN · Taglish · Tagalog

A language switcher in the header toggles between three modes:

- **EN** — English (default; NCLEX content is in English, safest for test prep)
- **TGL** — Taglish, the natural Filipino code-switching register ("Yung warfarin, anticoagulant siya — kailangan i-monitor mo yung INR")
- **TL** — primarily Tagalog for explanations and conversation

**Important rule:** medical terminology (drug names, MOA, side effects, conditions, lab values) always stays in English. NCLEX is tested in English. Tagalog/Taglish handles the explanation, encouragement, and connective tissue around the content.

The preference applies to:
- Tutor conversations (full bilingual capability; she can also switch mid-conversation and the AI follows)
- Practice question rationales (the question stem stays in English; the rationale follows her language)
- Audio review scripts (full Tagalog/Taglish scripts)
- Drug card nursing considerations (clinical fields stay English; teaching notes can flex)

The Listen mode auto-filters available text-to-speech voices by language and warns when a Tagalog voice isn't installed on the device.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with custom apothecary-inspired theme
- **Turso** (libSQL) for the database — free tier covers personal use forever
- **Drizzle ORM** for type-safe queries + migrations
- **Anthropic SDK** with Claude Sonnet 4.6 for AI features
- **unpdf** + **mammoth** for PDF/DOCX parsing
- **Web Speech API** for the Listen mode (free, no TTS bill)

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Turso

```bash
# install the Turso CLI (one time)
curl -sSfL https://get.tur.so/install.sh | bash

# auth + create db
turso auth signup        # or `turso auth login` if you have an account
turso db create anishas-apothecary

# get connection details
turso db show anishas-apothecary --url
turso db tokens create anishas-apothecary
```

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```
TURSO_DATABASE_URL=libsql://anishas-apothecary-<your-org>.turso.io
TURSO_AUTH_TOKEN=<the token from above>
ANTHROPIC_API_KEY=<your anthropic key>
```

### 3. Push schema to Turso

```bash
npm run db:push
```

This creates the `drugs`, `flashcards`, `quiz_attempts`, and `chat_messages` tables.

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## First-time use

The library starts empty. Fastest way to start studying:

1. Go to **Library** → **Add drugs** → **Generate by topic**
2. Type a topic (e.g. `antihypertensives`, `anticoagulants`, `opioids`) → Generate
3. Six to twelve high-yield NCLEX cards appear, with flashcards auto-created
4. Switch to **Cards** to start spaced repetition, or **Practice** for NCLEX questions

For lecture notes: **Library** → **Upload file** (PDF/DOCX) or **Paste notes**. The extractor pulls structured drug cards from raw lecture text.

## Deploy to Vercel

```bash
npx vercel
```

Add the three env vars (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ANTHROPIC_API_KEY`) in the Vercel dashboard. No further config needed — `unpdf` and `mammoth` are pure JS and work on Vercel's serverless runtime out of the box.

## Cost notes

- **Turso free tier**: 500 databases, 9 GB storage, 1B row reads/mo, 25M row writes/mo. A personal study app uses well under 1% of this.
- **Vercel hobby**: free for personal projects, plenty of bandwidth and invocations.
- **Anthropic API**: only meaningful cost. Roughly $0.003 per tutor message, ~$0.01 per generated NCLEX question, ~$0.02 per audio script. Heavy daily use under $5/mo.

## Project structure

```
anishas-apothecary/
├── app/
│   ├── api/
│   │   ├── drugs/route.ts            # CRUD for drug library
│   │   ├── flashcards/route.ts       # GET due cards
│   │   ├── flashcards/grade/route.ts # POST SM-2 grade
│   │   ├── tutor/route.ts            # POST chat message
│   │   ├── chat/route.ts             # GET history, DELETE history
│   │   ├── practice/route.ts         # GET stats, POST generate/record
│   │   ├── library/extract/route.ts  # POST text → drug cards
│   │   ├── library/generate/route.ts # POST topic → drug cards
│   │   ├── library/upload/route.ts   # POST file → text
│   │   └── listen/route.ts           # POST topic → spoken script
│   ├── layout.tsx
│   ├── page.tsx                      # Main UI shell + mode switcher
│   └── globals.css
├── components/
│   ├── ui/index.tsx                  # Button, Eyebrow, Hairline, Field, EmptyState
│   ├── language-switch.tsx           # EN / TGL / TL toggle in header
│   ├── drug-card.tsx                 # Apothecary-label drug card
│   ├── tutor.tsx                     # Chat mode
│   ├── flashcards.tsx                # Spaced repetition mode
│   ├── practice.tsx                  # NCLEX question mode
│   ├── library.tsx                   # Drug management + import
│   └── listen.tsx                    # Audio review mode
├── lib/
│   ├── schema.ts                     # Drizzle table definitions
│   ├── db.ts                         # Turso client
│   ├── anthropic.ts                  # Claude SDK helpers
│   ├── persona.ts                    # The AI personality + language directives
│   └── sm2.ts                        # Spaced repetition algorithm
├── drizzle.config.ts
├── tailwind.config.ts
└── package.json
```

## Design system

Apothecary notebook aesthetic — warm ivory background, deep ink-blue text, eucalyptus sage as the primary accent, honey amber for highlights, vermillion for errors. Fraunces serif for drug names (Latin gravitas), Inter for UI, JetBrains Mono for dosages. Hairline rules instead of heavy borders. Every drug card reads like a label: small-caps class as eyebrow, big serif name, italic generic name beneath.

## Adding password protection (optional)

For a quick layer of privacy on a deployed URL, add a `middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (!process.env.APP_PASSWORD) return NextResponse.next();
  const auth = req.headers.get('authorization');
  if (auth === `Basic ${btoa('user:' + process.env.APP_PASSWORD)}`) {
    return NextResponse.next();
  }
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Apothecary"' },
  });
}
export const config = { matcher: '/((?!_next/static|_next/image|favicon).*)' };
```

Then set `APP_PASSWORD` in your env vars.

## Roadmap ideas

- PWA manifest for install-on-phone
- Export drugs as Anki deck (.apkg)
- Image-of-pill recognition for med-pass practice
- Track flashcard streak + study calendar
- Multi-user mode with Clerk auth (if she wants to share with classmates)
