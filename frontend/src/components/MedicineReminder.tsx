'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, BellRing } from 'lucide-react';
import { playChimeSound, requestNotificationPermission, sendBrowserNotification } from '@/lib/notifications';

export interface MedicineReminderItem {
  id: string;
  name: string;
  dosage: string;
  form: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduledTime: string;
  mealRelation: string;
  isTakenToday: boolean;
  takenAt?: string | null;
  streakDays: number;
  instructions?: string;
  createdAt: string;
}

interface MedicineReminderProps {
  reminders: MedicineReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<MedicineReminderItem[]>>;
}

const TIME_SLOTS = [
  { id: 'all', label: 'All' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' }
];

export default function MedicineReminder({ reminders, setReminders }: MedicineReminderProps) {
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newSlot, setNewSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [newMeal, setNewMeal] = useState('After Food');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const filtered = selectedSlot === 'all' ? reminders : reminders.filter(r => r.timeSlot === selectedSlot);
  const taken = reminders.filter(r => r.isTakenToday).length;
  const total = reminders.length;

  const toggleTaken = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const nowTaken = !r.isTakenToday;
      if (nowTaken) {
        playChimeSound('success');
        sendBrowserNotification('Medicine Taken ✓', `${r.name} marked as taken`);
      }
      return {
        ...r,
        isTakenToday: nowTaken,
        takenAt: nowTaken ? new Date().toISOString() : null,
        streakDays: nowTaken ? r.streakDays + 1 : Math.max(0, r.streakDays - 1)
      };
    }));
  };

  const addReminder = () => {
    if (!newName.trim()) return;
    const timeMap: Record<string, string> = { morning: '08:00 AM', afternoon: '01:00 PM', evening: '06:00 PM', night: '10:00 PM' };
    const newItem: MedicineReminderItem = {
      id: `rem-${Date.now()}`,
      name: newName,
      dosage: newDosage || '—',
      form: 'tablet',
      timeSlot: newSlot,
      scheduledTime: timeMap[newSlot],
      mealRelation: newMeal,
      isTakenToday: false,
      takenAt: null,
      streakDays: 0,
      instructions: '',
      createdAt: new Date().toISOString()
    };
    setReminders(prev => [newItem, ...prev]);
    setNewName('');
    setNewDosage('');
    setShowAdd(false);
    playChimeSound('reminder');
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reminders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {taken}/{total} taken today
          </p>
        </div>
        <button className="btn-primary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: total > 0 ? `${(taken / total) * 100}%` : '0%',
          background: 'var(--success)',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input className="input-minimal" placeholder="Medicine name" value={newName} onChange={e => setNewName(e.target.value)} />
          <input className="input-minimal" placeholder="Dosage (e.g. 500mg)" value={newDosage} onChange={e => setNewDosage(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['morning', 'afternoon', 'evening', 'night'] as const).map(s => (
              <button
                key={s}
                onClick={() => setNewSlot(s)}
                style={{
                  flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 500,
                  border: newSlot === s ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: newSlot === s ? 'var(--accent)' : 'transparent',
                  color: newSlot === s ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', textTransform: 'capitalize'
                }}
              >{s}</button>
            ))}
          </div>
          <select
            className="input-minimal"
            value={newMeal}
            onChange={e => setNewMeal(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option>After Food</option>
            <option>Before Food</option>
            <option>With Food</option>
            <option>Anytime</option>
          </select>
          <button className="btn-primary" style={{ width: '100%' }} onClick={addReminder}>Add Reminder</button>
        </div>
      )}

      {/* Time slot filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {TIME_SLOTS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSlot(s.id)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 500,
              border: selectedSlot === s.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: selectedSlot === s.id ? 'var(--accent)' : 'transparent',
              color: selectedSlot === s.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >{s.label}</button>
        ))}
      </div>

      {/* Reminder list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => toggleTaken(r.id)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: r.isTakenToday ? 'var(--success)' : 'var(--bg-secondary)',
                color: r.isTakenToday ? '#fff' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'var(--transition)'
              }}
            >
              <Check size={16} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: r.isTakenToday ? 'line-through' : 'none', opacity: r.isTakenToday ? 0.5 : 1 }}>
                {r.name}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {r.dosage} · {r.scheduledTime} · {r.mealRelation}
              </p>
            </div>
            <button
              onClick={() => deleteReminder(r.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            <BellRing size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>No reminders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
