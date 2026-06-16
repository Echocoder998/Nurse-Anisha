'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Eyebrow, Hairline } from './ui';
import type { Language } from '@/lib/persona';

const SUBJECT_LABEL: Record<string, string> = {
  pharmacology: 'Pharmacology',
  fundamentals: 'Fundamentals',
  'med-surg': 'Med-Surg',
  maternal: 'Maternal',
  pediatrics: 'Pediatrics',
  'mental-health': 'Mental Health',
  leadership: 'Leadership',
  community: 'Community',
};

type SubjectStat = { subject: string; total: number; correct: number };
type Stats = { total: number; correct: number; bySubject: SubjectStat[] };

function StatCard({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="bg-paper border border-edge rounded shadow-sm p-4 text-center">
      <div
        className={`font-display text-[2rem] font-semibold leading-none ${
          accent ? 'text-eucalyptus' : 'text-ink'
        }`}
      >
        {value}
      </div>
      <div className="text-[0.68rem] text-ink-faint font-body mt-1.5 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export function Progress({ language, dueCount }: { language: Language; dueCount: number }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/practice')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-ink-soft">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const overall = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const subjectStats = (stats.bySubject ?? [])
    .filter((s) => s.total > 0)
    .sort((a, b) => a.correct / a.total - b.correct / b.total);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-edge">
        <Eyebrow>Your progress</Eyebrow>
        <h2 className="font-display text-2xl text-ink mt-0.5">Dashboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={String(stats.total)} label="Questions" />
            <StatCard value={String(stats.correct)} label="Correct" />
            <StatCard value={`${overall}%`} label="Accuracy" accent />
            <StatCard value={String(dueCount)} label="Cards Due" />
          </div>

          {subjectStats.length > 0 ? (
            <div className="mt-8">
              <Eyebrow>Accuracy by subject</Eyebrow>
              <Hairline className="mt-2 mb-4" />
              <div className="space-y-4">
                {subjectStats.map((s) => {
                  const pct = Math.round((s.correct / s.total) * 100);
                  const label = SUBJECT_LABEL[s.subject] ?? s.subject;
                  return (
                    <div key={s.subject}>
                      <div className="flex justify-between items-baseline text-[0.82rem] mb-1.5">
                        <span className="font-body text-ink font-medium">{label}</span>
                        <span className="font-mono text-ink-soft text-[0.75rem]">
                          {pct}%{' '}
                          <span className="text-ink-faint">
                            ({s.correct}/{s.total})
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-edge rounded-full overflow-hidden">
                        <div
                          className="h-full bg-eucalyptus rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="font-display italic text-ink-soft text-[1.05rem] leading-relaxed mt-8">
              {language === 'en'
                ? 'No practice questions yet — head to Practice to get started.'
                : 'Wala pang practice questions. Pumunta sa Practice para magsimula.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
