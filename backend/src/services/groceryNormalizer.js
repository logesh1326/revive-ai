/**
 * Grocery Normalizer Module
 * Handles typo correction, pluralization, unit & quantity parsing, and synonym mapping.
 */

// Common synonym and typo dictionaries
const SYNONYM_MAP = {
  // Vegetables
  'potatos': 'potato',
  'potato': 'potato',
  'potatoes': 'potato',
  'aloo': 'potato',
  'tomatos': 'tomato',
  'tomato': 'tomato',
  'tomatoes': 'tomato',
  'tamatar': 'tomato',
  'pyaz': 'onion',
  'onions': 'onion',
  'onion': 'onion',
  'crushed tomatoes': 'canned tomatoes',
  'peas & carrots': 'peas and carrots',
  'peas and carrots': 'green peas',
  'green peas': 'green peas',
  'ginger & garlic': 'ginger garlic paste',
  'chilli': 'green chillies',
  'chillies': 'green chillies',

  // Dairy & Eggs
  'almnd milk': 'almond milk',
  'almond milk': 'almond milk',
  'milk': 'milk',
  'creamer vanilla': 'vanilla creamer',
  'vanilla creamer': 'vanilla creamer',
  'eggs': 'eggs',
  'egg': 'eggs',
  'butter': 'butter',
  'dahi': 'curd',
  'curd': 'curd',
  'yogurt': 'yogurt',
  'greek yogurt': 'greek yogurt',
  'paneer': 'paneer',
  'cheese': 'cheese',

  // Staples & Cooking
  'pastina': 'pasta',
  'pasta': 'pasta',
  'maggi': 'instant noodles',
  'noodles': 'instant noodles',
  'atta': 'wheat flour',
  'wheat flour': 'wheat flour',
  'flour': 'wheat flour',
  'rice': 'rice',
  'basmati': 'basmati rice',
  'basmati rice': 'basmati rice',
  'dal': 'toor dal',
  'toor dal': 'toor dal',
  'moong dal': 'moong dal',
  'sugar': 'sugar',
  'oil': 'cooking oil',
  'sunflower oil': 'sunflower oil',
  'ghee': 'desi ghee',
  'salt': 'salt',

  // Household & Pets
  'foil': 'aluminum foil',
  'aluminum foil': 'aluminum foil',
  'aluminium foil': 'aluminum foil',
  'garbage bags': 'garbage bags',
  'trash bags': 'garbage bags',
  'paper towel': 'paper towels',
  'paper towels': 'paper towels',
  'tissue': 'tissue paper',
  'dog treats': 'dog treats',
  'dog food': 'dog food',
  'dishwash': 'dishwash gel',
  'dishwash gel': 'dishwash gel',

  // Condiments & Beverages
  'hot sauce': 'hot sauce',
  'chilli sauce': 'hot sauce',
  'ketchup': 'tomato ketchup',
  'tea': 'tea powder',
  'chai': 'tea powder',
  'coffee': 'coffee powder',
  'peanut butter': 'peanut butter',
  'bread': 'bread',
};

const UNIT_PATTERNS = [
  { regex: /(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos)/i, unit: 'kg' },
  { regex: /(\d+(?:\.\d+)?)\s*(?:g|gm|gms|grams|gram)/i, unit: 'gram' },
  { regex: /(\d+(?:\.\d+)?)\s*(?:l|ltr|litre|litres|liter|liters)/i, unit: 'litre' },
  { regex: /(\d+(?:\.\d+)?)\s*(?:ml|millilitre)/i, unit: 'ml' },
  { regex: /(\d+)\s*(?:pack|packs|pkt|pkts|packet|packets)/i, unit: 'pack' },
  { regex: /(\d+)\s*(?:dozen|doz)/i, unit: 'dozen', multiplier: 12 },
  { regex: /(\d+)\s*(?:pcs|pc|pieces|count)/i, unit: 'count' },
  { regex: /\((\d+)\)/i, unit: 'count' },
  { regex: /x\s*(\d+)/i, unit: 'count' },
  { regex: /(\d+)\s*x/i, unit: 'count' },
];

/**
 * Normalizes an item string and extracts quantity, unit, and clean canonical search query
 */
export function normalizeGroceryItem(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      raw_text: '',
      normalized_name: '',
      quantity: 1,
      unit: 'unspecified',
      is_ambiguous: false,
      confidence: 0.5,
    };
  }

  let text = rawText.trim();
  const isAmbiguous = text.includes('?') || text.toLowerCase().includes('maybe') || text.toLowerCase().includes('if available');

  // Strip question marks and uncertainty markers
  text = text.replace(/\?+/g, '').replace(/\(if available\)/gi, '').trim();

  let quantity = 1;
  let unit = 'unspecified';

  // Extract units and quantities
  for (const { regex, unit: matchedUnit, multiplier } of UNIT_PATTERNS) {
    const match = text.match(regex);
    if (match) {
      const parsedVal = parseFloat(match[1]);
      quantity = multiplier ? parsedVal * multiplier : parsedVal;
      unit = matchedUnit;
      text = text.replace(regex, '').trim();
      break;
    }
  }

  // Check leading numbers e.g. "2 eggs"
  const leadingNum = text.match(/^(\d+)\s+(.+)$/);
  if (leadingNum && unit === 'unspecified') {
    quantity = parseInt(leadingNum[1], 10);
    text = leadingNum[2].trim();
    unit = 'count';
  }

  // Trailing numbers e.g. "eggs 2"
  const trailingNum = text.match(/^(.+)\s+(\d+)$/);
  if (trailingNum && unit === 'unspecified') {
    text = trailingNum[1].trim();
    quantity = parseInt(trailingNum[2], 10);
    unit = 'count';
  }

  const cleanQuery = text.toLowerCase().replace(/[^a-z0-9\s&]/g, ' ').replace(/\s+/g, ' ').trim();
  const canonicalName = SYNONYM_MAP[cleanQuery] || cleanQuery;

  // Calculate normalization confidence
  let confidence = 0.95;
  if (isAmbiguous) confidence = 0.65;
  else if (!SYNONYM_MAP[cleanQuery]) confidence = 0.88;

  return {
    raw_text: rawText.trim(),
    normalized_name: canonicalName,
    quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
    unit,
    is_ambiguous: isAmbiguous,
    confidence,
  };
}

export default { normalizeGroceryItem, SYNONYM_MAP };
