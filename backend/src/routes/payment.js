import { Router } from 'express';
import {
  getSession,
  updateSession,
  transitionState,
  computeCartTotal,
  finalizeOrder,
} from '../engines/cartCheckout.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} from '../integrations/razorpay.js';

const router = Router();

// POST /api/v1/payment/create-order
// CRITICAL: Only callable when cart state is CART_APPROVED.
// Amount is computed SERVER-SIDE from stored cart — never from client input.
router.post('/create-order', async (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // GUARD: must be in CART_APPROVED state
    if (session.state !== 'CART_APPROVED') {
      return res.status(400).json({
        error: `Cart must be in CART_APPROVED state before payment. Current state: ${session.state}`,
      });
    }

    // Amount computed SERVER-SIDE — client amount is IGNORED
    const total = computeCartTotal(session);
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ error: 'Cart total is zero — cannot create payment order.' });
    }

    const order = await createRazorpayOrder(request_id, amountInPaise);

    // Persist Razorpay order ID and advance state
    updateSession(request_id, { razorpay_order_id: order.id });
    transitionState(request_id, 'PAYMENT_INITIATED');

    res.json({
      order_id: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: getRazorpayKeyId(),
      mocked: order.mocked || false,
    });
  } catch (err) {
    console.error('payment/create-order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/payment/verify
// Verifies Razorpay HMAC signature server-side before marking paid.
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, request_id } = req.body;

    // Find session by razorpay_order_id
    let session = null;
    if (request_id) {
      session = getSession(request_id);
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Verify signature BEFORE marking paid
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ status: 'failed', reason: 'signature_mismatch' });
    }

    // Idempotency guard — don't double-confirm
    if (session.state === 'ORDER_CREATED') {
      return res.json({ status: 'success', order_id: session.order_id, already_confirmed: true });
    }

    if (session.state !== 'PAYMENT_INITIATED') {
      return res.status(400).json({
        error: `Cannot confirm payment in state: ${session.state}`,
      });
    }

    transitionState(session.request_id, 'PAYMENT_CONFIRMED');
    const order = finalizeOrder(getSession(session.request_id), razorpay_payment_id);

    res.json({ status: 'success', order_id: order.order_id, order });
  } catch (err) {
    console.error('payment/verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/payment/mock-success — for demo without Razorpay keys
router.post('/mock-success', async (req, res) => {
  try {
    const { request_id } = req.body;
    const session = getSession(request_id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    if (!['CART_APPROVED', 'PAYMENT_INITIATED'].includes(session.state)) {
      return res.status(400).json({ error: `Cannot mock payment in state: ${session.state}` });
    }

    if (session.state === 'CART_APPROVED') {
      const total = computeCartTotal(session);
      const amountInPaise = Math.round(total * 100);
      const mockOrder = await createRazorpayOrder(request_id, amountInPaise);
      updateSession(request_id, { razorpay_order_id: mockOrder.id });
      transitionState(request_id, 'PAYMENT_INITIATED');
    }

    transitionState(request_id, 'PAYMENT_CONFIRMED');
    const order = finalizeOrder(getSession(request_id), `mock_pay_${Date.now()}`);

    res.json({ status: 'success', order_id: order.order_id, order });
  } catch (err) {
    console.error('mock-success error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
