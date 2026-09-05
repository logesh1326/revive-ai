import { Router } from 'express';
import { matchProducts, resolveUnavailable } from '../engines/productMatching.js';
import { getSession, updateSession, transitionState } from '../engines/cartCheckout.js';

const router = Router();

// POST /api/v1/match-products
router.post('/', (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const { matched, unavailable, coverage } = matchProducts(session.parsed_items);

    // Build unified cart_lines: matched lines + unavailable lines together
    const allLines = [
      ...matched,
      ...unavailable.map(u => ({
        line_id: u.line_id,
        source: 'original_list',
        requirement: u.requirement,
        item: u.item,
        matched_sku: null,
        matched_name: null,
        matched_qty: 0,
        unit_price: 0,
        line_total: 0,
        status: 'unavailable',
        reason: u.reason,
        suggestions: u.suggestions,
      })),
    ].sort((a, b) => a.line_id - b.line_id);

    updateSession(request_id, { cart_lines: allLines });
    transitionState(request_id, 'ITEMS_REVIEWED');

    res.json({ matched, unavailable, coverage });
  } catch (err) {
    console.error('match-products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/match-products/resolve-unavailable
router.post('/resolve', (req, res) => {
  try {
    const { request_id, line_id, action, chosen_sku } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    if (!['substitute', 'remove'].includes(action)) {
      return res.status(400).json({ error: "action must be 'substitute' or 'remove'." });
    }

    const updatedLines = resolveUnavailable(session.cart_lines, line_id, action, chosen_sku);
    updateSession(request_id, { cart_lines: updatedLines });

    res.json({ success: true, cart_lines: updatedLines });
  } catch (err) {
    console.error('resolve-unavailable error:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
