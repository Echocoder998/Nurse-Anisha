import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  let text = '';
  try {
    if (name.endsWith('.pdf')) {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text: pages } = await extractText(pdf, { mergePages: true });
      text = Array.isArray(pages) ? pages.join('\n\n') : pages;
    } else if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value;
    } else {
      text = buf.toString('utf-8');
    }
  } catch (e: any) {
    return NextResponse.json({ error: `Could not parse: ${e.message}` }, { status: 400 });
  }

  return NextResponse.json({ text });
}
