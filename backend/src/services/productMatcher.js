/**
 * Product Matcher Module
 * Connects normalized grocery entities to catalog products, ranking candidates with Contextual Bandit RL.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateRecommendationScore } from './contextualBandit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load catalog products
let catalog = [];
try {
  const catalogPath = path.resolve(__dirname, '../data/catalog.json');
  const rawData = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(rawData);
} catch (e) {
  console.error('Failed to load catalog in productMatcher:', e);
}

/**
 * Match a grocery entity against catalog items
 * @param {Object} groceryItem - Normalized grocery entity
 * @param {Object} customerProfile - Customer preference profile
 * @returns {Object} Match result with top recommendation and alternatives
 */
export function matchProduct(groceryItem, customerProfile = {}) {
  const query = (groceryItem.normalized_name || groceryItem.raw_text || '').toLowerCase();
  const words = query.split(' ').filter((w) => w.length > 2);

  // 1. Candidate Generation
  const candidates = catalog.filter((product) => {
    if (!product.in_stock) return false;
    const name = product.name.toLowerCase();
    const tags = (product.tags || []).map((t) => t.toLowerCase());

    // Exact or direct substring match
    if (name.includes(query) || tags.some((t) => t.includes(query) || query.includes(t))) {
      return true;
    }

    // Word intersection match
    return words.some((w) => name.includes(w) || tags.includes(w));
  });

  // Fallback to category products if no direct candidate found
  let candidatePool = candidates;
  if (candidatePool.length === 0 && groceryItem.category) {
    candidatePool = catalog.filter((p) => p.category === groceryItem.category && p.in_stock);
  }

  // Fallback to top rated items if still empty
  if (candidatePool.length === 0) {
    candidatePool = catalog.slice(0, 5);
  }

  // 2. Score candidates with Personalization & Contextual Bandit
  const scoredCandidates = candidatePool.map((product) => {
    const scoreObj = calculateRecommendationScore({
      product,
      groceryEntity: groceryItem,
      customerProfile,
    });

    return {
      product,
      score: scoreObj.score,
      reason: scoreObj.reason,
      metrics: scoreObj.metrics,
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  const topMatch = scoredCandidates[0];
  const alternatives = scoredCandidates.slice(1, 3).map((sc) => sc.product);

  // Determine Confidence Badge
  let confidenceBadge = 'HIGH'; // ✓ Matched
  if (groceryItem.is_ambiguous || topMatch.score < 0.65) {
    confidenceBadge = 'LOW'; // ⚠ Need clarification
  } else if (topMatch.score < 0.80) {
    confidenceBadge = 'MEDIUM'; // ? Please confirm
  }

  return {
    raw_item: groceryItem.raw_text,
    item: groceryItem.normalized_name,
    category: groceryItem.category,
    quantity: groceryItem.quantity || 1,
    unit: groceryItem.unit || 'unspecified',
    is_ambiguous: groceryItem.is_ambiguous,
    confidence_badge: confidenceBadge,
    match_score: topMatch.score,
    reason: topMatch.reason,
    recommended_product: topMatch.product,
    alternatives,
  };
}

/**
 * Match a full list of grocery entities
 */
export function matchGroceryList(groceryEntities, customerProfile = {}) {
  return groceryEntities.map((entity) => matchProduct(entity, customerProfile));
}

export default { matchProduct, matchGroceryList };
