import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { chatMessages, drugs } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { anthropic, ChatMsg } from '@/lib/anthropic';
import { buildPersona, Language } from '@/lib/persona';

export async function POST(req: NextRequest) {
  const { content, language = 'en' } = (await req.json()) as {
    content: string;
    language?: Language;
  };
  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: 'content required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const history = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);

  const messages: ChatMsg[] = history
    .reverse()
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  messages.push({ role: 'user', content: content.trim() });

  const library = await db.select({ name: drugs.name }).from(drugs);
  const drugContext =
    library.length > 0
      ? `\n\n# Her current drug library\nShe is studying: ${library.map((d) => d.name).join(', ')}. Reference these when relevant; this is what's top-of-mind for her right now.`
      : '';

  const system = `${buildPersona(language)}${drugContext}`;
  const now = Date.now();

  await db.insert(chatMessages).values({
    id: nanoid(10),
    role: 'user',
    content: content.trim(),
    createdAt: now,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = '';
      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          system,
          messages,
        });
        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
        if (fullText) {
          await db
            .insert(chatMessages)
            .values({
              id: nanoid(10),
              role: 'assistant',
              content: fullText,
              createdAt: now + 1,
            })
            .catch(() => {});
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
