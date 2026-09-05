import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Synonym normalisation map
const SYNONYMS = {
  'tomatoes': 'tomato',
  'potatoes': 'potato',
  'onions': 'onion',
  'eggs': 'egg',
  'biscuit': 'biscuits',
  'cookie': 'biscuits',
  'cookies': 'biscuits',
  'atta': 'wheat_flour',
  'wheat flour': 'wheat_flour',
  'maida': 'wheat_flour',
  'dal': 'lentils',
  'daal': 'lentils',
  'toor dal': 'lentils',
  'moong dal': 'lentils',
  'chai': 'tea_powder',
  'tea': 'tea_powder',
  'coffee': 'coffee_powder',
  'french fries': 'french_fries',
  'fries': 'french_fries',
  'curd': 'curd',
  'dahi': 'curd',
  'yogurt': 'curd',
  'yoghurt': 'curd',
  'paneer': 'paneer',
  'cottage cheese': 'paneer',
  'ghee': 'ghee',
  'butter': 'butter',
  'cheese': 'cheese',
  'bread': 'bread',
  'pasta sauce': 'pasta_sauce',
  'tomato sauce': 'pasta_sauce',
  'ketchup': 'ketchup',
  'mayo': 'mayonnaise',
  'jam': 'jam',
  'honey': 'honey',
  'salt': 'salt',
  'sugar': 'sugar',
  'rice': 'rice',
  'noodles': 'noodles',
  'maggi': 'noodles',
  'chips': 'chips',
  'crisps': 'chips',
  'juice': 'juice',
  'water': 'water',
  'oil': 'cooking_oil',
  'sunflower oil': 'cooking_oil',
  'coconut oil': 'cooking_oil',
  'cornflakes': 'cereals',
  'corn flakes': 'cereals',
  'cereal': 'cereals',
  'ginger': 'ginger_garlic',
  'garlic': 'ginger_garlic',
  'adrak': 'ginger_garlic',
  'lahsun': 'ginger_garlic',
  'turmeric': 'spices',
  'haldi': 'spices',
  'chilli': 'spices',
  'masala': 'spices',
  'coriander': 'herbs',
  'dhania': 'herbs',
  'milk': 'milk',
};

/**
 * Normalise a raw item name from the LLM into a standard category key.
 */
export function normaliseItem(raw) {
  const lower = raw.toLowerCase().trim();
  return SYNONYMS[lower] || lower.replace(/\s+/g, '_');
}

/**
 * Estimate the number of items in raw text before LLM parsing.
 * Used for the "never drop an item" guardrail.
 */
function estimateItemCount(rawText) {
  // Split on commas, newlines, and "and" (word boundary)
  const parts = rawText
    .split(/,|\n|(?:\band\b)/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return parts.length;
}

/**
 * Engine 1 — List Understanding Engine
 * Converts raw free-text shopping list to structured JSON using Gemini.
 */
export async function parseShoppingList(rawText) {
  const estimatedCount = estimateItemCount(rawText);

  let parsedItems = null;

  // Try LLM first
  if (process.env.GEMINI_API_KEY) {
    try {
      parsedItems = await callGemini(rawText, estimatedCount);
    } catch (err) {
      console.warn('Gemini parse failed, falling back to regex parser:', err.message);
    }
  }

  // Fallback: regex-based parser
  if (!parsedItems) {
    parsedItems = regexParser(rawText);
  }

  // Guardrail: if we parsed fewer items than estimated, re-try with an explicit count hint
  if (parsedItems.length < estimatedCount && process.env.GEMINI_API_KEY) {
    try {
      const missing = estimatedCount - parsedItems.length;
      const retryText = `${rawText}\n\n[IMPORTANT: You must return exactly ${estimatedCount} items. You missed ${missing} item(s). Re-parse the full text and include every single item.]`;
      const retried = await callGemini(retryText, estimatedCount);
      if (retried.length >= parsedItems.length) {
        parsedItems = retried;
      }
    } catch (err) {
      console.warn('Retry parse failed:', err.message);
    }
  }

  return parsedItems.map((item, idx) => ({
    line_id: idx + 1,
    item: normaliseItem(item.item),
    display_name: item.item,
    quantity: item.quantity || 1,
    unit: item.unit || 'packet',
    brand_preference: item.brand_preference || null,
    status: 'pending',
  }));
}

async function callGemini(rawText, estimatedCount) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `You convert a shopping list written in natural language (English, Hindi-English mix, or Tamil-English mix) into a strict JSON array.

Each element MUST have:
- item: normalized lowercase generic name (e.g. "milk", "coffee_powder", "tomato", "french_fries")
- quantity: number (default 1 if unspecified)
- unit: one of: "litre","ml","kg","gram","packet","piece","dozen" (default "packet")
- brand_preference: string or null

CRITICAL RULES:
1. Return ONLY a valid JSON array. No prose, no markdown fences, no explanation.
2. Every item mentioned must appear in the output. Expected item count: ${estimatedCount}.
3. If quantity/unit is ambiguous, use sensible defaults.
4. Items like "2 litres milk" → item:"milk", quantity:2, unit:"litre"
5. Items like "atta 1kg" → item:"wheat_flour", quantity:1, unit:"kg"`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `Shopping list: "${rawText}"` }
  ]);

  const responseText = result.response.text().trim();
  // Strip markdown fences if present
  const cleaned = responseText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

function regexParser(rawText) {
  const UNITS = ['litre', 'litres', 'liter', 'liters', 'l', 'ml', 'millilitre',
    'kg', 'kilogram', 'kilograms', 'g', 'gram', 'grams', 'gm',
    'packet', 'pack', 'pkt', 'piece', 'pieces', 'pcs', 'pc',
    'dozen', 'doz'];

  const unitNorm = {
    'litres': 'litre', 'liter': 'litre', 'liters': 'litre', 'l': 'litre',
    'ml': 'ml', 'millilitre': 'ml',
    'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
    'g': 'gram', 'grams': 'gram', 'gm': 'gram',
    'packet': 'packet', 'pack': 'packet', 'pkt': 'packet',
    'piece': 'piece', 'pieces': 'piece', 'pcs': 'piece', 'pc': 'piece',
    'dozen': 'dozen', 'doz': 'dozen',
  };

  const parts = rawText
    .split(/,|\n|(?:\band\b)/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const unitPattern = new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(${UNITS.join('|')})\\b`, 'i');
  const numPattern = /^\s*(\d+(?:\.\d+)?)\s+(.+)/;

  return parts.map(part => {
    let quantity = 1;
    let unit = 'packet';
    let itemText = part;

    const unitMatch = part.match(unitPattern);
    if (unitMatch) {
      quantity = parseFloat(unitMatch[1]);
      unit = unitNorm[unitMatch[2].toLowerCase()] || unitMatch[2].toLowerCase();
      itemText = part.replace(unitMatch[0], '').trim();
    } else {
      const numMatch = part.match(numPattern);
      if (numMatch) {
        quantity = parseFloat(numMatch[1]);
        itemText = numMatch[2].trim();
      }
    }

    return {
      item: itemText.toLowerCase().trim(),
      quantity,
      unit,
      brand_preference: null,
    };
  });
}
