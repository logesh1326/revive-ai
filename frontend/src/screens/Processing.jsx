import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';

const STEPS = [
  { label: 'Understanding your list…', delay: 0 },
  { label: 'Matching products in catalog…', delay: 1800 },
  { label: 'Checking availability…', delay: 3200 },
  { label: 'Building your cart…', delay: 4400 },
];

export default function Processing() {
  const { requestId, setCart } = useApp();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) { navigate('/input'); return; }

    // Advance step labels for visual effect
    STEPS.forEach((s, i) => {
      if (i === 0) return;
      setTimeout(() => setStepIdx(i), s.delay);
    });

    // Do the actual product matching
    const run = async () => {
      try {
        await api.matchProducts(requestId);
        setTimeout(() => navigate('/coverage'), 5000);
      } catch (err) {
        setError(err.message);
      }
    };
    run();
  }, [requestId]);

  return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
        {/* Animated ring */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 2rem' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid rgba(34,197,94,0.15)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#22c55e',
            animation: 'spin-slow 1s linear infinite',
          }} className="animate-spin-slow" />
          <div style={{
            position: 'absolute', inset: '16px', borderRadius: '50%',
            border: '2px solid rgba(6,182,212,0.2)',
            borderBottomColor: '#06b6d4',
            animation: 'spin-slow 1.5s linear infinite reverse',
          }} className="animate-spin-slow" />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            🤖
          </div>
        </div>

        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.75rem' }}>
          AI is working…
        </h2>

        <p style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: 500, marginBottom: '2rem', minHeight: '1.4em', transition: 'all 0.3s' }}>
          {STEPS[stepIdx].label}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i <= stepIdx ? 24 : 8, height: 8,
              borderRadius: 9999,
              background: i <= stepIdx ? '#22c55e' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '0.75rem', padding: '1rem', color: '#fb7185', fontSize: '0.875rem',
          }}>
            {error}
            <button onClick={() => navigate('/input')} className="btn-ghost" style={{ marginTop: '0.75rem', display: 'block', width: '100%' }}>
              Go back
            </button>
          </div>
        )}

        <p style={{ color: '#334155', fontSize: '0.8rem' }}>
          Zero items will be silently dropped
        </p>
      </div>
    </div>
  );
}
