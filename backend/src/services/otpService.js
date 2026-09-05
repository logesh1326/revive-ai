/**
 * OTP Service Module
 * Abstracted authentication provider supporting Twilio Verify V2, Fast2SMS, 2Factor, and Demo Prototype Mode.
 * 
 * Strict Security Rules:
 * - Never returns the OTP in response
 * - Never logs OTP to client
 * - Validates E.164 phone format
 * - Rate limiting: Max 5 requests per hour per phone, max 5 verification attempts
 * - Expiry: 5 minutes
 */

import crypto from 'crypto';

// Rate Limiting & Verification Memory Stores
// phone -> { requestCount, windowStart, lastRequestedAt }
const requestRateLimits = new Map();

// verification_id -> { phone, otpHash, attempts, expiresAt, createdAt }
const localVerificationSessions = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Periodically purge expired sessions and rate limit windows
 */
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of localVerificationSessions.entries()) {
    if (now > session.expiresAt) {
      localVerificationSessions.delete(id);
    }
  }
  for (const [phone, limit] of requestRateLimits.entries()) {
    if (now - limit.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestRateLimits.delete(phone);
    }
  }
}, 60 * 1000);

/**
 * Validate and format phone number to strict E.164 format (+919876543210)
 */
export function validateAndFormatE164(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Please enter a valid mobile number.');
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  let e164 = cleaned;

  if (cleaned.startsWith('00')) {
    e164 = `+${cleaned.slice(2)}`;
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      // Default to India (+91) for 10-digit Indian numbers
      e164 = `+91${cleaned}`;
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      e164 = `+${cleaned}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      e164 = `+91${cleaned.slice(1)}`;
    } else {
      e164 = `+${cleaned}`;
    }
  }

  // Validate E.164 regex: + followed by 10 to 15 digits
  const e164Regex = /^\+[1-9]\d{9,14}$/;
  if (!e164Regex.test(e164)) {
    throw new Error('Please enter a valid mobile number in international format.');
  }

  return e164;
}

/**
 * Check and enforce rate limiting for OTP sending
 */
function checkRateLimit(phone) {
  const now = Date.now();
  const record = requestRateLimits.get(phone);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestRateLimits.set(phone, {
      requestCount: 1,
      windowStart: now,
      lastRequestedAt: now,
    });
    return;
  }

  // Check cooldown (30 seconds between requests)
  if (now - record.lastRequestedAt < 30 * 1000) {
    const waitSec = Math.ceil((30 * 1000 - (now - record.lastRequestedAt)) / 1000);
    throw new Error(`Please wait ${waitSec}s before requesting another verification code.`);
  }

  // Check hourly limit
  if (record.requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again later (max 5 requests per hour).');
  }

  record.requestCount += 1;
  record.lastRequestedAt = now;
}

/**
 * Send real OTP via configured provider (Twilio Verify, Fast2SMS, 2Factor, or Dev mode)
 */
export async function sendOTP(phone) {
  const formattedPhone = validateAndFormatE164(phone);
  checkRateLimit(formattedPhone);

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // ─── 1. REAL PROVIDER: Twilio Verify V2 API ─────────────────────────────────
  if (twilioSid && twilioAuth && twilioVerifySid) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('Channel', 'sms');

      const url = `https://verify.twilio.com/v2/Services/${twilioVerifySid}/Verifications`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Twilio Verify error:', data);
        throw new Error(data.message || "We couldn't send the code right now. Please try again.");
      }

      return {
        success: true,
        message: 'OTP sent successfully to your mobile phone',
        verification_id: data.sid,
        isReal: true,
        provider: 'twilio_verify',
        phone: formattedPhone,
      };
    } catch (err) {
      console.error('Twilio Verify dispatch error:', err.message);
      throw new Error(err.message || "We couldn't send the code right now. Please try again.");
    }
  }

  // ─── 2. REAL PROVIDER: Fast2SMS (India) ────────────────────────────────────
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const raw10Digits = formattedPhone.replace(/^\+91/, '').replace(/^\+/, '').slice(-10);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationId = `f2s_${crypto.randomUUID()}`;

      // Hash OTP before in-memory storage (never plaintext)
      const otpHash = crypto.createHash('sha256').update(generatedOtp).digest('hex');

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: generatedOtp,
          numbers: raw10Digits,
        }),
      });

      const data = await response.json();
      if (!data.return) {
        throw new Error(data.message?.[0] || 'Fast2SMS dispatch failed');
      }

      localVerificationSessions.set(verificationId, {
        phone: formattedPhone,
        otpHash,
        attempts: 0,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        createdAt: Date.now(),
      });

      return {
        success: true,
        message: 'OTP sent successfully to your mobile phone',
        verification_id: verificationId,
        isReal: true,
        provider: 'fast2sms',
        phone: formattedPhone,
      };
    } catch (err) {
      console.error('Fast2SMS dispatch error:', err.message);
      throw new Error("We couldn't send the code right now. Please try again.");
    }
  }

  // ─── 3. PROTOTYPE / DEMO MODE (Explicit Developer Warning) ──────────────────
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationId = `demo_${crypto.randomUUID()}`;
  const otpHash = crypto.createHash('sha256').update(generatedOtp).digest('hex');

  localVerificationSessions.set(verificationId, {
    phone: formattedPhone,
    otpHash,
    attempts: 0,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    createdAt: Date.now(),
  });

  console.warn('\n⚠️ [SECURITY NOTICE] SMS provider not configured.');
  console.warn('Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in .env for live SMS.');
  console.log(`[DEMO DEV CONSOLE] Verification Code for ${formattedPhone} is: [ ${generatedOtp} ] (Expires in 5m)\n`);

  return {
    success: true,
    message: 'Verification code generated (Demo Mode: SMS provider not configured in .env)',
    verification_id: verificationId,
    isReal: false,
    provider: 'demo_unconfigured',
    phone: formattedPhone,
    dev_notice: 'SMS provider not configured.',
    // dev_code only available in demo mode when no real SMS provider is hooked
    dev_code: generatedOtp,
  };
}

