'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Sparkles, Loader2, RotateCw } from 'lucide-react';
import { Button, Eyebrow, Hairline } from './ui';
import type { Language } from '@/lib/persona';

export function Listen({ language }: { language: Language }) {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState(0.95);

  // filter voices by current language preference, with sensible fallback
  const voices = useMemo(() => {
    if (allVoices.length === 0) return [];
    const isTagalog = (v: SpeechSynthesisVoice) =>
      v.lang.toLowerCase().startsWith('fil') || v.lang.toLowerCase().startsWith('tl');
    const isEnglish = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith('en');

    if (language === 'tl') {
      const tagalogVoices = allVoices.filter(isTagalog);
      if (tagalogVoices.length > 0) return tagalogVoices;
      // fallback: any English voice will phonetically approximate
      return allVoices.filter(isEnglish);
    }
    return allVoices.filter(isEnglish);
  }, [allVoices, language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const load = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setAllVoices(v);
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', load);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // when language or voices change, pick a sensible default voice
  useEffect(() => {
    if (voices.length === 0) {
      setVoice(null);
      return;
    }
    setVoice((prev) => {
      // keep current voice if still valid for this language
      if (prev && voices.find((v) => v.name === prev.name)) return prev;
      const preferred =
        voices.find(
          (v) =>
            v.name.includes('Samantha') ||
            v.name.includes('Google') ||
            v.name.includes('Filipina') ||
            v.default
        ) || voices[0];
      return preferred;
    });
  }, [voices]);

  const generate = async () => {
    setLoading(true);
    setScript('');
    try {
      const r = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language }),
      });
      const { script: s } = await r.json();
      setScript(s);
    } catch {
      setScript('Could not generate. Try again.');
    }
    setLoading(false);
  };

  const play = () => {
    if (!script || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const pause = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  const heading = language === 'en' ? 'Listen' : 'Pakinggan';
  const subhead =
    language === 'en'
      ? 'A short spoken review you can listen to in the car, on a walk, or with eyes closed.'
      : 'Isang maikling spoken review na maaari mong pakinggan sa kotse, habang naglalakad, o nakapikit.';
  const topicLabel = language === 'en' ? 'Topic (optional)' : 'Paksa (optional)';
  const ctaLabel = loading
    ? language === 'en'
      ? 'Writing script...'
      : 'Sinusulat...'
    : language === 'en'
      ? 'Generate review'
      : 'Gumawa ng review';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-edge">
        <Eyebrow>Hands-free review</Eyebrow>
        <h2 className="font-display text-2xl text-ink mt-0.5">{heading}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="font-display italic text-ink-soft text-[1.05rem] leading-relaxed">{subhead}</p>

          <div className="mt-5">
            <Eyebrow>{topicLabel}</Eyebrow>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. cardiac glycosides, insulin types..."
              className="w-full mt-1.5 px-3 py-2.5 border border-edge bg-paper font-body text-[0.92rem] outline-none"
            />
          </div>

          <Button onClick={generate} disabled={loading} className="mt-4">
            {loading ? (
              <Loader2 size={14} className="inline mr-1.5 animate-spin" />
            ) : (
              <Sparkles size={14} className="inline mr-1.5" />
            )}
            {ctaLabel}
          </Button>

          {language === 'tl' && voices.length === 0 && allVoices.length > 0 && (
            <p className="mt-3 text-[0.8rem] text-ink-soft italic">
              No Tagalog voice detected on this device. The script will be in Tagalog but read by an English voice — pronunciation will be approximate. iOS &amp; Android Google TTS have native Filipino voices if you switch devices.
            </p>
          )}

          {script && (
            <>
              <div className="mt-6 bg-paper border border-edge p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {!playing ? (
                      <button
                        onClick={play}
                        className="flex items-center justify-center w-12 h-12 bg-eucalyptus text-white rounded-full hover:opacity-90"
                      >
                        <Play size={20} fill="white" />
                      </button>
                    ) : (
                      <button
                        onClick={pause}
                        className="flex items-center justify-center w-12 h-12 bg-ink text-white rounded-full hover:opacity-90"
                      >
                        <Pause size={20} fill="white" />
                      </button>
                    )}
                    <div>
                      <Eyebrow>{playing ? 'Playing' : 'Ready'}</Eyebrow>
                      <div className="font-display text-lg text-ink mt-0.5">
                        {topic || 'Pharmacology review'}
                      </div>
                    </div>
                  </div>
                </div>

                {voices.length > 1 && (
                  <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
                    <select
                      value={voice?.name || ''}
                      onChange={(e) =>
                        setVoice(voices.find((v) => v.name === e.target.value) || null)
                      }
                      className="px-2 py-1 border border-edge bg-bg font-body text-[0.78rem] outline-none"
                    >
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.75rem] text-ink-soft font-body">Speed</span>
                      <input
                        type="range"
                        min="0.6"
                        max="1.5"
                        step="0.05"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-20"
                      />
                      <span className="font-mono text-[0.72rem] text-ink-faint min-w-[2rem]">
                        {rate.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                )}

                <Hairline className="my-4" />
                <p className="font-display text-[0.95rem] leading-loose text-ink whitespace-pre-wrap">
                  {script}
                </p>
              </div>
              <Button variant="secondary" onClick={generate} className="mt-3" disabled={loading}>
                <RotateCw size={14} className="inline mr-1.5" /> {language === 'en' ? 'New script' : 'Bagong script'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
