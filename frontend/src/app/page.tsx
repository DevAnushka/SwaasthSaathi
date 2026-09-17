'use client';

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HospitalFinder from '@/components/HospitalFinder';
import PrescriptionScanner from '@/components/PrescriptionScanner';
import MedicineReminder, { MedicineReminderItem } from '@/components/MedicineReminder';
import MedicalTranslator from '@/components/MedicalTranslator';
import AIChatbot from '@/components/AIChatbot';
import { Phone } from 'lucide-react';

const INITIAL_REMINDERS: MedicineReminderItem[] = [
  {
    id: 'rem-1', name: 'Augmentin', dosage: '625 mg', form: 'tablet',
    timeSlot: 'morning', scheduledTime: '08:00 AM', mealRelation: 'After Food',
    isTakenToday: false, takenAt: null, streakDays: 4,
    instructions: 'Complete the antibiotic course', createdAt: new Date().toISOString()
  },
  {
    id: 'rem-2', name: 'Pan-D', dosage: '40 mg', form: 'capsule',
    timeSlot: 'morning', scheduledTime: '07:30 AM', mealRelation: 'Before Food',
    isTakenToday: false, takenAt: null, streakDays: 6,
    instructions: 'Take 30 mins before breakfast', createdAt: new Date().toISOString()
  },
  {
    id: 'rem-3', name: 'Dolo 650', dosage: '650 mg', form: 'tablet',
    timeSlot: 'afternoon', scheduledTime: '01:00 PM', mealRelation: 'After Food',
    isTakenToday: false, takenAt: null, streakDays: 2,
    instructions: 'Take only if fever persists', createdAt: new Date().toISOString()
  },
  {
    id: 'rem-4', name: 'Montair-LC', dosage: '10mg', form: 'tablet',
    timeSlot: 'night', scheduledTime: '10:00 PM', mealRelation: 'After Food',
    isTakenToday: false, takenAt: null, streakDays: 5,
    instructions: 'Take at bedtime', createdAt: new Date().toISOString()
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'scanner' | 'reminders' | 'translator' | 'chat'>('hospitals');
  const [reminders, setReminders] = useState<MedicineReminderItem[]>(INITIAL_REMINDERS);

  // Persist reminders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careconnect_reminders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setReminders(parsed);
        } catch (e) { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careconnect_reminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  const handleSyncMedications = (meds: any[]) => {
    const timeMap: Record<string, string> = {
      morning: '08:00 AM', afternoon: '01:00 PM', evening: '06:00 PM', night: '10:00 PM'
    };
    const newItems: MedicineReminderItem[] = meds.map((med, i) => ({
      id: `extracted-${Date.now()}-${i}`,
      name: med.name,
      dosage: med.dosage,
      form: med.form || 'tablet',
      timeSlot: med.timeSlot || 'morning',
      scheduledTime: timeMap[med.timeSlot || 'morning'],
      mealRelation: med.mealRelation || 'After Food',
      isTakenToday: false,
      takenAt: null,
      streakDays: 0,
      instructions: med.instructions || '',
      createdAt: new Date().toISOString()
    }));
    setReminders(prev => [...newItems, ...prev]);
  };

  const pendingCount = reminders.filter(r => !r.isTakenToday).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Minimal top header */}
      <header style={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          CareConnect
        </span>
        <a
          href="tel:102"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--error)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none'
          }}
        >
          <Phone size={16} />
        </a>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '0 1rem', paddingBottom: '80px', overflowY: 'auto' }}>
        {activeTab === 'hospitals' && <HospitalFinder />}
        {activeTab === 'scanner' && (
          <PrescriptionScanner
            onSyncMedications={handleSyncMedications}
            onNavigateToReminders={() => setActiveTab('reminders')}
          />
        )}
        {activeTab === 'reminders' && <MedicineReminder reminders={reminders} setReminders={setReminders} />}
        {activeTab === 'translator' && <MedicalTranslator />}
        {activeTab === 'chat' && <AIChatbot onNavigate={(tab: string) => setActiveTab(tab as any)} />}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} pendingRemindersCount={pendingCount} />
    </div>
  );
}
