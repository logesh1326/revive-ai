import { useNavigate } from 'react-router-dom';
import { BarChart3, ShoppingCart, TrendingUp, Users, Zap, Star, ArrowLeft } from 'lucide-react';

const CUSTOMER_STATS = {
  original_requested: 7,
  matched: 7,
  missing: 0,
  ai_recommendations: 3,
  total_purchased: 10,
  cart_value: 1248,
};

const MERCHANT_STATS = {
  orders_processed: 250,
  ai_assisted: 184,
  completion_rate: 98.4,
  recommendation_acceptance: 32,
  avg_cart_value: 1240,
  ai_assisted_avg: 1430,
  payment_success: 94,
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ background: '#0a0f1e' }}>
      <div className="page-content-wide animate-fade-in" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

        {/* Back */}
        <button
          id="btn-dashboard-back"
          className="btn-ghost"
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', padding: '0.5rem 0' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={20} color="white" />
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f1f5f9', margin: 0 }}>
              AI Commerce Analytics
            </h1>
          </div>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.875rem' }}>
            Demo data — illustrative of what a production deployment would show.
          </p>
          <span className="chip chip-amber" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>📊 Seed Data</span>
        </div>

        {/* Customer section */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle icon={<ShoppingCart size={15} />} label="My Shopping" color="#4ade80" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Items requested', value: CUSTOMER_STATS.original_requested, color: '#60a5fa', suffix: '' },
              { label: 'Matched', value: CUSTOMER_STATS.matched, color: '#4ade80', suffix: '' },
              { label: 'Missing', value: CUSTOMER_STATS.missing, color: '#4ade80', suffix: '' },
              { label: 'AI additions', value: CUSTOMER_STATS.ai_recommendations, color: '#a78bfa', suffix: '' },
              { label: 'Total items', value: CUSTOMER_STATS.total_purchased, color: '#f1f5f9', suffix: '' },
              { label: 'Cart value', value: CUSTOMER_STATS.cart_value, color: '#fbbf24', prefix: '₹' },
            ].map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* Merchant section */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle icon={<TrendingUp size={15} />} label="Merchant Analytics" color="#a78bfa" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Orders processed', value: MERCHANT_STATS.orders_processed, color: '#60a5fa' },
              { label: 'AI-assisted', value: MERCHANT_STATS.ai_assisted, color: '#4ade80' },
              { label: 'List completion', value: MERCHANT_STATS.completion_rate, color: '#4ade80', suffix: '%' },
              { label: 'Rec acceptance', value: MERCHANT_STATS.recommendation_acceptance, color: '#a78bfa', suffix: '%' },
              { label: 'Avg cart value', value: MERCHANT_STATS.avg_cart_value, color: '#fbbf24', prefix: '₹' },
              { label: 'AI-assisted avg', value: MERCHANT_STATS.ai_assisted_avg, color: '#fbbf24', prefix: '₹' },
              { label: 'Payment success', value: MERCHANT_STATS.payment_success, color: '#4ade80', suffix: '%' },
            ].map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* USP callout */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(139,92,246,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem', padding: '1.5rem',
        }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '1rem' }}>
            Three defensible claims
          </div>
          {[
            { icon: '✅', title: '100% list coverage guarantee', desc: 'Every input item is matched, substituted with approval, or explicitly flagged — never silently dropped.' },
            { icon: '🧠', title: 'Deterministic recommendations', desc: 'Suggestions come from a product relationship graph, not random LLM hallucination. Explainable and repeatable.' },
            { icon: '🔒', title: 'Gated commerce', desc: 'AI assembles the cart autonomously, but payment only moves after explicit itemized human approval.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{title}</div>
                <div style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, color, prefix = '', suffix = '' }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '1rem', padding: '1.1rem 1rem', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.6rem', color, marginBottom: '0.3rem' }}>
        {prefix}{value}{suffix}
      </div>
      <div style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
