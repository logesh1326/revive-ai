import express from 'express';
import { requireAuth } from './auth.js';
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from '../db/index.js';

const router = express.Router();

/**
 * GET /api/addresses
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const addresses = await getUserAddresses(req.user.id);
    return res.json({
      success: true,
      addresses,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/addresses
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { address_type, house, street, area, landmark, city, state, pincode, is_default } = req.body;

    if (!house || !area || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'House/Flat number, Area, and PIN code are required.',
      });
    }

    const newAddress = await addAddress(req.user.id, {
      address_type: address_type || 'Home',
      house,
      street: street || '',
      area,
      landmark: landmark || '',
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode,
      is_default: is_default !== undefined ? is_default : true,
    });

    return res.json({
      success: true,
      message: 'Address saved successfully',
      address: newAddress,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/addresses/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const addressId = req.params.id;
    const updated = await updateAddress(req.user.id, addressId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Address not found.' });
    }

    return res.json({
      success: true,
      message: 'Address updated successfully',
      address: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/addresses/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const addressId = req.params.id;
    await deleteAddress(req.user.id, addressId);

    return res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
