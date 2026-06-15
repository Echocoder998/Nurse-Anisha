import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drugs, flashcards } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET() {
  const all = await db.select().from(drugs).orderBy(desc(drugs.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const inserted = [];
  const now = Date.now();
  for (const item of items) {
    if (!item.name) continue;
    const drug = {
      id: nanoid(10),
      createdAt: now,
      name: item.name,
      genericName: item.genericName ?? null,
      drugClass: item.drugClass ?? null,
      indication: item.indication ?? null,
      moa: item.moa ?? null,
      dose: item.dose ?? null,
      sideEffects: item.sideEffects ?? null,
      contraindications: item.contraindications ?? null,
      nursingConsiderations: item.nursingConsiderations ?? null,
    };
    await db.insert(drugs).values(drug);
    // auto-create flashcard
    await db.insert(flashcards).values({
      id: nanoid(10),
      drugId: drug.id,
      ease: 2.5,
      interval: 0,
      reps: 0,
      nextReview: now,
    });
    inserted.push(drug);
  }
  return NextResponse.json(inserted);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.delete(drugs).where(eq(drugs.id, id));
  return NextResponse.json({ ok: true });
}
