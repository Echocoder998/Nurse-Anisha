import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drugs, quizAttempts } from '@/lib/schema';
import { count, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { completeJSON } from '@/lib/anthropic';
import { buildPersona, languageRule, Language } from '@/lib/persona';

const SUBJECT_DIRECTIVES: Record<string, string> = {
  pharmacology:
    'Write an NCLEX-RN pharmacology question about drug actions, side effects, nursing considerations, or patient teaching for medications.',
  fundamentals:
    'Write an NCLEX-RN fundamentals of nursing question covering basic care skills, hygiene, mobility, wound care, infection control, vital signs, or communication.',
  'med-surg':
    'Write an NCLEX-RN medical-surgical nursing question covering adult health conditions such as cardiac, respiratory, renal, hepatic, endocrine, or neurological disorders.',
  maternal:
    'Write an NCLEX-RN maternal-newborn nursing question covering antepartum, intrapartum, postpartum, or newborn care and complications.',
  pediatrics:
    'Write an NCLEX-RN pediatric nursing question covering child development, childhood illnesses, immunizations, family-centered care, or pediatric medication calculations.',
  'mental-health':
    'Write an NCLEX-RN mental health nursing question covering psychiatric disorders, therapeutic communication, crisis intervention, psychotropic medications, or legal/ethical issues.',
  leadership:
    'Write an NCLEX-RN management of care question covering delegation, prioritization, SBAR, chain of command, quality improvement, or nursing scope of practice.',
  community:
    'Write an NCLEX-RN community health nursing question covering epidemiology, health promotion, disease prevention, disaster preparedness, or population-focused care.',
};

export async function GET() {
  const [stats] = await db
    .select({
      total: count(),
      correct: sql<number>`sum(case when ${quizAttempts.isCorrect} = 1 then 1 else 0 end)`,
    })
    .from(quizAttempts);
  return NextResponse.json({
    total: stats?.total ?? 0,
    correct: Number(stats?.correct ?? 0),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'generate') {
    const { topic, language = 'en', subject = 'pharmacology' } = body as {
      topic?: string;
      language?: Language;
      subject?: string;
    };

    const subjectDirective =
      SUBJECT_DIRECTIVES[subject] ?? SUBJECT_DIRECTIVES['pharmacology'];

    const library = await db.select({ name: drugs.name, drugClass: drugs.drugClass }).from(drugs);

    const contextHint =
      subject === 'pharmacology' && library.length > 0 && !topic
        ? `Pick from these drugs the student is studying: ${library.map((d) => `${d.name} (${d.drugClass || 'unspecified class'})`).join('; ')}.`
        : topic
          ? `Focus the question on: ${topic}.`
          : `Pick any high-yield NCLEX topic from this subject area.`;

    const system = `${buildPersona(language)}

You are now writing an NCLEX-RN style question. ${subjectDirective}

IMPORTANT: The question stem and answer options MUST remain in English (NCLEX is tested in English — practicing in English is the point). However, the rationale and distractor notes can follow her language preference.${languageRule(language)}`;

    const q = await completeJSON(
      `Generate ONE NCLEX-RN style question. ${contextHint}

Required JSON shape:
{
  "scenario": "Brief clinical scenario in English (1-3 sentences setting up patient context)",
  "stem": "The actual question being asked, in English",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctIndex": 0,
  "rationale": "Why the correct answer is right (2-3 sentences clinical reasoning) — in her preferred language",
  "distractorNotes": "Brief note on why each wrong option is wrong — in her preferred language"
}

NCLEX style: prioritize "what does the nurse do FIRST/NEXT", "which finding requires immediate intervention", "patient teaching", "expected effects vs adverse effects". Avoid trick questions.`,
      system,
      1500
    );

    return NextResponse.json(q);
  }

  if (action === 'record') {
    const { topic, isCorrect, subject } = body;
    await db.insert(quizAttempts).values({
      id: nanoid(10),
      topic: topic ?? null,
      subject: subject ?? null,
      isCorrect: Boolean(isCorrect),
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
