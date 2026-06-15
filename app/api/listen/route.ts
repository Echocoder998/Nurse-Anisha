import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drugs } from '@/lib/schema';
import { complete } from '@/lib/anthropic';
import { buildPersona, Language } from '@/lib/persona';

const LANGUAGE_SCRIPT_DIRECTIVES: Record<Language, string> = {
  en: 'Write the script in clear, warm English.',
  tl: 'Write the script primarily in Tagalog — conversational, like talking to a friend. Keep drug names, mechanisms, conditions, and lab values in English. Pronounce-friendly: spell out tricky English drug names phonetically when helpful.',
  taglish: 'Write the script in natural Taglish — the way Filipinos actually talk. Mix English medical terms with Tagalog connective phrases. Should feel like a study buddy explaining things, not a lecture.',
};

export async function POST(req: NextRequest) {
  const { topic, language = 'en' } = (await req.json()) as {
    topic?: string;
    language?: Language;
  };

  const library = await db.select({ name: drugs.name }).from(drugs).limit(12);
  const drugContext =
    library.length > 0 && !topic
      ? `Use these drugs from her library: ${library.map((d) => d.name).join(', ')}.`
      : topic
        ? `Topic: ${topic}.`
        : 'Pick a high-yield NCLEX pharm topic.';

  const system = `${buildPersona(language)}

You are now writing an audio study script for Anisha. This will be read aloud by text-to-speech, so it must flow as spoken language — no markdown, no headers, no bullet points, just sentences.

${LANGUAGE_SCRIPT_DIRECTIVES[language]}`;

  const script = await complete(
    [
      {
        role: 'user',
        content: `Write a calm, focused 3-4 minute audio study script. ${drugContext}

Style:
- Conversational and warm, like a knowledgeable friend explaining things
- Short sentences, pause-friendly
- Structure: brief intro → 3-5 key drug points with mechanism + nursing pearl for each → wrap with 2-3 NCLEX-style mental cues
- No headers, no bullet points, no markdown — just flowing spoken text
- Length: 400-550 words

Write only the script. Nothing else.`,
      },
    ],
    system,
    1200
  );

  return NextResponse.json({ script });
}
