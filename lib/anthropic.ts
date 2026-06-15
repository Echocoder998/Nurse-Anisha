import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

export async function complete(
  messages: ChatMsg[],
  system: string,
  maxTokens = 1500
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
    messages,
  });
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('\n');
}

export async function completeJSON<T = any>(
  prompt: string,
  system: string,
  maxTokens = 2000
): Promise<T> {
  const text = await complete(
    [{ role: 'user', content: prompt }],
    `${system}\n\nRespond ONLY with valid JSON. No markdown code fences. No preamble.`,
    maxTokens
  );
  const cleaned = text.replace(/^```json\s*|^```\s*|```\s*$/gm, '').trim();
  return JSON.parse(cleaned);
}
