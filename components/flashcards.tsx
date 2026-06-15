'use client';

import { useState, useEffect } from 'react';
import { Check, RotateCw, Loader2 } from 'lucide-react';
import { Button, Eyebrow, Hairline, Field, EmptyState } from './ui';
import type { Drug, Flashcard } from '@/lib/schema';

type DueCard = Flashcard & { drug: Drug };

export function Flashcards({ drugCount, onChange }: { drugCount: number; onChange: () => void }) {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);

  const loadDue = async () => {
    setLoading(true);
    const r = await fetch('/api/flashcards');
    const due: DueCard[] = await r.json();
    setCards(due);
    setCurrent(0);
    setRevealed(false);
    setSessionDone(due.length === 0);
    setLoading(false);
  };

  useEffect(() => {
    loadDue();
  }, [drugCount]);

  const grade = async (quality: number) => {
    const card = cards[current];
    await fetch('/api/flashcards/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, quality }),
    });
    onChange();
    if (current + 1 >= cards.length) setSessionDone(true);
    else {
      setCurrent(current + 1);
      setRevealed(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-ink-soft">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (drugCount === 0) {
    return (
      <EmptyState
        title="No cards yet"
        body="Add drugs to your library — upload class notes, paste lecture text, or generate from a topic — and flashcards appear here automatically."
      />
    );
  }

  if (sessionDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="text-eucalyptus">
          <Check size={48} strokeWidth={1} />
        </div>
        <h2 className="font-display text-3xl text-ink mt-4">Caught up</h2>
        <p className="font-display italic text-ink-soft mt-2 text-center max-w-md">
          Nothing due right now. Come back later, or reload to start over.
        </p>
        <Button onClick={loadDue} variant="secondary" className="mt-6">
          <RotateCw size={14} className="inline mr-1.5" /> Reload
        </Button>
      </div>
    );
  }

  const card = cards[current];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
        <div>
          <Eyebrow>Spaced repetition</Eyebrow>
          <h2 className="font-display text-2xl text-ink mt-0.5">Flashcards</h2>
        </div>
        <div className="font-mono text-[0.85rem] text-ink-soft">
          {current + 1} / {cards.length}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-xl">
          <div
            className={`bg-paper border border-edge p-10 min-h-[24rem] ${revealed ? '' : 'cursor-pointer'}`}
            onClick={() => !revealed && setRevealed(true)}
          >
            <Eyebrow>{card.drug.drugClass || 'Drug'}</Eyebrow>
            <h3 className="font-display text-[2.5rem] text-ink mt-2 leading-none tracking-tight">
              {card.drug.name}
            </h3>
            {card.drug.genericName && card.drug.genericName !== card.drug.name && (
              <div className="font-display italic text-ink-soft text-lg">{card.drug.genericName}</div>
            )}
            <Hairline className="my-5" />
            {!revealed ? (
              <div className="text-center py-8 text-ink-faint italic font-display">
                Tap to reveal
              </div>
            ) : (
              <div className="space-y-3 text-[0.9rem] text-ink leading-relaxed">
                {card.drug.moa && <Field label="MOA" value={card.drug.moa} />}
                {card.drug.indication && <Field label="Used for" value={card.drug.indication} />}
                {card.drug.sideEffects && <Field label="Side fx" value={card.drug.sideEffects} />}
                {card.drug.nursingConsiderations && (
                  <Field label="Nursing" value={card.drug.nursingConsiderations} highlight />
                )}
              </div>
            )}
          </div>

          {revealed && (
            <div className="mt-4">
              <Eyebrow>How well did you remember?</Eyebrow>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <GradeButton onClick={() => grade(0)} label="Again" sublabel="<1m" tone="vermillion" />
                <GradeButton onClick={() => grade(3)} label="Hard" sublabel="hard" tone="honey" />
                <GradeButton onClick={() => grade(4)} label="Good" sublabel="usual" tone="eucalyptus" />
                <GradeButton onClick={() => grade(5)} label="Easy" sublabel="quick" tone="ink-soft" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GradeButton({
  onClick,
  label,
  sublabel,
  tone,
}: {
  onClick: () => void;
  label: string;
  sublabel: string;
  tone: 'vermillion' | 'honey' | 'eucalyptus' | 'ink-soft';
}) {
  const borderClass = {
    vermillion: 'border-vermillion',
    honey: 'border-honey',
    eucalyptus: 'border-eucalyptus',
    'ink-soft': 'border-ink-soft',
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`bg-paper border border-t-[3px] ${borderClass} py-2.5 px-2 text-ink hover:opacity-80 transition active:scale-[0.98]`}
    >
      <div className="text-[0.85rem] font-semibold">{label}</div>
      <div className="text-[0.7rem] text-ink-faint font-mono mt-0.5">{sublabel}</div>
    </button>
  );
}
