'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, X, SkipForward, RotateCw } from 'lucide-react';
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

type Stats = {
  correct: number;
  total: number;
  bySubject?: { subject: string; total: number; correct: number }[];
};

const SUBJECTS = [
  { id: 'pharmacology', label: 'Pharmacology' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'med-surg', label: 'Med-Surg' },
  { id: 'maternal', label: 'Maternal' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'mental-health', label: 'Mental Health' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'community', label: 'Community' },
];

function AccuracyRing({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? correct / total : 0;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const arc = pct * circ;
  return (
    <div className="flex flex-col items-center">
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        aria-label={`${Math.round(pct * 100)}% accuracy`}
      >
        <circle cx="21" cy="21" r={r} fill="none" stroke="#DDD6CE" strokeWidth="2.5" />
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke="#2A9D8F"
          strokeWidth="2.5"
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
        />
        <text
          x="21"
          y="25"
          textAnchor="middle"
          fontSize="7.5"
          fill="#5C3A56"
          fontFamily="monospace"
          fontWeight="500"
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className="text-[0.65rem] text-ink-faint font-mono leading-none mt-0.5">
        {correct}/{total}
      </div>
    </div>
  );
}

export function Practice({ language }: { language: Language }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('pharmacology');
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0 });
  const [error, setError] = useState('');
  const [reviewQueue, setReviewQueue] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    fetch('/api/practice').then((r) => r.json()).then(setStats);
  }, []);

  const generate = async () => {
    setLoading(true);
    setSelected(null);
    setRevealed(false);
    setError('');
    setReviewMode(false);
    setReviewDone(false);
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

  const startReview = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/practice?review=true');
      const { questions } = await r.json();
      if (!questions?.length) {
        setError('No saved mistakes yet — answer some questions first!');
      } else {
        setReviewQueue(questions);
        setReviewIndex(0);
        setQuestion(questions[0]);
        setSelected(null);
        setRevealed(false);
        setReviewMode(true);
        setReviewDone(false);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const submit = async () => {
    if (selected === null || !question) return;
    setRevealed(true);
    const isCorrect = selected === question.correctIndex;
    setStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        topic,
        isCorrect,
        subject,
        questionJson: isCorrect ? null : question,
      }),
    });
  };

  const nextReview = () => {
    const next = reviewIndex + 1;
    if (next < reviewQueue.length) {
      setReviewIndex(next);
      setQuestion(reviewQueue[next]);
      setSelected(null);
      setRevealed(false);
    } else {
      setReviewDone(true);
      setQuestion(null);
      setReviewMode(false);
    }
  };

  const resetToSetup = () => {
    setQuestion(null);
    setSelected(null);
    setRevealed(false);
    setReviewMode(false);
    setReviewDone(false);
    setError('');
  };

  const showSetup = !question && !loading && !reviewDone;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-edge">
        <div>
          <Eyebrow>NCLEX-style practice</Eyebrow>
          <h2 className="font-display text-2xl text-ink mt-0.5">
            {reviewMode ? 'Review mistakes' : 'Question generator'}
          </h2>
        </div>
        {stats.total > 0 && <AccuracyRing correct={stats.correct} total={stats.total} />}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {showSetup && (
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
                  onKeyDown={(e) => e.key === 'Enter' && generate()}
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

              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={generate}>
                  <Sparkles size={14} className="inline mr-1.5" /> Generate question
                </Button>
                <Button variant="secondary" onClick={startReview}>
                  <RotateCw size={14} className="inline mr-1.5" /> Review mistakes
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-12 text-ink-soft">
              <Loader2 className="animate-spin" />
              <span className="font-display italic">
                {reviewMode ? 'Loading review queue...' : 'Writing your question...'}
              </span>
            </div>
          )}

          {error && <div className="text-vermillion font-body mt-2">{error}</div>}

          {reviewDone && (
            <div className="text-center py-12">
              <div className="text-eucalyptus">
                <Check size={40} strokeWidth={1} className="mx-auto" />
              </div>
              <h3 className="font-display text-2xl text-ink mt-4">Review complete</h3>
              <p className="font-display italic text-ink-soft mt-2">
                You worked through all {reviewQueue.length} saved mistake
                {reviewQueue.length !== 1 ? 's' : ''}.
              </p>
              <Button onClick={resetToSetup} className="mt-6">
                Back to practice
              </Button>
            </div>
          )}

          {question?.stem && (
            <div>
              {reviewMode && (
                <div className="mb-3">
                  <span className="text-[0.72rem] font-mono text-ink-faint">
                    Mistake {reviewIndex + 1} of {reviewQueue.length}
                  </span>
                </div>
              )}

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
                    if (isCorrect) { border = 'border-eucalyptus'; bg = 'bg-eucalyptus-soft'; }
                    else if (isSelected) { border = 'border-vermillion'; bg = 'bg-vermillion-soft'; }
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
                ) : reviewMode ? (
                  <Button onClick={nextReview}>
                    <SkipForward size={14} className="inline mr-1.5" />
                    {reviewIndex + 1 < reviewQueue.length ? 'Next mistake' : 'Finish review'}
                  </Button>
                ) : (
                  <Button onClick={generate}>
                    <SkipForward size={14} className="inline mr-1.5" /> Next question
                  </Button>
                )}
                <Button variant="secondary" onClick={resetToSetup}>
                  {reviewMode ? 'Exit review' : 'Change topic'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
