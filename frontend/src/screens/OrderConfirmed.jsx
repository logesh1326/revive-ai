import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, BarChart3, RotateCcw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';

export default function OrderConfirmed() {
  const { requestId, order, setOrder, reset } = useApp();
  const navigate = useNavigate();
  const [localOrder, setLocalOrder] = useState(order);

  useEffect(() => {
    if (!localOrder && requestId) {
      api.getOrder(requestId).then(setLocalOrder).catch(() => {});
    }
  }, []);

  if (!localOrder) return (
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ color: '#64748b' }}>
        <p>Order details not found.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Start Over</button>
      </div>
    </div>
  );

  const allItems = localOrder.items || [];
  const originalItems = allItems.filter(i => i.source === 'original_list');
  const recItems = allItems.filter(i => i.source === 'recommendation');

  return (
    <div className="page" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a12 100%)' }}>
      {/* Confetti ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <div className="page-content animate-slide-up" style={{ position: 'relative', zIndex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>

        {/* Success icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(34,197,94,0.4)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            <CheckCircle2 size={40} color="white" />
          </div>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
            fontSize: '2rem', color: '#f1f5f9', margin: '0 0 0.5rem',
          }}>
            Order Confirmed! 🎉
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>Your groceries are on their way</p>
        </div>

        {/* Order card */}
        <div style={{
          background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Order ID</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{localOrder.order_id}</div>
            </div>
            <span className="chip chip-green">✓ Paid</span>
          </div>

          <div className="divider" />

          {/* Delivery slot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.875rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.6rem',
              background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Truck size={18} color="#06b6d4" />
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Delivery slot</div>
              <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{localOrder.delivery_slot}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
              Items ({allItems.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {allItems.slice(0, 8).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{item.matched_name || item.name}</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>₹{item.line_total || item.unit_price}</span>
                </div>
              ))}
              {allItems.length > 8 && (
                <div style={{ color: '#475569', fontSize: '0.8rem' }}>+ {allItems.length - 8} more items</div>
              )}
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Total paid</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#4ade80' }}>
              ₹{localOrder.total}
            </span>
          </div>
        </div>

        {/* Stats card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '2rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center',
        }}>
          {[
            { label: 'Original items', value: originalItems.length, color: '#4ade80' },
            { label: 'AI additions', value: recItems.length, color: '#a78bfa' },
            { label: 'Total items', value: allItems.length, color: '#60a5fa' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.6rem', color, marginBottom: '0.2rem' }}>{value}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            id="btn-view-dashboard"
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <BarChart3 size={16} /> Analytics
          </button>
          <button
            id="btn-new-order"
            className="btn-primary"
            onClick={() => { reset(); navigate('/'); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <RotateCcw size={16} /> New Order
          </button>
        </div>
      </div>
    </div>
  );
}
