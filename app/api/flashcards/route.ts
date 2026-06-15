import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flashcards, drugs } from '@/lib/schema';
import { lte, eq } from 'drizzle-orm';

export async function GET() {
  const now = Date.now();
  const due = await db
    .select({
      id: flashcards.id,
      drugId: flashcards.drugId,
      ease: flashcards.ease,
      interval: flashcards.interval,
      reps: flashcards.reps,
      nextReview: flashcards.nextReview,
      drug: drugs,
    })
    .from(flashcards)
    .innerJoin(drugs, eq(flashcards.drugId, drugs.id))
    .where(lte(flashcards.nextReview, now));

  // shuffle
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }

  return NextResponse.json(due);
}
