import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RELATIONSHIPS = JSON.parse(readFileSync(join(__dirname, '../data/relationships.json'), 'utf-8'));
const CATALOG = JSON.parse(readFileSync(join(__dirname, '../data/catalog.json'), 'utf-8'));

/**
 * Engine 3 — Complementary Recommendation Engine
 *
 * Deterministic graph-based selection (not hallucinated by the LLM).
 * LLM is used ONLY for generating human-readable reason strings (optional).
 */
export async function getRecommendations(cartLines) {
  // 1. Extract matched categories from cart
  const cartCategories = new Set(
    cartLines
      .filter(l => l.status === 'matched' || l.status === 'substituted')
      .map(l => {
        const product = CATALOG.find(p => p.sku === l.matched_sku);
        return product ? product.category : null;
      })
      .filter(Boolean)
  );

  if (cartCategories.size === 0) return [];

  // 2. Query relationship graph: base IN cartCategories AND related NOT IN cartCategories
  const candidates = new Map(); // related_category → {weight, based_on, reason}

  for (const rel of RELATIONSHIPS) {
    if (cartCategories.has(rel.base) && !cartCategories.has(rel.related)) {
      const existing = candidates.get(rel.related);
      if (!existing || rel.weight > existing.weight) {
        candidates.set(rel.related, {
          related_category: rel.related,
          weight: rel.weight,
          based_on: rel.base,
          base_reason: rel.reason,
        });
      }
    }
  }

  // 3. Rank by weight, take top 5
  const ranked = Array.from(candidates.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  // 4. Find best in-stock product per recommended category
  const recommendations = [];
  for (const rec of ranked) {
    const product = CATALOG.find(
      p => p.category === rec.related_category && p.in_stock
    );
    if (!product) continue;

    recommendations.push({
      based_on: rec.based_on,
      related_category: rec.related_category,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      price: product.price,
      unit: product.unit,
      pack_size: product.pack_size,
      reason: rec.base_reason, // deterministic reason from graph
    });
  }

  // 5. Optional: LLM polish — improve reason strings (non-blocking, degrades gracefully)
  if (process.env.GEMINI_API_KEY && recommendations.length > 0) {
    try {
      const polished = await polishReasons(recommendations, Array.from(cartCategories));
      return polished;
    } catch (err) {
      console.warn('Recommendation reason polish failed (non-critical):', err.message);
    }
  }

  return recommendations;
}

async function polishReasons(recommendations, cartCategories) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a grocery shopping assistant. 
Cart contains: ${cartCategories.join(', ')}.
I have these product recommendations from a relationship graph. 
Write a short, friendly, one-line reason (max 8 words) for adding each item.
Return ONLY a JSON array of strings, one per recommendation, in order.

Recommendations:
${recommendations.map((r, i) => `${i + 1}. ${r.name} (based on: ${r.based_on})`).join('\n')}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim()
    .replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

  const reasons = JSON.parse(text);
  return recommendations.map((r, i) => ({
    ...r,
    reason: reasons[i] || r.reason,
  }));
}
