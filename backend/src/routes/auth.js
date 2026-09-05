import express from 'express';
import jwt from 'jsonwebtoken';
import { sendOTP, verifyOTP, validateAndFormatE164 } from '../services/otpService.js';
import { findUserByPhone, createUser, findUserById } from '../db/index.js';

const router = express.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'revive_ai_super_secret_jwt_key_2026';

/**
 * Helper to generate JWT session token
 */
export function generateSessionToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Authentication Middleware for protected routes
 */
export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.revive_session;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        error: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        authenticated: false,
        error: 'User not found or session invalid.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      authenticated: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }
}

/**
 * POST /api/auth/send-otp
 * Validates phone number and sends real OTP via configured provider
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid mobile number.',
      });
    }

    let formattedPhone;
    try {
      formattedPhone = validateAndFormatE164(phone);
    } catch (valErr) {
      return res.status(400).json({
        success: false,
        error: valErr.message,
      });
    }

    const result = await sendOTP(formattedPhone);

    return res.json({
      success: true,
      message: result.message || 'OTP sent successfully',
      verification_id: result.verification_id,
      phone: formattedPhone,
      isReal: result.isReal,
      provider: result.provider,
      dev_notice: result.dev_notice,
      dev_code: result.dev_code, // available only in demo prototype mode
    });
  } catch (err) {
    console.error('Error in send-otp:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || "We couldn't send the code right now. Please try again.",
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verifies OTP with provider, creates/finds user in DB, and issues session
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, verification_id } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and 6-digit OTP are required.',
      });
    }

    let formattedPhone;
    try {
      formattedPhone = validateAndFormatE164(phone);
    } catch (valErr) {
      return res.status(400).json({
        success: false,
        error: valErr.message,
      });
    }

    // Verify OTP through abstracted verification provider
    const verification = await verifyOTP(formattedPhone, otp, verification_id);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: "That code isn't correct. Please try again.",
      });
    }

    // Check if user already exists
    let user = await findUserByPhone(formattedPhone);
    let isNewUser = false;

    if (!user) {
      // Store phone number only after successful OTP verification
      user = await createUser(formattedPhone);
      isNewUser = true;
    } else {
      // If user has not completed profile (no name), treat as new user flow
      if (!user.name || user.name.trim() === '') {
        isNewUser = true;
      }
    }

    // Generate authenticated session
    const token = generateSessionToken(user);

    // Set secure HTTP-only cookie
    res.cookie('revive_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      success: true,
      is_new_user: isNewUser,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        phone_verified: true,
        name: user.name || '',
        email: user.email || '',
      },
    });
  } catch (err) {
    console.error('Error in verify-otp:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || "That code isn't correct. Please try again.",
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user session
 */
router.get('/me', async (req, res) => {
  try {
    let token = req.cookies?.revive_session;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.json({ authenticated: false, user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.json({ authenticated: false, user: null });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        phone_verified: true,
        name: user.name || '',
        email: user.email || '',
      },
    });
  } catch (err) {
    return res.json({ authenticated: false, user: null });
  }
});

/**
 * POST /api/auth/logout
 * Clears authenticated session
 */
router.post('/logout', (req, res) => {
  res.clearCookie('revive_session');
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
