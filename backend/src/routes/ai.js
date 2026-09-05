/**
 * AI Grocery-List Agent Router
 * Implements OCR list scan, NLP normalization, product matching, smart cart generation, and RL learning loop.
 */

import express from 'express';
import { extractText } from '../services/ocrService.js';
import { extractGroceryEntities } from '../services/nlpGroceryExtractor.js';
import { matchGroceryList, matchProduct } from '../services/productMatcher.js';
import { getCustomerProfile, updateCustomerProfile } from '../services/personalizationModel.js';
import { applyRewardFeedback, getBanditInsights } from '../services/contextualBandit.js';
import { saveShoppingList } from '../db/index.js';

const router = express.Router();

/**
 * POST /api/ai/scan-list
 * Full pipeline: Image/Text -> OCR -> NLP -> Personalization -> Contextual Bandit -> AI Cart
 */
router.post('/scan-list', async (req, res) => {
  try {
    const { image, raw_text, customer_id } = req.body;

    let extractedRawText = raw_text;
    let ocrConfidence = 0.95;
    let ocrMode = 'direct_text';

    // Step 1: OCR Processing if image is provided
    if (image && (!raw_text || raw_text.trim() === '')) {
      const ocrResult = await extractText(image);
      extractedRawText = ocrResult.raw_text;
      ocrConfidence = ocrResult.confidence;
      ocrMode = ocrResult.mode;
    }

    if (!extractedRawText || extractedRawText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'No grocery list text or image provided.',
      });
    }

    // Step 2: NLP Entity Extraction & Normalization
    const groceryEntities = extractGroceryEntities(extractedRawText);

    // Step 3: Fetch Customer Personalization Profile
    const customerProfile = await getCustomerProfile(customer_id || 'default');

    // Step 4: Product Matching & Contextual Bandit Ranking
    const matches = matchGroceryList(groceryEntities, customerProfile);

    // Step 5: Compute AI Cart Summary Metrics
    let estimatedTotal = 0;
    let estimatedSavings = 0;
    let matchedCount = 0;
    let needsConfirmationCount = 0;

    matches.forEach((m) => {
      const qty = m.quantity || 1;
      const price = m.recommended_product?.price || 0;
      const origPrice = m.recommended_product?.original_price || price;
      
      estimatedTotal += price * qty;
      estimatedSavings += Math.max(0, (origPrice - price) * qty);

      if (m.confidence_badge === 'HIGH') {
        matchedCount += 1;
      } else {
        needsConfirmationCount += 1;
      }
    });

    // Step 6: Persist to Database
    const listId = await saveShoppingList({
      userId: customer_id || 'guest',
      rawText: extractedRawText,
      imageUrl: typeof image === 'string' && image.length < 500 ? image : null,
      totalItems: matches.length,
      matchedItems: matchedCount,
      items: matches.map((m) => ({
        raw_text: m.raw_item,
        normalized_name: m.item,
        category: m.category,
        quantity: m.quantity,
        unit: m.unit,
        confidence: m.match_score,
        matched_sku: m.recommended_product?.sku,
      })),
    });

    return res.json({
      success: true,
      list_id: listId,
      raw_text: extractedRawText,
      ocr_confidence: ocrConfidence,
      ocr_mode: ocrMode,
      total_items: matches.length,
      matched_items: matchedCount,
      needs_confirmation_count: needsConfirmationCount,
      estimated_total: estimatedTotal,
      estimated_savings: estimatedSavings,
      matches,
    });
  } catch (err) {
    console.error('Error in /api/ai/scan-list:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process grocery list.',
    });
  }
});

/**
 * POST /api/ai/extract-items
 */
router.post('/extract-items', (req, res) => {
  try {
    const { raw_text } = req.body;
    const entities = extractGroceryEntities(raw_text);
    return res.json({ success: true, count: entities.length, entities });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/match-products
 */
router.post('/match-products', async (req, res) => {
  try {
    const { items, customer_id } = req.body;
    const profile = await getCustomerProfile(customer_id || 'default');
    const matches = matchGroceryList(items || [], profile);
    return res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/recommend
 */
router.post('/recommend', async (req, res) => {
  try {
    const { item_name, customer_id } = req.body;
    const profile = await getCustomerProfile(customer_id || 'default');
    const match = matchProduct({ raw_text: item_name, normalized_name: item_name }, profile);
    return res.json({ success: true, recommendation: match });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/build-cart
 */
router.post('/build-cart', (req, res) => {
  try {
    const { matches } = req.body;
    if (!Array.isArray(matches)) {
      return res.status(400).json({ success: false, error: 'Matches array is required.' });
    }

    const cartItems = matches.map((m) => ({
      product: m.recommended_product,
      quantity: m.quantity || 1,
      match_reason: m.reason,
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

    return res.json({
      success: true,
      item_count: cartItems.length,
      estimated_total: total,
      cart_items: cartItems,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/feedback
 * Records user interaction reward for Contextual Bandit RL
 */
router.post('/feedback', async (req, res) => {
  try {
    const { customer_id, recommendation_id, product_id, action, brand, category } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: 'Action is required (ADD, REMOVE, REPLACE, VIEW, PURCHASE).' });
    }

    const feedbackResult = await applyRewardFeedback({
      customerId: customer_id || 'default',
      recommendationId: recommendation_id || `rec_${Date.now()}`,
      productId: product_id,
      action,
    });

    // Update customer preferences if brand information is available
    if (brand && ['ADD', 'PURCHASE'].includes(action.toUpperCase())) {
      await updateCustomerProfile(customer_id || 'default', { brand, category });
    }

    return res.json(feedbackResult);
  } catch (err) {
    console.error('Error in /api/ai/feedback:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/learn
 */
router.post('/learn', async (req, res) => {
  try {
    const { customer_id, preferences } = req.body;
    const updated = await updateCustomerProfile(customer_id || 'default', preferences || {});
    return res.json({ success: true, updated_profile: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const customerId = req.query.customer_id || 'default';
    const profile = await getCustomerProfile(customerId);
    return res.json({ success: true, preferences: profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/insights
 */
router.get('/insights', (req, res) => {
  try {
    const insights = getBanditInsights();
    return res.json({ success: true, insights });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