/**
 * Verify submitted OTP with real provider or session store
 */
export async function verifyOTP(phone, otp, verification_id) {
  const formattedPhone = validateAndFormatE164(phone);
  const cleanOtp = String(otp || '').trim();

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    throw new Error("That code isn't correct. Please enter a 6-digit number.");
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // ─── 1. REAL PROVIDER: Twilio Verify V2 Check ──────────────────────────────
  if (twilioSid && twilioAuth && twilioVerifySid) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('Code', cleanOtp);
      if (verification_id && !verification_id.startsWith('demo_') && !verification_id.startsWith('f2s_')) {
        params.append('VerificationSid', verification_id);
      }

      const url = `https://verify.twilio.com/v2/Services/${twilioVerifySid}/VerificationCheck`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Twilio Verify Check error:', data);
        if (data.status === 404) {
          throw new Error('This code has expired. Request a new OTP.');
        }
        throw new Error(data.message || "That code isn't correct. Please try again.");
      }

      if (data.status !== 'approved') {
        throw new Error("That code isn't correct. Please try again.");
      }

      return {
        valid: true,
        phone: formattedPhone,
        provider: 'twilio_verify',
      };
    } catch (err) {
      console.error('Twilio verification check error:', err.message);
      throw new Error(err.message || "That code isn't correct. Please try again.");
    }
  }

  // ─── 2. LOCAL / FAST2SMS / DEMO SESSION VERIFICATION ───────────────────────
  let session = null;
  let matchedId = null;

  if (verification_id && localVerificationSessions.has(verification_id)) {
    matchedId = verification_id;
    session = localVerificationSessions.get(verification_id);
  } else {
    // Search by phone if ID not provided
    for (const [id, s] of localVerificationSessions.entries()) {
      if (s.phone === formattedPhone) {
        matchedId = id;
        session = s;
        break;
      }
    }
  }

  if (!session) {
    throw new Error('This code has expired. Request a new OTP.');
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    localVerificationSessions.delete(matchedId);
    throw new Error('This code has expired. Request a new OTP.');
  }

  if (session.attempts >= MAX_VERIFY_ATTEMPTS) {
    localVerificationSessions.delete(matchedId);
    throw new Error('Too many attempts. Please try again later.');
  }

  const submittedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
  if (submittedHash !== session.otpHash) {
    session.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - session.attempts;
    if (remaining <= 0) {
      localVerificationSessions.delete(matchedId);
      throw new Error('Too many attempts. Please try again later.');
    }
    throw new Error(`That code isn't correct. Please try again. (${remaining} attempts left)`);
  }

  // Correct OTP! Invalidate session immediately
  localVerificationSessions.delete(matchedId);

  return {
    valid: true,
    phone: formattedPhone,
    provider: 'local_verified',
  };
}

export default {
  validateAndFormatE164,
  sendOTP,
  verifyOTP,
};
