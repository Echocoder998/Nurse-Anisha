import { NextRequest, NextResponse } from 'next/server';
import { completeJSON } from '@/lib/anthropic';
import { buildPersona, languageRule, Language } from '@/lib/persona';

export async function POST(req: NextRequest) {
  const { topic, language = 'en' } = (await req.json()) as {
    topic?: string;
    language?: Language;
  };

  if (!topic?.trim()) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  const system = `${buildPersona(language)}

You are now generating memory aids (mnemonics) for nursing students. Create clear, clinically accurate, and memorable mnemonics that help students recall key information for the NCLEX-RN exam. Cover any nursing subject — pharmacology, fundamentals, med-surg, maternal, pediatrics, mental health, leadership, or community health.${languageRule(language)}`;

  const result = await completeJSON(
    `Generate 2–4 distinct mnemonics to help a nursing student remember: "${topic.trim()}"

Return a mix of types (acronym, sentence, rhyme, story) when possible. For acronyms, every letter must stand for something clinically meaningful. For sentences/rhymes, each key word maps to a concept.

Required JSON shape:
{
  "mnemonics": [
    {
      "title": "The mnemonic itself (e.g. MUDPILES, or 'No Free Cake Without Payment')",
      "type": "acronym | sentence | rhyme | story",
      "breakdown": [
        { "letter": "M", "meaning": "What it stands for — brief clinical detail" }
      ],
      "tip": "1–2 sentence usage tip or memory hook for exam day"
    }
  ]
}

Keep each breakdown entry concise. Tips should be practical. The tip field may follow her language preference.`,
    system,
    1800
  );

  return NextResponse.json(result);
}
