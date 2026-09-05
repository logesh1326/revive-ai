/**
 * NLP Grocery Item Extraction Module
 * Converts raw OCR text lines into structured grocery entities with categories and units.
 */

import { normalizeGroceryItem } from './groceryNormalizer.js';

// Category mapping helper
const CATEGORY_KEYWORDS = {
  vegetables: ['potato', 'tomato', 'onion', 'garlic', 'ginger', 'carrot', 'peas', 'chillies', 'coriander', 'spinach', 'lemon', 'cucumber', 'vegetable'],
  dairy_and_eggs: ['milk', 'almond milk', 'creamer', 'vanilla creamer', 'egg', 'eggs', 'butter', 'curd', 'yogurt', 'paneer', 'cheese', 'ghee', 'dairy'],
  staples: ['rice', 'basmati', 'atta', 'flour', 'dal', 'toor dal', 'moong dal', 'sugar', 'salt', 'oil', 'sunflower oil', 'pasta', 'noodles', 'maggi', 'spices'],
  bakery_and_breakfast: ['bread', 'toast', 'oats', 'cereal', 'peanut butter', 'jam', 'biscuit', 'cookies', 'croissant'],
  beverages: ['tea', 'coffee', 'juice', 'soda', 'drink', 'water', 'hot chocolate'],
  snacks_and_packaged: ['chips', 'chocolate', 'sauce', 'ketchup', 'hot sauce', 'pasta', 'canned tomatoes', 'crushed tomatoes'],
  household: ['foil', 'aluminum foil', 'paper towels', 'tissue', 'garbage bags', 'trash bags', 'dishwash', 'detergent', 'cleaner'],
  pet_care: ['dog treats', 'dog food', 'cat food', 'pet'],
};

function inferCategory(normalizedName) {
  const name = normalizedName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (name.includes(kw)) return category;
    }
  }
  return 'general_grocery';
}

/**
 * Extracts structured grocery entities from raw multiline OCR string
 * @param {string} rawText
 * @returns {Array<Object>}
 */
export function extractGroceryEntities(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Split lines by newline, commas, or semicolons
  const lines = rawText
    .split(/\r?\n|•|\-|\*|\d+\.\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !/^(groceries|grocery list|shopping list|items|list):?$/i.test(l));

  const entities = [];

  for (const line of lines) {
    // Check if line contains multiple items separated by " & " or " and "
    const compoundParts = line.split(/\s+(?:&|and)\s+/i);
    
    // If it's a known single combo (like "peas & carrots" or "ginger & garlic"), process as one item
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('peas & carrots') || lowerLine.includes('ginger & garlic')) {
      const normalized = normalizeGroceryItem(line);
      entities.push({
        ...normalized,
        category: inferCategory(normalized.normalized_name),
      });
      continue;
    }

    if (compoundParts.length > 1 && !lowerLine.includes('paste') && !lowerLine.includes('sauce')) {
      // Multiple items on same line
      for (const part of compoundParts) {
        if (part.trim().length > 1) {
          const normalized = normalizeGroceryItem(part.trim());
          entities.push({
            ...normalized,
            category: inferCategory(normalized.normalized_name),
          });
        }
      }
    } else {
      const normalized = normalizeGroceryItem(line);
      entities.push({
        ...normalized,
        category: inferCategory(normalized.normalized_name),
      });
    }
  }

  return entities;
}

export default { extractGroceryEntities, inferCategory };
