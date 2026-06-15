'use client';

import { useState, useMemo } from 'react';
import { Plus, Upload, FileText, Sparkles, Loader2, Search } from 'lucide-react';
import { Button, Eyebrow, EmptyState } from './ui';
import { DrugCard } from './drug-card';
import type { Drug } from '@/lib/schema';
import type { Language } from '@/lib/persona';

export function Library({
  drugs,
  onChange,
  language,
}: {
  drugs: Drug[];
  onChange: () => void;
  language: Language;
}) {
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [generateTopic, setGenerateTopic] = useState('');
  const [search, setSearch] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportProgress('Reading file...');
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await fetch('/api/library/upload', { method: 'POST', body: form });
      const { text, error } = await r.json();
      if (error) throw new Error(error);
      setImportProgress('Extracting drug cards...');
      const r2 = await fetch('/api/library/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      const { added } = await r2.json();
      setImportProgress(`Added ${added} drugs`);
      onChange();
      setTimeout(() => {
        setImportProgress('');
        setShowImport(false);
        setImporting(false);
      }, 1500);
    } catch (err: any) {
      setImportProgress(`Error: ${err.message}`);
      setTimeout(() => {
        setImportProgress('');
        setImporting(false);
      }, 3000);
    }
    e.target.value = '';
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    setImporting(true);
    setImportProgress('Extracting drugs...');
    const r = await fetch('/api/library/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: pasteText, language }),
    });
    const { added } = await r.json();
    setImportProgress(`Added ${added} drugs`);
    onChange();
    setPasteText('');
    setTimeout(() => {
      setImportProgress('');
      setShowImport(false);
      setImporting(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!generateTopic.trim()) return;
    setImporting(true);
    setImportProgress(`Generating cards for "${generateTopic}"...`);
    try {
      const r = await fetch('/api/library/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: generateTopic, language }),
      });
      const { added } = await r.json();
      setImportProgress(`Added ${added} drugs`);
      onChange();
    } catch {
      setImportProgress('Could not generate. Try again.');
    }
    setGenerateTopic('');
    setTimeout(() => {
      setImportProgress('');
      setShowImport(false);
      setImporting(false);
    }, 1500);
  };

  const deleteDrug = async (id: string) => {
    await fetch(`/api/drugs?id=${id}`, { method: 'DELETE' });
    onChange();
  };

  const filtered = useMemo(() => {
    if (!search) return drugs;
    const s = search.toLowerCase();
    return drugs.filter(
      (d) =>
        d.name?.toLowerCase().includes(s) ||
        d.genericName?.toLowerCase().includes(s) ||
        d.drugClass?.toLowerCase().includes(s)
    );
  }, [drugs, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
        <div>
          <Eyebrow>
            {drugs.length} drug{drugs.length !== 1 ? 's' : ''}
          </Eyebrow>
          <h2 className="font-display text-2xl text-ink mt-0.5">Library</h2>
        </div>
        <Button onClick={() => setShowImport(!showImport)}>
          <Plus size={14} className="inline mr-1.5" /> Add drugs
        </Button>
      </div>

      {showImport && (
        <div className="bg-mist border-b border-edge p-6">
          <div className="max-w-3xl mx-auto">
            {importing ? (
              <div className="flex items-center gap-3 py-2 text-ink">
                <Loader2 size={18} className="animate-spin" />
                <span className="font-display italic">{importProgress || 'Working...'}</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <ImportOption
                  icon={<Upload size={18} />}
                  title="Upload file"
                  body="PDF, DOCX, or text"
                >
                  <label className="cursor-pointer inline-block mt-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <span className="inline-block bg-eucalyptus text-white px-3 py-1.5 font-body text-[0.82rem] font-medium rounded-sm hover:opacity-90">
                      Choose file
                    </span>
                  </label>
                </ImportOption>
                <ImportOption icon={<FileText size={18} />} title="Paste notes" body="Lecture text, study guide">
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste lecture notes..."
                    rows={3}
                    className="w-full mt-2 p-2 border border-edge text-[0.85rem] font-body bg-paper outline-none resize-y"
                  />
                  <Button size="sm" onClick={handlePaste} disabled={!pasteText.trim()} className="mt-1.5">
                    Extract
                  </Button>
                </ImportOption>
                <ImportOption icon={<Sparkles size={18} />} title="Generate by topic" body="High-yield NCLEX drugs">
                  <input
                    value={generateTopic}
                    onChange={(e) => setGenerateTopic(e.target.value)}
                    placeholder="e.g. antihypertensives"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    className="w-full mt-2 p-2 border border-edge text-[0.85rem] font-body bg-paper outline-none"
                  />
                  <Button size="sm" onClick={handleGenerate} disabled={!generateTopic.trim()} className="mt-1.5">
                    Generate
                  </Button>
                </ImportOption>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {drugs.length === 0 ? (
          <EmptyState
            title="Your library is empty"
            body="Upload her pharm lecture notes, paste text, or generate a starter set by topic. Drug cards auto-populate flashcards and feed the practice generator."
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or class..."
                className="w-full pl-9 pr-3 py-2 border border-edge bg-paper font-body text-[0.88rem] outline-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {filtered.map((drug) => (
                <DrugCard key={drug.id} drug={drug} onDelete={() => deleteDrug(drug.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImportOption({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper border border-edge p-4 rounded shadow-sm">
      <div className="text-eucalyptus">{icon}</div>
      <div className="font-display text-base text-ink mt-1.5 font-medium">{title}</div>
      <div className="text-[0.78rem] text-ink-soft font-body mt-0.5">{body}</div>
      {children}
    </div>
  );
}
