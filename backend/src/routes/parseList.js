import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseShoppingList } from '../engines/listUnderstanding.js';
import { createSession, updateSession } from '../engines/cartCheckout.js';

const router = Router();

// POST /api/v1/parse-list
router.post('/', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text || !raw_text.trim()) {
      return res.status(400).json({ error: 'raw_text is required.' });
    }

    const requestId = uuidv4();
    const items = await parseShoppingList(raw_text.trim());

    // Create a session in the state machine
    const session = createSession(requestId, items);
    updateSession(requestId, { raw_text: raw_text.trim() });

    res.json({ request_id: requestId, items });
  } catch (err) {
    console.error('parse-list error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
