'use client';

import React, { useState, useEffect } from 'react';
import { Hospital, SPECIALIZATIONS_LIST, filterHospitals } from '@/lib/hospitalData';
import { MapPin, Phone, Search, ChevronDown, ChevronUp, Navigation, Clock } from 'lucide-react';

export default function HospitalFinder() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState('Detecting...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setLocationStatus('Located');
          updateList(coords.lat, coords.lng, selectedSpec, searchQuery);
        },
        () => {
          const fallback = { lat: 28.5672, lng: 77.2100 };
          setUserLocation(fallback);
          setLocationStatus('Default');
          updateList(fallback.lat, fallback.lng, selectedSpec, searchQuery);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const updateList = (lat?: number, lng?: number, spec?: string, query?: string) => {
    const result = filterHospitals(
      lat ?? userLocation?.lat,
      lng ?? userLocation?.lng,
      spec ?? selectedSpec,
      50,
      query ?? searchQuery
    );
    setHospitals(result);
  };

  const handleSpecChange = (spec: string) => {
    setSelectedSpec(spec);
    updateList(userLocation?.lat, userLocation?.lng, spec, searchQuery);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    updateList(userLocation?.lat, userLocation?.lng, selectedSpec, q);
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Hospitals</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {hospitals.length} nearby · {locationStatus}
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          className="input-minimal"
          placeholder="Search hospitals, specializations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SPECIALIZATIONS_LIST.map((spec) => (
          <button
            key={spec}
            onClick={() => handleSpecChange(spec)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: selectedSpec === spec ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: selectedSpec === spec ? 'var(--accent)' : 'transparent',
              color: selectedSpec === spec ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
              flexShrink: 0
            }}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Hospital list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hospitals.map((h) => {
          const isExpanded = expandedId === h.id;
          return (
            <div
              key={h.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={() => setExpandedId(isExpanded ? null : h.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{h.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {h.specializations.slice(0, 3).join(' · ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                    {h.distanceKm ?? '—'} km
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <MapPin size={14} /> {h.address}, {h.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Clock size={14} /> {h.open24_7 ? 'Open 24/7' : 'Check timings'} · ICU: {h.icuBedsAvailable} beds
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Phone size={14} /> {h.phone}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <a
                      href={`tel:${h.emergencyPhone}`}
                      className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={14} /> Call
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={14} /> Directions
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {hospitals.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            No hospitals found. Try a different filter.
          </p>
        )}
      </div>
    </div>
  );
}
