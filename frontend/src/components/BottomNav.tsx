'use client';

import React from 'react';
import { 
  MapPin, 
  ScanLine, 
  BellRing, 
  Languages,
  MessageSquare
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'hospitals' | 'scanner' | 'reminders' | 'translator' | 'chat';
  setActiveTab: (tab: 'hospitals' | 'scanner' | 'reminders' | 'translator' | 'chat') => void;
  pendingRemindersCount: number;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  pendingRemindersCount
}: BottomNavProps) {
  
  const navItems = [
    { id: 'hospitals', icon: MapPin, label: 'Hospitals' },
    { id: 'scanner', icon: ScanLine, label: 'Scan' },
    { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
    { id: 'reminders', icon: BellRing, label: 'Reminders', badge: pendingRemindersCount },
    { id: 'translator', icon: Languages, label: 'Translate' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '65px'
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              border: 'none',
              background: 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              width: '60px',
              height: '100%',
              transition: 'color 0.2s ease'
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
            
            {item.badge ? (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'var(--error)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
