/**
 * Engine 4 — Cart & Checkout Agent (In-Memory State Machine)
 *
 * State machine transitions (enforced server-side):
 * DRAFT_CART → ITEMS_REVIEWED → RECOMMENDATIONS_REVIEWED
 *   → CART_APPROVED → PAYMENT_INITIATED → PAYMENT_CONFIRMED → ORDER_CREATED
 */

// In-memory session store (keyed by request_id)
const sessions = new Map();

// Valid state transitions
const TRANSITIONS = {
  DRAFT_CART: ['ITEMS_REVIEWED'],
  ITEMS_REVIEWED: ['RECOMMENDATIONS_REVIEWED'],
  RECOMMENDATIONS_REVIEWED: ['CART_APPROVED'],
  CART_APPROVED: ['PAYMENT_INITIATED'],
  PAYMENT_INITIATED: ['PAYMENT_CONFIRMED'],
  PAYMENT_CONFIRMED: ['ORDER_CREATED'],
  ORDER_CREATED: [],
};

export function createSession(requestId, parsedItems) {
  const session = {
    request_id: requestId,
    state: 'DRAFT_CART',
    raw_text: '',
    parsed_items: parsedItems,
    cart_lines: [], // matched + substituted + removed_by_user (original list only)
    recommendation_lines: [], // items from Engine 3
    unavailable: [],
    razorpay_order_id: null,
    razorpay_payment_id: null,
    order_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  sessions.set(requestId, session);
  return session;
}

export function getSession(requestId) {
  return sessions.get(requestId) || null;
}

export function updateSession(requestId, updates) {
  const session = sessions.get(requestId);
  if (!session) throw new Error(`Session not found: ${requestId}`);
  const updated = { ...session, ...updates, updated_at: new Date().toISOString() };
  sessions.set(requestId, updated);
  return updated;
}

export function transitionState(requestId, toState) {
  const session = sessions.get(requestId);
  if (!session) throw new Error(`Session not found: ${requestId}`);

  const allowed = TRANSITIONS[session.state] || [];
  if (!allowed.includes(toState)) {
    throw new Error(
      `Invalid state transition: ${session.state} → ${toState}. ` +
      `Allowed: ${allowed.join(', ') || 'none'}.`
    );
  }

  session.state = toState;
  session.updated_at = new Date().toISOString();
  sessions.set(requestId, session);
  return session;
}

export function assertState(requestId, requiredState) {
  const session = sessions.get(requestId);
  if (!session) throw new Error(`Session not found: ${requestId}`);
  if (session.state !== requiredState) {
    throw new Error(
      `Operation requires state ${requiredState}, but cart is in state ${session.state}.`
    );
  }
  return session;
}

export function computeCartTotal(session) {
  const originalTotal = session.cart_lines
    .filter(l => l.status !== 'removed_by_user')
    .reduce((sum, l) => sum + (l.line_total || 0), 0);

  const recTotal = session.recommendation_lines
    .filter(l => l.added)
    .reduce((sum, l) => sum + (l.line_total || 0), 0);

  return Math.round((originalTotal + recTotal) * 100) / 100;
}

export function buildCartView(session) {
  const activeOriginal = session.cart_lines.filter(l => l.status !== 'removed_by_user');
  const activeRecs = session.recommendation_lines.filter(l => l.added);
  const unavailable = session.cart_lines.filter(l => l.status === 'unavailable');

  const subtotal = computeCartTotal(session);

  return {
    request_id: session.request_id,
    state: session.state,
    original_items: activeOriginal,
    unavailable_items: unavailable,
    recommended_items: activeRecs,
    subtotal,
    total: subtotal,
    item_count: activeOriginal.length + activeRecs.length,
    coverage: {
      total_requested: session.parsed_items.length,
      matched: session.cart_lines.filter(l => l.status === 'matched' || l.status === 'substituted').length,
      unavailable: session.cart_lines.filter(l => l.status === 'unavailable').length,
      removed: session.cart_lines.filter(l => l.status === 'removed_by_user').length,
    },
  };
}

export function finalizeOrder(session, razorpayPaymentId) {
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const deliverySlots = [
    'Today, 6:00 PM – 8:00 PM',
    'Tomorrow, 9:00 AM – 11:00 AM',
    'Tomorrow, 2:00 PM – 4:00 PM',
  ];
  const slot = deliverySlots[Math.floor(Math.random() * deliverySlots.length)];

  const updated = updateSession(session.request_id, {
    razorpay_payment_id: razorpayPaymentId,
    order_id: orderId,
    state: 'ORDER_CREATED',
    delivery_slot: slot,
    payment_status: 'paid',
  });

  return {
    order_id: orderId,
    razorpay_order_id: session.razorpay_order_id,
    razorpay_payment_id: razorpayPaymentId,
    items: [
      ...updated.cart_lines.filter(l => l.status !== 'removed_by_user'),
      ...updated.recommendation_lines.filter(l => l.added),
    ],
    subtotal: computeCartTotal(updated),
    total: computeCartTotal(updated),
    payment_status: 'paid',
    delivery_slot: slot,
    created_at: updated.updated_at,
  };
}
