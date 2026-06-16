'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Layers, BookOpen, Library as LibraryIcon, Headphones, Brain, Loader2 } from 'lucide-react';
import { Tutor } from '@/components/tutor';
import { Flashcards } from '@/components/flashcards';
import { Practice } from '@/components/practice';
import { Library } from '@/components/library';
import { Listen } from '@/components/listen';
import { Mnemonics } from '@/components/mnemonics';
import { LanguageSwitch } from '@/components/language-switch';
import type { Drug } from '@/lib/schema';
import type { Language } from '@/lib/persona';

type Mode = 'tutor' | 'flashcards' | 'practice' | 'library' | 'listen' | 'mnemonics';

const LANG_KEY = 'apothecary.language';

export default function Page() {
  const [mode, setMode] = useState<Mode>('tutor');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null;
    if (saved === 'en' || saved === 'tl') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  const refresh = useCallback(async () => {
    const [d, due] = await Promise.all([
      fetch('/api/drugs').then((r) => r.json()),
      fetch('/api/flashcards').then((r) => r.json()),
    ]);
    setDrugs(d);
    setDueCount(due.length);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoaded(true));
  }, [refresh]);

  const modes: { id: Mode; label: string; Icon: typeof MessageCircle; badge?: number | null }[] = [
    { id: 'tutor', label: 'Tutor', Icon: MessageCircle },
    { id: 'flashcards', label: 'Cards', Icon: Layers, badge: dueCount > 0 ? dueCount : null },
    { id: 'practice', label: 'Practice', Icon: BookOpen },
    { id: 'mnemonics', label: 'Mnemonics', Icon: Brain },
    { id: 'library', label: 'Library', Icon: LibraryIcon, badge: drugs.length > 0 ? drugs.length : null },
    { id: 'listen', label: 'Listen', Icon: Headphones },
  ];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-ink-soft">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen text-ink font-body">
      <div className="flex flex-col h-screen max-w-[1100px] mx-auto bg-bg">
        <div className="h-[3px] bg-eucalyptus flex-shrink-0" aria-hidden="true" />
        <header className="flex items-center justify-between px-6 py-4 border-b border-edge gap-3 bg-gradient-to-b from-eucalyptus-soft/30 to-transparent">
          <div className="flex items-baseline gap-3 min-w-0">
            <div className="text-eucalyptus shrink-0">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <polygon points="8,1 9.15,5.23 12.95,3.05 10.77,6.85 15,8 10.77,9.15 12.95,12.95 9.15,10.77 8,15 6.85,10.77 3.05,12.95 5.23,9.15 1,8 5.23,6.85 3.05,3.05 6.85,5.23" />
              </svg>
            </div>
            <h1 className="font-display text-[1.4rem] font-medium text-ink tracking-tight whitespace-nowrap">
              Anisha&rsquo;s NCLEX Lab
            </h1>
            <span className="font-display italic text-ink-faint text-[0.85rem] hidden md:inline">
              · NCLEX study companion
            </span>
          </div>
          <LanguageSwitch value={language} onChange={setLanguage} />
        </header>

        <nav className="flex overflow-x-auto border-b border-edge bg-paper">
          {modes.map((m) => {
            const active = mode === m.id;
            const Icon = m.Icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 shrink-0 min-w-[3.5rem] flex items-center justify-center gap-1.5 py-3 transition border-b-2 font-body text-[0.85rem] tracking-wide ${
                  active
                    ? 'text-eucalyptus bg-eucalyptus-soft border-eucalyptus font-semibold'
                    : 'text-ink-soft bg-transparent border-transparent font-medium'
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                <span className="hidden sm:inline">{m.label}</span>
                {m.badge != null && (
                  <span className="bg-honey text-white text-[0.65rem] px-1.5 py-px rounded-md font-mono ml-0.5">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-hidden">
          {mode === 'tutor' && <Tutor language={language} />}
          {mode === 'flashcards' && <Flashcards drugCount={drugs.length} onChange={refresh} />}
          {mode === 'practice' && <Practice language={language} />}
          {mode === 'mnemonics' && <Mnemonics language={language} />}
          {mode === 'library' && <Library drugs={drugs} onChange={refresh} language={language} />}
          {mode === 'listen' && <Listen language={language} />}
        </main>
      </div>
    </div>
  );
}
