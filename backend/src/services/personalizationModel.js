/**
 * Personalization Model Module
 * Manages customer preference vectors, shopping history, and brand affinities.
 */

import { getCustomerPreferences, updateCustomerPreferences } from '../db/index.js';

/**
 * Get customer profile with learned preferences
 * @param {string} customerId
 * @returns {Promise<Object>}
 */
export async function getCustomerProfile(customerId = 'default') {
  const profile = await getCustomerPreferences(customerId);
  return {
    customer_id: customerId,
    preferred_brands: profile.preferred_brands || {},
    price_sensitivity: profile.price_sensitivity ?? 0.65,
    discount_preference: profile.discount_preference ?? 0.80,
    premium_preference: profile.premium_preference ?? 0.30,
    frequently_bought: ['Milk', 'Eggs', 'Potatoes', 'Bread', 'Atta'],
    typical_basket_range: '₹800 – ₹1,600',
    updated_at: profile.updated_at,
  };
}

/**
 * Update customer profile after user interactions
 */
export async function updateCustomerProfile(customerId, { brand, category, isPremium, isDiscounted }) {
  const profile = await getCustomerPreferences(customerId);
  const preferredBrands = { ...(profile.preferred_brands || {}) };

  if (brand && category) {
    const list = preferredBrands[category] || [];
    if (!list.includes(brand)) {
      preferredBrands[category] = [brand, ...list].slice(0, 5);
    }
  }

  let premiumPref = profile.premium_preference ?? 0.30;
  if (isPremium) {
    premiumPref = Math.min(1.0, premiumPref + 0.05);
  }

  let discountPref = profile.discount_preference ?? 0.80;
  if (isDiscounted) {
    discountPref = Math.min(1.0, discountPref + 0.03);
  }

  return updateCustomerPreferences(customerId, {
    preferred_brands: preferredBrands,
    premium_preference: premiumPref,
    discount_preference: discountPref,
  });
}

export default { getCustomerProfile, updateCustomerProfile };
