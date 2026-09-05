import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import parseListRouter from './routes/parseList.js';
import matchProductsRouter from './routes/matchProducts.js';
import recommendationsRouter from './routes/recommendations.js';
import cartRouter from './routes/cart.js';
import paymentRouter from './routes/payment.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import addressesRouter from './routes/addresses.js';
import aiRouter from './routes/ai.js';
import { initDatabase } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Database (PostgreSQL / Memory fallback)
initDatabase();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '25mb' })); // Support image uploads
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const isTwilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID);
  const smsProvider = isTwilioConfigured 
    ? 'twilio_verify' 
    : (process.env.FAST2SMS_API_KEY ? 'fast2sms' : 'demo_unconfigured');

  res.json({
    status: 'ok',
    sms_provider: smsProvider,
    real_sms_active: smsProvider !== 'demo_unconfigured',
    database_configured: !!process.env.DATABASE_URL,
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    gemini_configured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ─── Authentication, User & AI Agent Routes ────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter); // backward compatibility
app.use('/api/profile', profileRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/ai', aiRouter);

// ─── Core E-Commerce API Routes ───────────────────────────────────────────────
app.use('/api/v1/parse-list', parseListRouter);
app.use('/api/v1/match-products', matchProductsRouter);
app.use('/api/v1/recommendations', recommendationsRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/orders', ordersRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  const isTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_VERIFY_SERVICE_SID);
  const smsStatus = isTwilio 
    ? '📱 Twilio Verify V2 (REAL MODE)' 
    : (process.env.FAST2SMS_API_KEY ? '📱 Fast2SMS (REAL MODE)' : '⚠️  Demo Mode (SMS provider not configured)');

  console.log(`\n🛒  AI Grocery Agent Backend running on http://localhost:${PORT}`);
  console.log(`   SMS Auth:   ${smsStatus}`);
  console.log(`   Gemini LLM: ${process.env.GEMINI_API_KEY ? '✅ configured' : '⚠️  not configured'}`);
  console.log(`   Razorpay:   ${process.env.RAZORPAY_KEY_ID ? '✅ configured' : '⚠️  not configured'}\n`);
});

export default app;
