'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button, Eyebrow, IslamicDivider } from './ui';
import type { Language } from '@/lib/persona';

type MnemonicItem = {
  title: string;
  type: 'acronym' | 'sentence' | 'rhyme' | 'story';
  breakdown: { letter: string; meaning: string }[];
  tip: string;
};

const TYPE_COLORS: Record<string, string> = {
  acronym: 'bg-honey-soft text-eucalyptus',
  sentence: 'bg-eucalyptus-soft text-eucalyptus',
  rhyme: 'bg-mist text-ink-soft',
  story: 'bg-vermillion-soft text-vermillion',
};

export function Mnemonics({ language }: { language: Language }) {
  const [topic, setTopic] = useState('');
  const [mnemonics, setMnemonics] = useState<MnemonicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setMnemonics([]);
    setError('');
    try {
      const r = await fetch('/api/mnemonics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else setMnemonics(data.mnemonics ?? []);
    } catch {
      setError('Could not generate. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-edge">
        <Eyebrow>Memory aids</Eyebrow>
        <h2 className="font-display text-2xl text-ink mt-0.5">
          {language === 'en' ? 'Mnemonics' : 'Mga Mnemonic'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="font-display italic text-ink-soft text-[1.05rem] leading-relaxed">
            {language === 'en'
              ? 'Type any nursing topic and get 2–4 memory aids built for NCLEX retention.'
              : 'Mag-type ng kahit anong nursing topic at makakakuha ng memory aids para sa NCLEX.'}
          </p>

          <div className="mt-5">
            <Eyebrow>{language === 'en' ? 'Topic' : 'Paksa'}</Eyebrow>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder={
                language === 'en'
                  ? "e.g. beta blockers, APGAR score, signs of meningitis, 5 rights of medication, Maslow's hierarchy..."
                  : "hal. beta blockers, APGAR score, signs of meningitis, Maslow's hierarchy..."
              }
              className="w-full mt-1.5 px-3 py-2.5 border border-edge bg-paper font-body text-[0.92rem] outline-none"
            />
          </div>

          <Button onClick={generate} disabled={!topic.trim() || loading} className="mt-4">
            {loading ? (
              <Loader2 size={14} className="inline mr-1.5 animate-spin" />
            ) : (
              <Sparkles size={14} className="inline mr-1.5" />
            )}
            {loading
              ? language === 'en' ? 'Generating...' : 'Gumagawa...'
              : language === 'en' ? 'Generate mnemonics' : 'Gumawa ng mnemonics'}
          </Button>

          {error && <p className="mt-4 text-vermillion text-[0.88rem]">{error}</p>}

          {mnemonics.length > 0 && (
            <div className="mt-8">
              {mnemonics.map((m, i) => (
                <div key={i}>
                  {i > 0 && <IslamicDivider className="my-6" />}
                  <div className="bg-paper border border-edge p-5 sm:p-6 rounded shadow-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.68rem] font-mono uppercase tracking-wider font-semibold ${TYPE_COLORS[m.type] ?? 'bg-mist text-ink-soft'}`}
                    >
                      {m.type}
                    </span>
                    <h3 className="font-display text-[1.6rem] sm:text-[2rem] text-eucalyptus mt-2 leading-tight tracking-tight">
                      {m.title}
                    </h3>
                    {m.breakdown?.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        {m.breakdown.map((b, j) => (
                          <div key={j} className="flex gap-3 text-[0.88rem]">
                            <span className="font-mono font-semibold text-ink min-w-[1.75rem] shrink-0">
                              {b.letter}
                            </span>
                            <span className="text-ink-soft leading-snug">{b.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.tip && (
                      <p className="mt-4 font-display italic text-ink-soft text-[0.92rem] leading-relaxed border-l-2 border-honey pl-3">
                        {m.tip}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
