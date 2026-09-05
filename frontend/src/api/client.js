const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:4000/api';
const ENGINE_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  // Determine if path belongs to engine v1 or main API
  const url = path.startsWith('/v1') 
    ? `${API_ROOT}${path}` 
    : (path.startsWith('/auth') || path.startsWith('/profile') || path.startsWith('/addresses') 
        ? `${API_ROOT}${path}` 
        : `${ENGINE_BASE}${path}`);

  const token = localStorage.getItem('revive_token');
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  const res = await fetch(url, {
    credentials: 'include', // Support HTTP-only cookies
    headers: { 
      'Content-Type': 'application/json', 
      ...authHeader,
      ...options.headers 
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // ─── Real Phone Authentication ───────────────────────────────────────────────
  sendOtp: (phone) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone, otp, verification_id) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp, verification_id }) }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request('/auth/me'),

  // ─── Intelligent AI Grocery-List Agent ────────────────────────────────────────
  scanGroceryList: ({ image, raw_text, customer_id }) =>
    request('/ai/scan-list', { method: 'POST', body: JSON.stringify({ image, raw_text, customer_id }) }),

  extractGroceryItems: (raw_text) =>
    request('/ai/extract-items', { method: 'POST', body: JSON.stringify({ raw_text }) }),

  matchProducts: (items, customer_id) =>
    request('/ai/match-products', { method: 'POST', body: JSON.stringify({ items, customer_id }) }),

  sendAiFeedback: ({ customer_id, recommendation_id, product_id, action, brand, category }) =>
    request('/ai/feedback', { method: 'POST', body: JSON.stringify({ customer_id, recommendation_id, product_id, action, brand, category }) }),

  getAiPreferences: (customer_id) =>
    request(`/ai/preferences?customer_id=${customer_id || 'default'}`),

  getAiInsights: () =>
    request('/ai/insights'),

  // ─── Profile & Address Endpoints ─────────────────────────────────────────────
  getProfile: () =>
    request('/profile'),

  updateProfile: ({ name, email }) =>
    request('/profile', { method: 'POST', body: JSON.stringify({ name, email }) }),

  getAddresses: () =>
    request('/addresses'),

  addAddress: (addressData) =>
    request('/addresses', { method: 'POST', body: JSON.stringify(addressData) }),

  updateAddress: (id, addressData) =>
    request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(addressData) }),

  deleteAddress: (id) =>
    request(`/addresses/${id}`, { method: 'DELETE' }),

  // ─── Engine 1: Parse List ───────────────────────────────────────────────────
  parseList: (raw_text) =>
    request('/parse-list', { method: 'POST', body: JSON.stringify({ raw_text }) }),

  // ─── Engine 2: Match Products ───────────────────────────────────────────────
  matchProducts: (request_id) =>
    request('/match-products', { method: 'POST', body: JSON.stringify({ request_id }) }),

  resolveUnavailable: (request_id, line_id, action, chosen_sku) =>
    request('/match-products/resolve', {
      method: 'POST',
      body: JSON.stringify({ request_id, line_id, action, chosen_sku }),
    }),

  // ─── Engine 3: Recommendations ──────────────────────────────────────────────
  getRecommendations: (request_id) =>
    request(`/recommendations?request_id=${request_id}`),

  addRecommendation: (request_id, rec_id) =>
    request('/recommendations/add', { method: 'POST', body: JSON.stringify({ request_id, rec_id }) }),

  removeRecommendation: (request_id, rec_id) =>
    request('/recommendations/remove', { method: 'POST', body: JSON.stringify({ request_id, rec_id }) }),

  addAllRecommendations: (request_id) =>
    request('/recommendations/add-all', { method: 'POST', body: JSON.stringify({ request_id }) }),

  doneRecommendations: (request_id) =>
    request('/recommendations/done', { method: 'POST', body: JSON.stringify({ request_id }) }),

  // ─── Cart ───────────────────────────────────────────────────────────────────
  getCart: (request_id) =>
    request(`/cart/${request_id}`),

  approveCart: (request_id) =>
    request('/cart/approve', { method: 'POST', body: JSON.stringify({ request_id }) }),

  updateCartLine: (request_id, line_id, qty) =>
    request('/cart/update-line', { method: 'POST', body: JSON.stringify({ request_id, line_id, qty }) }),

  // ─── Payment ────────────────────────────────────────────────────────────────
  createPaymentOrder: (request_id) =>
    request('/payment/create-order', { method: 'POST', body: JSON.stringify({ request_id }) }),

  verifyPayment: (request_id, razorpay_order_id, razorpay_payment_id, razorpay_signature) =>
    request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ request_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }),
    }),

  mockPaymentSuccess: (request_id) =>
    request('/payment/mock-success', { method: 'POST', body: JSON.stringify({ request_id }) }),

  // ─── Orders ─────────────────────────────────────────────────────────────────
  getOrder: (request_id) =>
    request(`/orders/confirmed?request_id=${request_id}`),
};
