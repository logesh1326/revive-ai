import { useNavigate } from 'react-router-dom';
import { Zap, Hand, ShoppingCart, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function ModeSelect() {
  const { setMode } = useApp();
  const navigate = useNavigate();

  const choose = (m) => {
    setMode(m);
    navigate('/input');
  };

  return (
    <div className="page" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a12 50%, #0a0f1e 100%)' }}>
      {/* Ambient background orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '25%', width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div className="page-content animate-fade-in" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.8rem', color: '#4ade80', fontWeight: 600,
          }}>
            <Sparkles size={12} />
            Powered by Gemini AI
          </div>

          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🛒</div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800, margin: '0 0 1rem',
            lineHeight: 1.1,
          }}>
            <span className="gradient-text">AI Smart</span>{' '}
            <span style={{ color: '#f1f5f9' }}>Grocery</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
            Give the list. AI does the shopping.
          </p>
        </div>

        {/* Mode cards */}
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
          {/* Auto Mode */}
          <button
            id="btn-auto-mode"
            onClick={() => choose('auto')}
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(6,182,212,0.05) 100%)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '1.25rem', padding: '1.75rem',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s ease',
              color: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(34,197,94,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Zap size={22} color="white" fill="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>Auto Mode</span>
                  <span className="chip chip-green">Recommended</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Paste your full list. AI understands it, matches every item, suggests complementary products, and builds your cart — all automatically.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {['100% coverage guarantee', 'Smart recommendations', 'One-tap checkout'].map(f => (
                    <span key={f} style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✓</span> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* Manual Mode */}
          <button
            id="btn-manual-mode"
            onClick={() => choose('manual')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem', padding: '1.75rem',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s ease',
              color: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(139,92,246,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Hand size={22} color="white" />
              </div>
              <div>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>Manual Mode</span>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  AI parses your list, then you hand-pick each brand and variant. Full control with AI assistance at every step.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: <Shield size={14} />, label: 'Gated payments' },
            { icon: <BarChart3 size={14} />, label: 'Explainable AI' },
            { icon: <ShoppingCart size={14} />, label: 'Zero silent drops' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
