import { Router } from 'express';
import {
  getSession,
  updateSession,
  transitionState,
  buildCartView,
  computeCartTotal,
} from '../engines/cartCheckout.js';

const router = Router();

// GET /api/v1/cart/:request_id
router.get('/:request_id', (req, res) => {
  try {
    const session = getSession(req.params.request_id);
    if (!session) return res.status(404).json({ error: 'Cart not found.' });
    res.json(buildCartView(session));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/cart/approve
router.post('/approve', (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // Allow from RECOMMENDATIONS_REVIEWED or ITEMS_REVIEWED
    if (session.state === 'ITEMS_REVIEWED') {
      transitionState(request_id, 'RECOMMENDATIONS_REVIEWED');
    }
    transitionState(request_id, 'CART_APPROVED');

    const total = computeCartTotal(getSession(request_id));
    const amountInPaise = Math.round(total * 100);

    res.json({ success: true, amount: amountInPaise, total, state: 'CART_APPROVED' });
  } catch (err) {
    console.error('cart/approve error:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/cart/update-line — update quantity of a cart line
router.post('/update-line', (req, res) => {
  try {
    const { request_id, line_id, qty } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const updatedLines = session.cart_lines.map(l => {
      if (l.line_id === line_id) {
        return { ...l, matched_qty: qty, line_total: l.unit_price * qty };
      }
      return l;
    });

    updateSession(request_id, { cart_lines: updatedLines });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
