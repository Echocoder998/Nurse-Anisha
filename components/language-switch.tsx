'use client';

import type { Language } from '@/lib/persona';

const OPTIONS: { id: Language; label: string; full: string }[] = [
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'tl', label: 'TL', full: 'Tagalog' },
];

export function LanguageSwitch({
  value,
  onChange,
}: {
  value: Language;
  onChange: (l: Language) => void;
}) {
  return (
    <div className="flex border border-edge bg-paper rounded-sm overflow-hidden shrink-0">
      {OPTIONS.map((opt, i) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.full}
            className={`px-2.5 py-1 font-mono text-[0.7rem] tracking-wider transition ${
              active
                ? 'bg-eucalyptus text-white'
                : 'bg-paper text-ink-soft hover:bg-mist'
            } ${i > 0 ? 'border-l border-edge' : ''}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
