'use client';

import React, { useState, useRef } from 'react';
import { fetchFromAPI } from '@/lib/api';
import { ScanLine, Upload, Camera, ChevronDown, ChevronUp } from 'lucide-react';

interface ExtractedMedication {
  id: string;
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  timing: string;
  mealRelation: string;
  durationDays: number;
  instructions: string;
  timeSlot: string;
}

interface PrescriptionResult {
  doctorName?: string;
  patientName?: string;
  diagnosis?: string;
  medications: ExtractedMedication[];
  precautions: string[];
  warnings: string[];
  summary: string;
}

interface PrescriptionScannerProps {
  onSyncMedications: (meds: ExtractedMedication[]) => void;
  onNavigateToReminders: () => void;
}

export default function PrescriptionScanner({ onSyncMedications, onNavigateToReminders }: PrescriptionScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      runScan(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runScan = async (base64: string, mime: string) => {
    setIsScanning(true);
    setResult(null);
    setSynced(false);
    try {
      const res = await fetchFromAPI('/scan-prescription', {
        method: 'POST',
        body: JSON.stringify({ imageBase64: base64, mimeType: mime })
      });
      if (res.success) setResult(res.data);
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDemo = async () => {
    setIsScanning(true);
    setResult(null);
    setSynced(false);
    setPreview(null);
    try {
      const res = await fetchFromAPI('/scan-prescription', {
        method: 'POST',
        body: JSON.stringify({ useDemo: true })
      });
      if (res.success) setResult(res.data);
    } catch (err) {
      console.error('Demo failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSync = () => {
    if (!result) return;
    onSyncMedications(result.medications);
    setSynced(true);
    setTimeout(() => onNavigateToReminders(), 600);
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Scan Prescription</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Upload a photo and AI will extract your medications
        </p>
      </div>

      {/* Upload zone */}
      {!result && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
              background: preview ? `url(${preview}) center/cover no-repeat` : 'var(--bg-secondary)',
              minHeight: preview ? '200px' : 'auto',
              position: 'relative'
            }}
          >
            {!preview && (
              <>
                <Camera size={32} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Tap to upload a prescription photo
                </p>
              </>
            )}
            {isScanning && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.85)', borderRadius: 'var(--radius-lg)'
              }}>
                <ScanLine size={24} style={{ color: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ marginLeft: '8px', color: 'var(--accent)', fontWeight: 500 }}>Analyzing...</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />

          <button className="btn-secondary" onClick={handleDemo} disabled={isScanning} style={{ width: '100%' }}>
            <ScanLine size={16} /> Try Demo Prescription
          </button>
        </>
      )}

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {result.diagnosis && (
            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Diagnosis</p>
              <p style={{ fontWeight: 600, marginTop: '2px' }}>{result.diagnosis}</p>
            </div>
          )}

          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {result.medications.length} Medications Found
          </p>

          {result.medications.map((med) => {
            const isExp = expandedMed === med.id;
            return (
              <div key={med.id} className="card" onClick={() => setExpandedMed(isExp ? null : med.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{med.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{med.dosage} · {med.frequency}</p>
                  </div>
                  {isExp ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
                {isExp && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p>Form: {med.form} · Timing: {med.timing}</p>
                    <p>Meal: {med.mealRelation} · Duration: {med.durationDays} days</p>
                    {med.instructions && <p>{med.instructions}</p>}
                  </div>
                )}
              </div>
            );
          })}

          {result.precautions.length > 0 && (
            <div className="card">
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Precautions</p>
              {result.precautions.map((p, i) => (
                <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '2px' }}>• {p}</p>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSync} disabled={synced}>
              {synced ? '✓ Synced' : 'Add to Reminders'}
            </button>
            <button className="btn-secondary" onClick={() => { setResult(null); setPreview(null); }}>
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
