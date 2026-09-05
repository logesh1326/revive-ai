import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowRight, Sparkles, ChevronLeft, Lightbulb } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

const DEMO_LISTS = [
  '2 litres milk, 1kg sugar, coffee powder 500g, biscuits, french fries, onion 1kg, tomato 1kg',
  'bread, butter, eggs dozen, orange juice 1L, cornflakes 500g',
  'basmati rice 2kg, toor dal 1kg, onion 2kg, tomato 1kg, ginger, garlic, sunflower oil 1L',
];

export default function ListInput() {
  const { mode, setRequestId, setParsedItems } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input not supported in this browser.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setText(prev => prev + (prev ? ', ' : '') + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { request_id, items } = await api.parseList(text.trim());
      setRequestId(request_id);
      setParsedItems(items);
      navigate('/processing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar step={1} />
      <div className="page-content animate-fade-in" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className={`chip ${mode === 'auto' ? 'chip-green' : 'chip-purple'}`}>
              {mode === 'auto' ? '⚡ Auto Mode' : '✋ Manual Mode'}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f1f5f9' }}>
            What do you need?
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Type or speak your shopping list in any language. Be as natural as you like.
          </p>
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <textarea
            id="shopping-list-input"
            className="input-field"
            rows={7}
            placeholder={"e.g. 2 litres milk, 1kg sugar, coffee powder 500g, biscuits\n\nHindi/Tamil mix is fine too!"}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ paddingBottom: '3rem' }}
          />
          {/* Voice button inside textarea */}
          <button
            id="btn-voice-input"
            onClick={listening ? stopVoice : startVoice}
            style={{
              position: 'absolute', bottom: '0.75rem', right: '0.75rem',
              background: listening ? 'rgba(244,63,94,0.15)' : 'rgba(34,197,94,0.12)',
              border: `1px solid ${listening ? 'rgba(244,63,94,0.3)' : 'rgba(34,197,94,0.25)'}`,
              borderRadius: '0.5rem', padding: '0.4rem 0.75rem',
              color: listening ? '#f43f5e' : '#4ade80',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {listening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem',
            color: '#fb7185', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          id="btn-analyse-list"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', padding: '1rem' }}
        >
          {loading ? (
            <><div className="dot-loader"><span/><span/><span/></div> Analysing…</>
          ) : (
            <><Sparkles size={18} /> Analyse My List <ArrowRight size={18} /></>
          )}
        </button>

        {/* Demo suggestions */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#475569', fontSize: '0.8rem' }}>
            <Lightbulb size={13} /> Try a demo list
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_LISTS.map((demo, i) => (
              <button
                key={i}
                id={`btn-demo-list-${i + 1}`}
                onClick={() => setText(demo)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.75rem', padding: '0.6rem 1rem',
                  color: '#64748b', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.82rem', transition: 'all 0.2s', lineHeight: 1.4,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#64748b'; }}
              >
                {demo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
