import express from 'express';
import { requireAuth } from './auth.js';
import { updateUserProfile, findUserById } from '../db/index.js';

const router = express.Router();

/**
 * GET /api/profile
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    return res.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone,
        phone_verified: user.phone_verified,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/profile & PUT /api/profile
 */
const handleUpdateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const updatedUser = await updateUserProfile(req.user.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        phone_verified: true,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

router.post('/', requireAuth, handleUpdateProfile);
router.put('/', requireAuth, handleUpdateProfile);

export default router;
