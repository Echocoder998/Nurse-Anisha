import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const messages = await db
    .select()
    .from(chatMessages)
    .orderBy(asc(chatMessages.createdAt));
  return NextResponse.json(messages);
}

export async function DELETE() {
  await db.delete(chatMessages);
  return NextResponse.json({ ok: true });
}
