import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { normaliseItem } from './listUnderstanding.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = JSON.parse(readFileSync(join(__dirname, '../data/catalog.json'), 'utf-8'));

/**
 * Engine 2 — Product Matching Engine
 *
 * For each parsed requirement, find the best matching product(s) from the catalog.
 * Core invariant: every input requirement produces exactly one cart line
 * (status: matched | unavailable). Never silently drops a line.
 */
export function matchProducts(parsedItems) {
  const matched = [];
  const unavailable = [];

  for (const req of parsedItems) {
    const result = findBestMatch(req);

    if (result.status === 'matched') {
      matched.push(result.cartLine);
    } else {
      unavailable.push(result.unavailableEntry);
    }
  }

  // HARD INVARIANT — enforced in code, not just UI
  const totalLines = matched.length + unavailable.length;
  if (totalLines !== parsedItems.length) {
    throw new Error(
      `INVARIANT VIOLATION: Every original requirement must produce exactly one cart line. ` +
      `Expected ${parsedItems.length}, got ${totalLines}.`
    );
  }

  return {
    matched,
    unavailable,
    coverage: {
      total_requested: parsedItems.length,
      matched: matched.length,
      unavailable: unavailable.length,
    },
  };
}

function findBestMatch(req) {
  const normItem = normaliseItem(req.item);

  // --- Strategy 1: exact category match ---
  let candidates = CATALOG.filter(p => p.category === normItem);

  // --- Strategy 2: tag search if no category match ---
  if (candidates.length === 0) {
    candidates = CATALOG.filter(p =>
      p.tags.some(tag => tag.includes(normItem) || normItem.includes(tag))
    );
  }

  // --- Strategy 3: fuzzy name match ---
  if (candidates.length === 0) {
    const words = normItem.split('_');
    candidates = CATALOG.filter(p =>
      words.some(w => w.length > 2 &&
        (p.name.toLowerCase().includes(w) || p.tags.some(t => t.includes(w)))
      )
    );
  }

  if (candidates.length === 0) {
    return buildUnavailable(req, 'not_in_catalog', []);
  }

  // Sort: in-stock first, then brand preference, then price asc
  const inStock = candidates.filter(p => p.in_stock);
  const outOfStock = candidates.filter(p => !p.in_stock);

  if (inStock.length === 0) {
    // All candidates are out of stock
    const suggestions = outOfStock.slice(0, 3).map(p => ({
      sku: p.sku,
      label: p.name,
      price: p.price,
      brand: p.brand,
    }));
    return buildUnavailable(req, 'out_of_stock', suggestions);
  }

  // Pick best in-stock: brand preference > lowest price
  let best = inStock[0];
  if (req.brand_preference) {
    const branded = inStock.find(p =>
      p.brand.toLowerCase().includes(req.brand_preference.toLowerCase())
    );
    if (branded) best = branded;
  }

  // Calculate quantity to order based on requested qty and pack size
  const qty = calculateQuantity(req, best);

  return {
    status: 'matched',
    cartLine: {
      line_id: req.line_id,
      source: 'original_list',
      requirement: `${req.display_name || req.item} ${req.quantity}${req.unit}`,
      matched_sku: best.sku,
      matched_name: best.name,
      matched_brand: best.brand,
      matched_qty: qty,
      unit_price: best.price,
      line_total: best.price * qty,
      status: 'matched',
      // Alternatives for Manual Mode picker
      alternatives: inStock.slice(0, 3).map(p => ({
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        price: p.price,
      })),
    },
  };
}

function buildUnavailable(req, reason, suggestions) {
  return {
    status: 'unavailable',
    unavailableEntry: {
      line_id: req.line_id,
      requirement: `${req.display_name || req.item} ${req.quantity}${req.unit}`,
      item: req.item,
      reason,
      suggestions,
      status: 'unavailable',
    },
  };
}

function calculateQuantity(req, product) {
  // If requesting 2 litres of milk and pack is 1L, need 2 packs
  try {
    const requested = req.quantity;
    const packSize = product.pack_size;

    if (req.unit === product.unit || product.unit === 'packet' || product.unit === 'piece') {
      return Math.max(1, Math.ceil(requested / packSize));
    }

    // Unit conversion
    const reqInBase = toBaseUnit(requested, req.unit);
    const packInBase = toBaseUnit(packSize, product.unit);

    if (reqInBase && packInBase) {
      return Math.max(1, Math.ceil(reqInBase / packInBase));
    }
  } catch {
    // ignore
  }
  return Math.max(1, req.quantity);
}

function toBaseUnit(qty, unit) {
  // Convert to grams or ml as base
  const conversions = {
    'kg': qty * 1000,
    'gram': qty,
    'litre': qty * 1000,
    'ml': qty,
    'dozen': qty * 12,
    'piece': qty,
    'packet': qty,
  };
  return conversions[unit] || null;
}

/**
 * Resolve an unavailable item: substitute or remove (user-initiated).
 */
export function resolveUnavailable(cartLines, lineId, action, chosenSku) {
  if (action === 'remove') {
    return cartLines.map(line =>
      line.line_id === lineId ? { ...line, status: 'removed_by_user' } : line
    );
  }

  if (action === 'substitute' && chosenSku) {
    const product = CATALOG.find(p => p.sku === chosenSku);
    if (!product) throw new Error(`SKU not found: ${chosenSku}`);

    return cartLines.map(line => {
      if (line.line_id !== lineId) return line;
      return {
        ...line,
        matched_sku: product.sku,
        matched_name: product.name,
        matched_brand: product.brand,
        matched_qty: 1,
        unit_price: product.price,
        line_total: product.price,
        status: 'substituted',
      };
    });
  }

  throw new Error(`Invalid action: ${action}`);
}

/**
 * Get a product from catalog by SKU.
 */
export function getProductBySku(sku) {
  return CATALOG.find(p => p.sku === sku) || null;
}
