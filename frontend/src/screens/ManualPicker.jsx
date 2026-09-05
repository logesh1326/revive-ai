import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ShoppingCart } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function ManualPicker() {
  const { requestId, parsedItems } = useApp();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) { navigate('/input'); return; }
    api.getCart(requestId).then(setCart).finally(() => setLoading(false));
  }, [requestId]);

  if (loading || !cart) return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="dot-loader"><span /><span /><span /></div>
    </div>
  );

  const allItems = [...cart.original_items, ...cart.unavailable_items];
  const done = currentIdx >= allItems.length;

  const handleNext = () => {
    if (currentIdx < allItems.length - 1) setCurrentIdx(i => i + 1);
    else navigate('/recommendations');
  };

  if (done) {
    navigate('/recommendations');
    return null;
  }

  const item = allItems[currentIdx];
  const alternatives = item.alternatives || [];

  return (
    <div className="page">
      <Navbar step={2} />
      <div className="page-content animate-fade-in" style={{ paddingTop: '1.5rem' }}>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>
            <span>Item {currentIdx + 1} of {allItems.length}</span>
            <span>{Math.round(((currentIdx + 1) / allItems.length) * 100)}% done</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 9999 }}>
            <div className="progress-bar" style={{ width: `${((currentIdx + 1) / allItems.length) * 100}%` }} />
          </div>
        </div>

        {/* Item header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Picking for
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#f1f5f9', margin: 0 }}>
            {item.requirement}
          </h2>
        </div>

        {/* Product options */}
        {item.status === 'matched' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {/* Show top match + alternatives */}
            {[{ sku: item.matched_sku, name: item.matched_name, brand: item.matched_brand, price: item.unit_price }, ...(alternatives.filter(a => a.sku !== item.matched_sku))].map((opt, i) => (
              <button
                key={opt.sku}
                id={`btn-pick-${opt.sku}`}
                style={{
                  background: i === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '1rem', padding: '1rem 1.25rem',
                  cursor: 'pointer', textAlign: 'left', color: 'inherit',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'; }}
                onClick={handleNext}
              >
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{opt.name}</div>
                  <div style={{ color: '#475569', fontSize: '0.8rem' }}>{opt.brand}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>₹{opt.price}</span>
                  {i === 0 && <span className="chip chip-green" style={{ fontSize: '0.7rem' }}>Best match</span>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem', color: '#94a3b8',
          }}>
            ⚠️ This item is unavailable. Please resolve it from the Coverage screen.
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentIdx > 0 && (
            <button className="btn-secondary" onClick={() => setCurrentIdx(i => i - 1)}>← Back</button>
          )}
          <button
            id="btn-manual-next"
            className="btn-primary"
            onClick={handleNext}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {currentIdx < allItems.length - 1 ? <>Next item <ChevronRight size={16} /></> : <>Done — View Cart <ShoppingCart size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
