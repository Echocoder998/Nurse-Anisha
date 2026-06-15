import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drugs, flashcards } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { completeJSON } from '@/lib/anthropic';
import { buildPersona, languageRule, Language } from '@/lib/persona';

export async function POST(req: NextRequest) {
  const { topic, language = 'en' } = (await req.json()) as {
    topic: string;
    language?: Language;
  };
  if (!topic?.trim()) {
    return NextResponse.json({ error: 'topic required' }, { status: 400 });
  }

  const system = `${buildPersona(language)}

You are now generating high-yield NCLEX pharmacology drug cards. Focus on what nursing students must know for the boards.

IMPORTANT: Keep clinical fields in English (NCLEX standard). The nursingConsiderations field can lean into her language preference for teaching points and memory aids when that helps her remember.${languageRule(language)}`;

  const result = await completeJSON<{ drugs: any[] }>(
    `Generate a focused set of NCLEX-relevant pharmacology drug cards for: ${topic}

Generate 6-12 of the most clinically important and NCLEX-tested drugs in this category.

Required JSON shape:
{
  "drugs": [
    {
      "name": "Drug name",
      "genericName": "Generic name if different",
      "drugClass": "Pharmacologic class",
      "indication": "What it's used to treat",
      "moa": "Mechanism of action (concise)",
      "dose": "Typical dose range and route",
      "sideEffects": "Key side effects",
      "contraindications": "Major contraindications",
      "nursingConsiderations": "Critical nursing assessments, teaching points, monitoring"
    }
  ]
}`,
    system,
    4000
  );

  const added: any[] = [];
  const now = Date.now();
  if (result?.drugs && Array.isArray(result.drugs)) {
    for (const d of result.drugs) {
      if (!d.name) continue;
      const drug = {
        id: nanoid(10),
        createdAt: now,
        name: d.name,
        genericName: d.genericName ?? null,
        drugClass: d.drugClass ?? null,
        indication: d.indication ?? null,
        moa: d.moa ?? null,
        dose: d.dose ?? null,
        sideEffects: d.sideEffects ?? null,
        contraindications: d.contraindications ?? null,
        nursingConsiderations: d.nursingConsiderations ?? null,
      };
      await db.insert(drugs).values(drug);
      await db.insert(flashcards).values({
        id: nanoid(10),
        drugId: drug.id,
        ease: 2.5,
        interval: 0,
        reps: 0,
        nextReview: now,
      });
      added.push(drug);
    }
  }

  return NextResponse.json({ added: added.length, drugs: added });
}
