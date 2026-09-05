import crypto from 'crypto';
import Razorpay from 'razorpay';

let instance = null;

function getRazorpay() {
  if (!instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return null;
    }
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}

/**
 * Create a Razorpay order (server-side, amount from DB cart — never from client).
 */
export async function createRazorpayOrder(requestId, amountInPaise) {
  const rzp = getRazorpay();

  // Mocked response if Razorpay keys are not configured
  if (!rzp) {
    console.warn('Razorpay not configured — using mock order.');
    return {
      id: `mock_order_${requestId}_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${requestId}`,
      status: 'created',
      mocked: true,
    };
  }

  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${requestId}`.slice(0, 40),
    notes: { request_id: requestId },
  });

  return order;
}

/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 * Returns true if valid, false if tampered/invalid.
 */
export function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  // In mock mode (no keys), skip verification
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay secret not set — skipping signature verification (mock mode).');
    return true;
  }

  // Mock orders bypass verification
  if (razorpayOrderId.startsWith('mock_order_')) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || null;
}
