'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, X, SkipForward } from 'lucide-react';
import { Button, Eyebrow, Hairline } from './ui';
import type { Language } from '@/lib/persona';

type Question = {
  scenario: string;
  stem: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  distractorNotes?: string;
};

type Subject = {
  id: string;
  label: string;
};

const SUBJECTS: Subject[] = [
  { id: 'pharmacology', label: 'Pharmacology' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'med-surg', label: 'Med-Surg' },
  { id: 'maternal', label: 'Maternal' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'mental-health', label: 'Mental Health' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'community', label: 'Community' },
];

export function Practice({ language }: { language: Language }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('pharmacology');
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/practice')
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const generate = async () => {
    setLoading(true);
    setSelected(null);
    setRevealed(false);
    setError('');
    try {
      const r = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', topic, language, subject }),
      });
      const q = await r.json();
      if (q.error) setError(q.error);
      else setQuestion(q);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const submit = async () => {
    if (selected === null || !question) return;
    setRevealed(true);
    const isCorrect = selected === question.correctIndex;
    const newStats = { correct: stats.correct + (isCorrect ? 1 : 0), total: stats.total + 1 };
    setStats(newStats);
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record', topic, isCorrect, subject }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-edge">
        <div>
          <Eyebrow>NCLEX-style practice</Eyebrow>
          <h2 className="font-display text-2xl text-ink mt-0.5">Question generator</h2>
        </div>
        {stats.total > 0 && (
          <div className="text-right">
            <div className="font-mono text-[0.8rem] text-ink-soft">
              {stats.correct} / {stats.total}
            </div>
            <div className="text-[0.7rem] text-ink-faint font-mono">
              {Math.round((stats.correct / stats.total) * 100)}% accuracy
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {!question && !loading && (
            <div>
              <p className="font-display italic text-ink-soft text-[1.05rem] leading-relaxed">
                Choose a subject, then generate an NCLEX-style question. Leave the topic blank to
                let the AI pick a high-yield topic for you.
              </p>

              <div className="mt-5">
                <Eyebrow>Subject</Eyebrow>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUBJECTS.map((s) => {
                    const active = subject === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSubject(s.id)}
                        className={`px-3 py-1.5 text-[0.8rem] border rounded-full transition font-body ${
                          active
                            ? 'bg-eucalyptus text-white border-eucalyptus'
                            : 'bg-paper text-ink-soft border-edge hover:border-ink-soft'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <Eyebrow>Topic (optional)</Eyebrow>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    subject === 'pharmacology'
                      ? 'e.g. anticoagulants, antibiotics, opioid reversal...'
                      : subject === 'fundamentals'
                        ? 'e.g. wound care, infection control, vital signs...'
                        : subject === 'mental-health'
                          ? 'e.g. schizophrenia, therapeutic communication, crisis...'
                          : 'e.g. leave blank for a random high-yield topic'
                  }
                  className="w-full mt-1.5 px-3 py-2.5 border border-edge bg-paper font-body text-[0.92rem] outline-none"
                />
              </div>
              <Button onClick={generate} className="mt-4">
                <Sparkles size={14} className="inline mr-1.5" /> Generate question
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-12 text-ink-soft">
              <Loader2 className="animate-spin" />
              <span className="font-display italic">Writing your question...</span>
            </div>
          )}

          {error && <div className="text-vermillion font-body">{error}</div>}

          {question?.stem && (
            <div>
              <div className="bg-paper border border-edge p-6 rounded shadow-sm">
                <Eyebrow>Scenario</Eyebrow>
                <p className="font-body text-[0.95rem] leading-relaxed text-ink mt-1.5">
                  {question.scenario}
                </p>
                <Hairline className="my-4" />
                <p className="font-display text-lg leading-relaxed text-ink font-medium">
                  {question.stem}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === question.correctIndex;
                  let border = 'border-edge';
                  let bg = 'bg-paper';
                  if (revealed) {
                    if (isCorrect) {
                      border = 'border-eucalyptus';
                      bg = 'bg-eucalyptus-soft';
                    } else if (isSelected) {
                      border = 'border-vermillion';
                      bg = 'bg-vermillion-soft';
                    }
                  } else if (isSelected) {
                    border = 'border-ink';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => !revealed && setSelected(i)}
                      disabled={revealed}
                      className={`w-full text-left transition rounded ${bg} border border-l-[3px] ${border} px-4 py-3.5 font-body text-[0.92rem] text-ink ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {opt}
                      {revealed && isCorrect && (
                        <Check size={14} className="text-eucalyptus ml-2 inline" />
                      )}
                      {revealed && isSelected && !isCorrect && (
                        <X size={14} className="text-vermillion ml-2 inline" />
                      )}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="mt-5 bg-paper border border-edge border-l-[3px] border-l-honey p-5 rounded shadow-sm">
                  <Eyebrow>Rationale</Eyebrow>
                  <p className="font-body text-[0.9rem] leading-relaxed text-ink mt-1.5">
                    {question.rationale}
                  </p>
                  {question.distractorNotes && (
                    <>
                      <Hairline className="my-3" />
                      <Eyebrow>Why the others are wrong</Eyebrow>
                      <p className="font-body text-[0.85rem] leading-relaxed text-ink-soft mt-1.5">
                        {question.distractorNotes}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {!revealed ? (
                  <Button onClick={submit} disabled={selected === null}>
                    Submit answer
                  </Button>
                ) : (
                  <Button onClick={generate}>
                    <SkipForward size={14} className="inline mr-1.5" /> Next question
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuestion(null);
                    setSelected(null);
                    setRevealed(false);
                  }}
                >
                  Change topic
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
