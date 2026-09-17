'use client';

import React, { useState, useRef, useEffect } from 'react';
import { fetchFromAPI } from '@/lib/api';
import { Send, Sparkles } from 'lucide-react';

interface AIChatbotProps {
  onNavigate: (tab: string) => void;
}

export default function AIChatbot({ onNavigate }: AIChatbotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hello! I'm your CareConnect AI. I can help you find hospitals, scan prescriptions, manage reminders, or answer medical questions." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetchFromAPI('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      });

      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.reply }]);
        
        // Simple client-side routing based on AI response keywords
        const replyLower = response.data.reply.toLowerCase();
        if (replyLower.includes('"hospitals" tab') || replyLower.includes('hospitals near')) {
          onNavigate('hospitals');
        } else if (replyLower.includes('"scanner" tab')) {
          onNavigate('scanner');
        } else if (replyLower.includes('"reminders" tab')) {
          onNavigate('reminders');
        } else if (replyLower.includes('translator')) {
          onNavigate('translator');
        }
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect to my brain right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-enter" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '1rem',
      paddingBottom: '80px', // space for bottom nav
      background: 'var(--bg)'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '0.8rem 1rem',
            borderRadius: '16px',
            background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
            color: m.role === 'user' ? '#fff' : 'var(--text)',
            fontSize: '0.95rem',
            borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
            borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
          }}>
            {m.role === 'assistant' && <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', opacity: 0.5 }} />}
            {m.text}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', padding: '0.8rem 1rem', background: 'var(--bg-secondary)', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
            <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>Thinking...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{
        marginTop: '1rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        paddingTop: '0.8rem'
      }}>
        <input 
          className="input-minimal"
          style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
          placeholder="Ask CareConnect..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          className="btn-primary" 
          style={{ width: '44px', height: '44px', padding: 0, flexShrink: 0 }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
