import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function Recommendations() {
  const { requestId } = useApp();
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) { navigate('/input'); return; }
    api.getRecommendations(requestId)
      .then(d => setRecs(d.recommendations || []))
      .finally(() => setLoading(false));
  }, [requestId]);

  const toggle = async (rec) => {
    setSaving(true);
    try {
      if (rec.added) {
        await api.removeRecommendation(requestId, rec.rec_id);
      } else {
        await api.addRecommendation(requestId, rec.rec_id);
      }
      setRecs(prev => prev.map(r => r.rec_id === rec.rec_id ? { ...r, added: !r.added } : r));
    } finally {
      setSaving(false);
    }
  };

  const addAll = async () => {
    setSaving(true);
    try {
      await api.addAllRecommendations(requestId);
      setRecs(prev => prev.map(r => ({ ...r, added: true })));
    } finally {
      setSaving(false);
    }
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      await api.doneRecommendations(requestId);
      navigate('/cart');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="dot-loader"><span /><span /><span /></div>
    </div>
  );

  const added = recs.filter(r => r.added);
  const addedTotal = added.reduce((s, r) => s + r.price, 0);

  return (
    <div className="page">
      <Navbar step={3} />
      <div className="page-content animate-fade-in" style={{ paddingTop: '1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#8b5cf6" />
            <span style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Recommendations
            </span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.4rem' }}>
            You might also need…
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.875rem' }}>
            Selected based on your cart — from a product relationship graph, not random AI guesses.
          </p>
        </div>

        {recs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
            No recommendations for this list combination.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {recs.map(rec => (
                <RecommendationCard key={rec.rec_id} rec={rec} onToggle={() => toggle(rec)} disabled={saving} />
              ))}
            </div>

            {/* Summary bar */}
            {added.length > 0 && (
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: '0.875rem', padding: '0.875rem 1rem', marginBottom: '1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: 500 }}>
                  {added.length} item{added.length > 1 ? 's' : ''} added
                </span>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>+₹{addedTotal}</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <button
                id="btn-add-all-recs"
                className="btn-secondary"
                onClick={addAll}
                disabled={saving || recs.every(r => r.added)}
                style={{ flex: 1 }}
              >
                Add All
              </button>
              <button
                id="btn-skip-recs"
                className="btn-ghost"
                onClick={handleDone}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <SkipForward size={15} /> Skip
              </button>
            </div>

            <button
              id="btn-recs-continue"
              className="btn-primary"
              onClick={handleDone}
              disabled={saving}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', fontSize: '1rem' }}
            >
              Review Cart <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, onToggle, disabled }) {
  return (
    <div style={{
      background: rec.added ? 'rgba(34,197,94,0.07)' : '#0f172a',
      border: `1px solid ${rec.added ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '1rem', padding: '1rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      transition: 'all 0.25s ease',
    }}>
      {/* Emoji icon by category */}
      <div style={{
        width: 44, height: 44, borderRadius: '0.75rem',
        background: rec.added ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
        flexShrink: 0, transition: 'all 0.25s',
      }}>
        {getCategoryEmoji(rec.related_category || rec.sku)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
          {rec.name}
        </div>
        <div style={{ color: '#475569', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
          Because you added <span style={{ color: '#8b5cf6' }}>{rec.based_on?.replace(/_/g, ' ')}</span>
          {' — '}{rec.reason}
        </div>
        <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>₹{rec.price}</span>
      </div>

      <button
        id={`btn-rec-toggle-${rec.rec_id}`}
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: rec.added ? '#22c55e' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${rec.added ? '#22c55e' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        }}
      >
        {rec.added ? <Minus size={16} color="white" /> : <Plus size={16} color="#64748b" />}
      </button>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = {
    milk: '🥛', biscuits: '🍪', coffee_powder: '☕', tea_powder: '🍵',
    sugar: '🍬', ketchup: '🍅', mayonnaise: '🫙', bread: '🍞',
    butter: '🧈', jam: '🍓', pasta: '🍝', pasta_sauce: '🍅',
    cheese: '🧀', potato: '🥔', tomato: '🍅', onion: '🧅',
    ginger_garlic: '🧄', cooking_oil: '🫙', rice: '🍚', wheat_flour: '🌾',
    lentils: '🫘', salt: '🧂', eggs: '🥚', paneer: '🧀',
    curd: '🥛', chips: '🥔', juice: '🧃', noodles: '🍜',
    ghee: '🧈', honey: '🍯', cereals: '🥣', herbs: '🌿',
    spices: '🌶️',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (category?.includes(key)) return emoji;
  }
  return '🛒';
}
