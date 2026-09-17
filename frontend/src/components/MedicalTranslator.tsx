'use client';

import React, { useState } from 'react';
import { fetchFromAPI } from '@/lib/api';
import { ArrowUpDown, Send, Volume2, Copy, Check } from 'lucide-react';

export default function MedicalTranslator() {
  const [sourceLang, setSourceLang] = useState<'en' | 'hi'>('en');
  const [targetLang, setTargetLang] = useState<'en' | 'hi'>('hi');
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const presetsEn = [
    "I have chest pain since morning",
    "Take 1 tablet twice daily after meals",
    "Complete this 5-day antibiotic course",
    "Do I need to fast before blood test?"
  ];
  const presetsHi = [
    "मुझे सुबह से सीने में दर्द है",
    "यह दवा खाली पेट लेनी है?",
    "तीन दिनों से तेज बुखार है",
    "क्या इस दवा से नींद आती है?"
  ];

  const swap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result) {
      setInputText(result.translatedText || '');
      setResult(null);
    }
  };

  const translate = async (text?: string) => {
    const t = text || inputText;
    if (!t.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetchFromAPI('/translate', {
        method: 'POST',
        body: JSON.stringify({ text: t, sourceLang, targetLang })
      });
      if (res.success) setResult(res.data);
    } catch (err) {
      console.error('Translation error', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const speak = (text: string, lang: string) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = sourceLang === 'en' ? presetsEn : presetsHi;

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Translate</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Medical English ↔ Hindi
        </p>
      </div>

      {/* Language selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          flex: 1, textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.9rem'
        }}>
          {sourceLang === 'en' ? 'English' : 'हिन्दी'}
        </span>
        <button
          onClick={swap}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ArrowUpDown size={16} color="var(--accent)" />
        </button>
        <span style={{
          flex: 1, textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.9rem'
        }}>
          {targetLang === 'en' ? 'English' : 'हिन्दी'}
        </span>
      </div>

      {/* Input */}
      <textarea
        className="input-minimal"
        placeholder={sourceLang === 'en' ? 'Type a medical phrase...' : 'चिकित्सा वाक्य लिखें...'}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        rows={3}
        style={{ resize: 'none', fontFamily: 'var(--font-apple)' }}
      />

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => { setInputText(p); translate(p); }}
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
              background: 'transparent', fontSize: '0.75rem', color: 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >{p.length > 30 ? p.slice(0, 30) + '…' : p}</button>
        ))}
      </div>

      <button className="btn-primary" style={{ width: '100%' }} onClick={() => translate()} disabled={isTranslating || !inputText.trim()}>
        {isTranslating ? 'Translating...' : <><Send size={16} /> Translate</>}
      </button>

      {/* Result */}
      {result && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.5, flex: 1 }}>
              {result.translatedText}
            </p>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
              <button onClick={() => speak(result.translatedText, targetLang)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Volume2 size={18} color="var(--accent)" />
              </button>
              <button onClick={() => copy(result.translatedText)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} color="var(--text-secondary)" />}
              </button>
            </div>
          </div>

          {result.phoneticPronunciation && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {result.phoneticPronunciation}
            </p>
          )}

          {result.simpleExplanation && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {result.simpleExplanation}
            </p>
          )}

          {result.keyMedicalTerms?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Key Terms</p>
              {result.keyMedicalTerms.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
                  <span style={{ fontWeight: 500 }}>{t.term}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.translation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
