import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drugs, flashcards } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { completeJSON } from '@/lib/anthropic';
import { buildPersona, languageRule, Language } from '@/lib/persona';

const CHUNK_SIZE = 8000;

export async function POST(req: NextRequest) {
  const { text, language = 'en' } = (await req.json()) as {
    text: string;
    language?: Language;
  };
  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  const system = `${buildPersona(language)}

You are now extracting structured pharmacology drug cards from nursing study materials for NCLEX prep.

IMPORTANT: Keep clinical fields (name, genericName, drugClass, indication, moa, dose, sideEffects, contraindications) in English — NCLEX is in English, and consistency matters. The nursingConsiderations field can lean into her language preference for teaching points and memory aids when helpful.${languageRule(language)}`;

  const added: any[] = [];
  const now = Date.now();

  for (const chunk of chunks) {
    try {
      const result = await completeJSON<{ drugs: any[] }>(
        `Extract all pharmacology drugs from the following text. For each drug mentioned, create a structured drug card.

TEXT:
${chunk}

Required JSON shape:
{
  "drugs": [
    {
      "name": "Drug name (brand or commonly used name)",
      "genericName": "Generic name if different",
      "drugClass": "Pharmacologic class",
      "indication": "What it's used to treat",
      "moa": "Mechanism of action (concise)",
      "dose": "Typical dose range and route if mentioned",
      "sideEffects": "Key side effects (comma separated)",
      "contraindications": "Major contraindications",
      "nursingConsiderations": "Critical nursing assessments, teaching points, monitoring"
    }
  ]
}

Only include drugs that are clearly described with at least an indication or mechanism. Skip mere passing mentions. Be concise — these are study cards, not textbook entries.`,
        system,
        3500
      );

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
    } catch (e) {
      console.error('chunk error', e);
    }
  }

  return NextResponse.json({ added: added.length, drugs: added });
}
