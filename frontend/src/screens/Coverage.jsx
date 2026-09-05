import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function Coverage() {
  const { requestId, mode } = useApp();
  const navigate = useNavigate();
  const [cart, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    if (!requestId) { navigate('/input'); return; }
    api.getCart(requestId).then(setCartData).finally(() => setLoading(false));
  }, [requestId]);

  const handleSubstitute = async (lineId, chosenSku) => {
    setResolvingId(lineId);
    try {
      await api.resolveUnavailable(requestId, lineId, 'substitute', chosenSku);
      const updated = await api.getCart(requestId);
      setCartData(updated);
    } finally {
      setResolvingId(null);
    }
  };

  const handleRemove = async (lineId) => {
    setResolvingId(lineId);
    try {
      await api.resolveUnavailable(requestId, lineId, 'remove', null);
      const updated = await api.getCart(requestId);
      setCartData(updated);
    } finally {
      setResolvingId(null);
    }
  };

  const handleContinue = () => {
    navigate(mode === 'manual' ? '/manual-picker' : '/recommendations');
  };

  if (loading) return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="dot-loader"><span /><span /><span /></div>
    </div>
  );

  if (!cart) return null;

  const { original_items, unavailable_items, coverage } = cart;
  const allResolved = unavailable_items.every(
    u => u.status === 'substituted' || u.status === 'removed_by_user'
  );

  return (
    <div className="page">
      <Navbar step={2} />
      <div className="page-content animate-fade-in" style={{ paddingTop: '1.5rem' }}>
        {/* Coverage badge */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: coverage.unavailable === 0
              ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${coverage.unavailable === 0 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: '1rem', padding: '1rem 1.25rem',
          }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.25rem' }}>
                {coverage.unavailable === 0 ? '✅ Nothing missed!' : '⚠️ Some items need attention'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {coverage.matched}/{coverage.total_requested} items matched
              </div>
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '2rem',
              color: coverage.unavailable === 0 ? '#4ade80' : '#fbbf24',
            }}>
              {Math.round((coverage.matched / coverage.total_requested) * 100)}%
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#94a3b8', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem' }}>
          Your original request
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {original_items.map(item => (
            <div key={item.line_id} style={{
              background: '#0f172a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.875rem', padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <CheckCircle2 size={18} color="#4ade80" />
              <div style={{ flex: 1 }}>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.matched_name}</span>
                <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: '0.5rem' }}>×{item.matched_qty}</span>
              </div>
              <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>
                ₹{item.line_total}
              </div>
            </div>
          ))}
        </div>

        {/* Unavailable items */}
        {unavailable_items.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#94a3b8', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem' }}>
              Needs your attention
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {unavailable_items.map(item => (
                <UnavailableCard
                  key={item.line_id}
                  item={item}
                  loading={resolvingId === item.line_id}
                  onSubstitute={handleSubstitute}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </>
        )}

        <button
          id="btn-coverage-continue"
          className="btn-primary"
          onClick={handleContinue}
          disabled={!allResolved && unavailable_items.length > 0}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', fontSize: '1rem' }}
        >
          <ShoppingCart size={18} />
          {mode === 'manual' ? 'Pick Brands →' : 'See Recommendations →'}
        </button>

        {!allResolved && unavailable_items.length > 0 && (
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Resolve all unavailable items to continue
          </p>
        )}
      </div>
    </div>
  );
}

function UnavailableCard({ item, loading, onSubstitute, onRemove }) {
  const isResolved = item.status === 'substituted' || item.status === 'removed_by_user';

  return (
    <div style={{
      background: isResolved ? 'rgba(34,197,94,0.05)' : 'rgba(245,158,11,0.06)',
      border: `1px solid ${isResolved ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
      borderRadius: '1rem', padding: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <AlertTriangle size={16} color={isResolved ? '#4ade80' : '#fbbf24'} />
        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{item.requirement}</span>
        <span className={`chip ${isResolved ? 'chip-green' : 'chip-amber'}`}>
          {isResolved ? (item.status === 'removed_by_user' ? 'Removed' : 'Substituted') : item.reason === 'out_of_stock' ? 'Out of stock' : 'Not found'}
        </span>
      </div>

      {!isResolved && (
        <>
          {item.suggestions?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>Choose a substitute:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {item.suggestions.map(s => (
                  <button
                    key={s.sku}
                    onClick={() => onSubstitute(item.line_id, s.sku)}
                    disabled={loading}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.6rem', padding: '0.6rem 0.875rem',
                      color: '#94a3b8', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s', fontSize: '0.875rem',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.color = '#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <span>{s.label || s.name}</span>
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>₹{s.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            className="btn-danger"
            onClick={() => onRemove(item.line_id)}
            disabled={loading}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
          >
            Remove from list
          </button>
        </>
      )}
    </div>
  );
}
