'use client';

import { Trash2 } from 'lucide-react';
import { Eyebrow, IslamicDivider, Field } from './ui';
import type { Drug } from '@/lib/schema';

export function DrugCard({
  drug,
  onDelete,
  compact = false,
}: {
  drug: Drug;
  onDelete?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`bg-paper border border-edge rounded shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <Eyebrow>{drug.drugClass || 'Pharmacology'}</Eyebrow>
      <div className="flex items-baseline justify-between mt-1 mb-1">
        <h3
          className={`font-display font-medium text-ink leading-tight tracking-tight ${compact ? 'text-[1.4rem]' : 'text-[1.4rem] sm:text-[1.85rem]'}`}
        >
          {drug.name}
        </h3>
        {onDelete && (
          <button onClick={onDelete} className="text-ink-faint hover:opacity-70">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {drug.genericName && drug.genericName !== drug.name && (
        <div className="font-display italic text-ink-soft text-[0.95rem]">{drug.genericName}</div>
      )}
      <IslamicDivider className="my-3" />
      {!compact && (
        <div className="space-y-2.5 text-[0.88rem] text-ink leading-relaxed">
          {drug.indication && <Field label="Indication" value={drug.indication} />}
          {drug.moa && <Field label="Mechanism" value={drug.moa} />}
          {drug.dose && <Field label="Typical Dose" value={drug.dose} mono />}
          {drug.sideEffects && <Field label="Side Effects" value={drug.sideEffects} />}
          {drug.contraindications && (
            <Field label="Contraindications" value={drug.contraindications} />
          )}
          {drug.nursingConsiderations && (
            <Field label="Nursing" value={drug.nursingConsiderations} highlight />
          )}
        </div>
      )}
    </div>
  );
}
