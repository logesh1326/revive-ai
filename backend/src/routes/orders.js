import { Router } from 'express';
import { getSession } from '../engines/cartCheckout.js';

const router = Router();

// GET /api/v1/orders/:order_id
router.get('/:order_id', (req, res) => {
  // We search all sessions for the order_id
  // In production this would be a DB query
  // For the prototype we just return from the session that matches
  // The client can also pass request_id as a query param for direct lookup
  const { request_id } = req.query;

  if (request_id) {
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Order not found.' });

    if (session.state !== 'ORDER_CREATED') {
      return res.status(404).json({ error: 'Order not yet confirmed.' });
    }

    return res.json({
      order_id: session.order_id,
      razorpay_order_id: session.razorpay_order_id,
      razorpay_payment_id: session.razorpay_payment_id,
      items: [
        ...session.cart_lines.filter(l => l.status !== 'removed_by_user'),
        ...session.recommendation_lines.filter(l => l.added),
      ],
      payment_status: session.payment_status,
      delivery_slot: session.delivery_slot,
      created_at: session.updated_at,
    });
  }

  res.status(400).json({ error: 'Please provide request_id as a query param.' });
});

export default router;
