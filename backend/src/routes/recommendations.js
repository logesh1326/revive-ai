import { Router } from 'express';
import { getRecommendations } from '../engines/recommendation.js';
import { getSession, updateSession, transitionState } from '../engines/cartCheckout.js';
import { getProductBySku } from '../engines/productMatching.js';

const router = Router();

// GET /api/v1/recommendations?request_id=xxx
router.get('/', async (req, res) => {
  try {
    const { request_id } = req.query;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const matchedLines = session.cart_lines.filter(
      l => l.status === 'matched' || l.status === 'substituted'
    );

    const recommendations = await getRecommendations(matchedLines);

    // Store recommendations in session (not yet added to cart)
    const recLines = recommendations.map((r, idx) => ({
      rec_id: `rec_${idx + 1}`,
      source: 'recommendation',
      based_on: r.based_on,
      sku: r.sku,
      name: r.name,
      brand: r.brand,
      price: r.price,
      unit: r.unit,
      pack_size: r.pack_size,
      reason: r.reason,
      matched_qty: 1,
      unit_price: r.price,
      line_total: r.price,
      added: false,
    }));

    updateSession(request_id, { recommendation_lines: recLines });

    res.json({ recommendations: recLines });
  } catch (err) {
    console.error('recommendations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/recommendations/add
router.post('/add', (req, res) => {
  try {
    const { request_id, rec_id, sku } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const updatedRecs = session.recommendation_lines.map(r => {
      if ((rec_id && r.rec_id === rec_id) || (sku && r.sku === sku)) {
        return { ...r, added: true };
      }
      return r;
    });

    updateSession(request_id, { recommendation_lines: updatedRecs });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/recommendations/add-all
router.post('/add-all', (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const updatedRecs = session.recommendation_lines.map(r => ({ ...r, added: true }));
    updateSession(request_id, { recommendation_lines: updatedRecs });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/recommendations/remove
router.post('/remove', (req, res) => {
  try {
    const { request_id, rec_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const updatedRecs = session.recommendation_lines.map(r =>
      r.rec_id === rec_id ? { ...r, added: false } : r
    );
    updateSession(request_id, { recommendation_lines: updatedRecs });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/recommendations/done — advance state
router.post('/done', (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // Allow transition from ITEMS_REVIEWED or RECOMMENDATIONS_REVIEWED
    if (session.state === 'ITEMS_REVIEWED') {
      transitionState(request_id, 'RECOMMENDATIONS_REVIEWED');
    }

    res.json({ success: true, state: getSession(request_id).state });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
