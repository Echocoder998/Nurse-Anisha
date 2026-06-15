'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { Button, Eyebrow } from './ui';
import type { Language } from '@/lib/persona';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS: Record<Language, string[]> = {
  en: [
    'Explain the difference between selective and non-selective beta blockers',
    'What are the priority nursing assessments before giving digoxin?',
    'Give me 3 NCLEX questions on anticoagulants with rationales',
    'Walk me through the cytochrome P450 interactions I need to know',
  ],
  tl: [
    'Paliwanagin mo ang pagkakaiba ng selective at non-selective beta blockers',
    'Anong mga priority na assessments bago ibigay ang digoxin?',
    'Bigyan mo ako ng tatlong NCLEX questions tungkol sa anticoagulants',
    'Paliwanagin mo ang cytochrome P450 interactions',
  ],
};

const WELCOME: Record<Language, string> = {
  en: 'Ask anything — drug mechanisms, NCLEX practice, nursing considerations, or a confusing concept from lecture.',
  tl: 'Magtanong ka lang — kahit ano tungkol sa drug mechanisms, NCLEX practice, nursing considerations, o ano mang nakakalito sa lecture mo.',
};

const PLACEHOLDER: Record<Language, string> = {
  en: 'Ask a question...',
  tl: 'Magtanong ka...',
};

const TRY_LABEL: Record<Language, string> = {
  en: 'Try',
  tl: 'Subukan',
};

export function Tutor({ language }: { language: Language }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((m) => setMessages(m.map((x: any) => ({ role: x.role, content: x.content }))));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');
    setSending(true);
    try {
      const r = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language }),
      });
      const { reply } = await r.json();
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection hiccup — try again.' }]);
    }
    setSending(false);
  };

  const clearChat = async () => {
    await fetch('/api/chat', { method: 'DELETE' });
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-edge">
        <div>
          <Eyebrow>Conversation</Eyebrow>
          <h2 className="font-display text-2xl text-ink mt-0.5">
            {language === 'en' ? 'Ask your tutor' : 'Magtanong ka'}
          </h2>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 size={14} className="inline mr-1.5" /> Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto pt-8">
            <p className="font-display italic text-[1.15rem] text-ink-soft leading-relaxed">
              {WELCOME[language]}
            </p>
            <div className="mt-8 space-y-2">
              <Eyebrow>{TRY_LABEL[language]}</Eyebrow>
              {SUGGESTIONS[language].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="w-full text-left px-3 py-2.5 bg-paper border border-edge rounded text-[0.88rem] text-ink hover:bg-mist transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m, i) => (
              <div key={i}>
                <Eyebrow>{m.role === 'user' ? 'You' : 'Tutor'}</Eyebrow>
                <div
                  className={`mt-1.5 text-[0.95rem] leading-relaxed text-ink whitespace-pre-wrap pl-3.5 border-l-2 ${m.role === 'assistant' ? 'border-eucalyptus' : 'border-edge'}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div>
                <Eyebrow>Tutor</Eyebrow>
                <div className="flex items-center gap-2 mt-1 pl-3 text-ink-soft">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[0.88rem] italic">
                    {language === 'en' ? 'thinking' : 'nag-iisip'}
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-edge bg-paper">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={PLACEHOLDER[language]}
            rows={1}
            className="flex-1 px-3 py-2.5 border border-edge bg-bg resize-none font-body text-[0.92rem] text-ink outline-none rounded-sm min-h-[2.75rem] max-h-32"
          />
          <Button onClick={send} disabled={!input.trim() || sending}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
