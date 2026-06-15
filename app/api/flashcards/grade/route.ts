import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flashcards } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sm2 } from '@/lib/sm2';

export async function POST(req: NextRequest) {
  const { id, quality } = await req.json();
  if (!id || typeof quality !== 'number') {
    return NextResponse.json({ error: 'id and quality required' }, { status: 400 });
  }
  const [card] = await db.select().from(flashcards).where(eq(flashcards.id, id));
  if (!card) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const updated = sm2(card, quality);
  await db
    .update(flashcards)
    .set({
      ease: updated.ease,
      interval: updated.interval,
      reps: updated.reps,
      nextReview: updated.nextReview,
    })
    .where(eq(flashcards.id, id));

  return NextResponse.json({ ok: true, ...updated });
}
