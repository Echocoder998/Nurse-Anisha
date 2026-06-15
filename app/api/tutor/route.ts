import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessages, drugs } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { complete, ChatMsg } from '@/lib/anthropic';
import { buildPersona, Language } from '@/lib/persona';

export async function POST(req: NextRequest) {
  const { content, language = 'en' } = (await req.json()) as {
    content: string;
    language?: Language;
  };
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 });
  }

  // chat history for context
  const history = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);
  const messages: ChatMsg[] = history
    .reverse()
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  messages.push({ role: 'user', content: content.trim() });

  // drug library context
  const library = await db.select({ name: drugs.name }).from(drugs);
  const drugContext =
    library.length > 0
      ? `\n\n# Her current drug library\nShe is studying: ${library.map((d) => d.name).join(', ')}. Reference these when relevant; this is what's top-of-mind for her right now.`
      : '';

  const system = `${buildPersona(language)}${drugContext}`;
  const reply = await complete(messages, system, 1200);

  // persist both messages
  const now = Date.now();
  await db.insert(chatMessages).values([
    { id: nanoid(10), role: 'user', content: content.trim(), createdAt: now },
    { id: nanoid(10), role: 'assistant', content: reply, createdAt: now + 1 },
  ]);

  return NextResponse.json({ reply });
}
