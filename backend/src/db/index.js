/**
 * Database Layer for ReviveAI
 * Supports PostgreSQL with fallback in-memory store if DATABASE_URL is not set.
 * 
 * Tables:
 * 1. users (id, phone, phone_verified, name, email, created_at, updated_at)
 * 2. user_profiles (id, user_id, name, email, phone, created_at, updated_at)
 * 3. addresses (id, user_id, address_type, house, street, area, landmark, city, state, pincode, latitude, longitude, is_default, created_at)
 * 4. shopping_lists (id, user_id, raw_text, image_url, status, total_items, matched_items, created_at)
 * 5. shopping_list_items (id, list_id, raw_text, normalized_name, category, quantity, unit, confidence, matched_sku, created_at)
 * 6. recommendation_feedback (id, customer_id, recommendation_id, product_id, action, reward, timestamp)
 * 7. customer_preferences (customer_id, preferred_brands, price_sensitivity, discount_preference, premium_preference, updated_at)
 * 8. ai_events (id, event_type, details, created_at)
 */

import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

const { Pool } = pg;
let pool = null;
let isPgConnected = false;

// Fallback in-memory persistent stores
const memoryUsers = new Map();
const memoryProfiles = new Map();
const memoryAddresses = new Map();
const memoryShoppingLists = new Map();
const memoryShoppingListItems = new Map();
const memoryRecommendationFeedback = [];
const memoryCustomerPreferences = new Map();
const memoryAiEvents = [];

/**
 * Initialize PostgreSQL Schema
 */
export async function initDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({ connectionString, max: 10 });
      const client = await pool.connect();

      // 1. Users
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          phone VARCHAR(20) UNIQUE NOT NULL,
          phone_verified BOOLEAN DEFAULT TRUE,
          name VARCHAR(120),
          email VARCHAR(160),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. User Profiles
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(120),
          email VARCHAR(160),
          phone VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Addresses
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          address_type VARCHAR(30) DEFAULT 'Home',
          house VARCHAR(120),
          street VARCHAR(160),
          area VARCHAR(120),
          landmark VARCHAR(120),
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(20),
          latitude NUMERIC,
          longitude NUMERIC,
          is_default BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Shopping Lists
      await client.query(`
        CREATE TABLE IF NOT EXISTS shopping_lists (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          raw_text TEXT,
          image_url TEXT,
          status VARCHAR(40) DEFAULT 'processed',
          total_items INT DEFAULT 0,
          matched_items INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 5. Shopping List Items
      await client.query(`
        CREATE TABLE IF NOT EXISTS shopping_list_items (
          id VARCHAR(64) PRIMARY KEY,
          list_id VARCHAR(64) REFERENCES shopping_lists(id) ON DELETE CASCADE,
          raw_text TEXT,
          normalized_name VARCHAR(160),
          category VARCHAR(80),
          quantity NUMERIC DEFAULT 1,
          unit VARCHAR(40),
          confidence NUMERIC DEFAULT 1.0,
          matched_sku VARCHAR(120),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 6. Recommendation Feedback
      await client.query(`
        CREATE TABLE IF NOT EXISTS recommendation_feedback (
          id VARCHAR(64) PRIMARY KEY,
          customer_id VARCHAR(64),
          recommendation_id VARCHAR(64),
          product_id VARCHAR(120),
          action VARCHAR(40) NOT NULL,
          reward NUMERIC NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Customer Preferences
      await client.query(`
        CREATE TABLE IF NOT EXISTS customer_preferences (
          customer_id VARCHAR(64) PRIMARY KEY,
          preferred_brands JSONB DEFAULT '{}'::jsonb,
          price_sensitivity NUMERIC DEFAULT 0.5,
          discount_preference NUMERIC DEFAULT 0.5,
          premium_preference NUMERIC DEFAULT 0.3,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 8. AI Events
      await client.query(`
        CREATE TABLE IF NOT EXISTS ai_events (
          id VARCHAR(64) PRIMARY KEY,
          event_type VARCHAR(80) NOT NULL,
          details JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      isPgConnected = true;
      console.log('📦 PostgreSQL tables initialized successfully for Auth & AI Agent.');
    } catch (err) {
      console.warn(`⚠️ PostgreSQL connection failed (${err.message}). Using in-memory fallback store.`);
      isPgConnected = false;
    }
  } else {
    console.log('ℹ️ No DATABASE_URL provided. Using memory store (PostgreSQL compatible).');
  }
}

// ─── USER HELPERS ─────────────────────────────────────────────────────────────

export async function findUserByPhone(phone) {
  if (isPgConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    return res.rows[0] || null;
  }
  for (const user of memoryUsers.values()) {
    if (user.phone === phone) return user;
  }
  return null;
}

export async function findUserById(id) {
  if (isPgConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }
  return memoryUsers.get(id) || null;
}

export async function createUser(phone, name = '', email = '') {
  const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const profileId = `prf_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();

  if (isPgConnected && pool) {
    const userRes = await pool.query(
      `INSERT INTO users (id, phone, phone_verified, name, email, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [userId, phone, true, name || null, email || null]
    );

    await pool.query(
      `INSERT INTO user_profiles (id, user_id, name, email, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [profileId, userId, name || null, email || null, phone]
    );

    return userRes.rows[0];
  }

  const newUser = {
    id: userId,
    phone,
    phone_verified: true,
    name: name || '',
    email: email || '',
    created_at: now,
    updated_at: now,
  };

  const newProfile = {
    id: profileId,
    user_id: userId,
    name: name || '',
    email: email || '',
    phone,
    created_at: now,
    updated_at: now,
  };

  memoryUsers.set(userId, newUser);
  memoryProfiles.set(userId, newProfile);
  return newUser;
}

export async function updateUserProfile(userId, { name, email }) {
  if (isPgConnected && pool) {
    await pool.query(
      `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3`,
      [name, email, userId]
    );
    await pool.query(
      `UPDATE user_profiles SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE user_id = $3`,
      [name, email, userId]
    );
    return findUserById(userId);
  }

  const user = memoryUsers.get(userId);
  if (user) {
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    user.updated_at = new Date().toISOString();
  }

  const profile = memoryProfiles.get(userId);
  if (profile) {
    if (name !== undefined) profile.name = name;
    if (email !== undefined) profile.email = email;
    profile.updated_at = new Date().toISOString();
  }

  return user;
}

// ─── ADDRESS HELPERS ──────────────────────────────────────────────────────────

export async function getUserAddresses(userId) {
  if (isPgConnected && pool) {
    const res = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]);
    return res.rows;
  }
  const userAddresses = [];
  for (const addr of memoryAddresses.values()) {
    if (addr.user_id === userId) userAddresses.push(addr);
  }
  return userAddresses;
}

export async function addAddress(userId, addressData) {
  const addressId = `addr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const {
    address_type = 'Home',
    house = '',
    street = '',
    area = '',
    landmark = '',
    city = 'Bengaluru',
    state = 'Karnataka',
    pincode = '560001',
    latitude = 12.9716,
    longitude = 77.5946,
    is_default = true,
  } = addressData;

  if (isPgConnected && pool) {
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }
    const res = await pool.query(
      `INSERT INTO addresses 
       (id, user_id, address_type, house, street, area, landmark, city, state, pincode, latitude, longitude, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) RETURNING *`,
      [addressId, userId, address_type, house, street, area, landmark, city, state, pincode, latitude, longitude, is_default]
    );
    return res.rows[0];
  }

  if (is_default) {
    for (const addr of memoryAddresses.values()) {
      if (addr.user_id === userId) addr.is_default = false;
    }
  }

  const newAddr = {
    id: addressId,
    user_id: userId,
    address_type,
    house,
    street,
    area,
    landmark,
    city,
    state,
    pincode,
    latitude,
    longitude,
    is_default,
    created_at: new Date().toISOString(),
  };

  memoryAddresses.set(addressId, newAddr);
  return newAddr;
}

export async function updateAddress(userId, addressId, addressData) {
  if (isPgConnected && pool) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(addressData)) {
      if (['address_type', 'house', 'street', 'area', 'landmark', 'city', 'state', 'pincode', 'latitude', 'longitude', 'is_default'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }
    values.push(addressId, userId);
    const query = `UPDATE addresses SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx++} RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  const addr = memoryAddresses.get(addressId);
  if (addr && addr.user_id === userId) {
    Object.assign(addr, addressData);
    return addr;
  }
  return null;
}

export async function deleteAddress(userId, addressId) {
  if (isPgConnected && pool) {
    await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);
    return true;
  }
  const addr = memoryAddresses.get(addressId);
  if (addr && addr.user_id === userId) {
    memoryAddresses.delete(addressId);
    return true;
  }
  return false;
}

// ─── AI AGENT & REINFORCEMENT LEARNING HELPERS ─────────────────────────────────

export async function saveShoppingList({ userId, rawText, imageUrl, totalItems, matchedItems, items }) {
  const listId = `list_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();

  if (isPgConnected && pool) {
    await pool.query(
      `INSERT INTO shopping_lists (id, user_id, raw_text, image_url, status, total_items, matched_items, created_at)
       VALUES ($1, $2, $3, $4, 'processed', $5, $6, NOW())`,
      [listId, userId || null, rawText, imageUrl || null, totalItems, matchedItems]
    );

    for (const item of items) {
      const itemId = `item_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      await pool.query(
        `INSERT INTO shopping_list_items (id, list_id, raw_text, normalized_name, category, quantity, unit, confidence, matched_sku, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [itemId, listId, item.raw_text, item.normalized_name, item.category, item.quantity || 1, item.unit || 'unspecified', item.confidence || 1.0, item.matched_sku || null]
      );
    }

    return listId;
  }

  const listObj = {
    id: listId,
    user_id: userId || null,
    raw_text: rawText,
    image_url: imageUrl || null,
    total_items: totalItems,
    matched_items: matchedItems,
    items,
    created_at: now,
  };
  memoryShoppingLists.set(listId, listObj);
  return listId;
}

export async function recordRecommendationFeedback({ customerId, recommendationId, productId, action, reward }) {
  const feedbackId = `fb_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();

  if (isPgConnected && pool) {
    await pool.query(
      `INSERT INTO recommendation_feedback (id, customer_id, recommendation_id, product_id, action, reward, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [feedbackId, customerId || 'guest', recommendationId, productId, action, reward]
    );
    return feedbackId;
  }

  const record = {
    id: feedbackId,
    customer_id: customerId || 'guest',
    recommendation_id: recommendationId,
    product_id: productId,
    action,
    reward,
    timestamp: now,
  };
  memoryRecommendationFeedback.push(record);
  return feedbackId;
}

export async function getCustomerPreferences(customerId) {
  const cid = customerId || 'default';
  if (isPgConnected && pool) {
    const res = await pool.query('SELECT * FROM customer_preferences WHERE customer_id = $1 LIMIT 1', [cid]);
    if (res.rows[0]) return res.rows[0];
  }

  const existing = memoryCustomerPreferences.get(cid);
  if (existing) return existing;

  const defaultProfile = {
    customer_id: cid,
    preferred_brands: {
      milk: ['Amul'],
      rice: ['India Gate', 'Fortune'],
      bread: ['Modern'],
      oil: ['Fortune'],
    },
    price_sensitivity: 0.65,
    discount_preference: 0.80,
    premium_preference: 0.30,
    category_counts: { dairy: 12, vegetables: 15, staples: 8, snacks: 6 },
    updated_at: new Date().toISOString(),
  };
  memoryCustomerPreferences.set(cid, defaultProfile);
  return defaultProfile;
}

export async function updateCustomerPreferences(customerId, updates) {
  const cid = customerId || 'default';
  const current = await getCustomerPreferences(cid);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };

  if (isPgConnected && pool) {
    await pool.query(
      `INSERT INTO customer_preferences (customer_id, preferred_brands, price_sensitivity, discount_preference, premium_preference, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (customer_id) DO UPDATE SET
       preferred_brands = EXCLUDED.preferred_brands,
       price_sensitivity = EXCLUDED.price_sensitivity,
       discount_preference = EXCLUDED.discount_preference,
       premium_preference = EXCLUDED.premium_preference,
       updated_at = NOW()`,
      [cid, JSON.stringify(updated.preferred_brands), updated.price_sensitivity, updated.discount_preference, updated.premium_preference]
    );
  }

  memoryCustomerPreferences.set(cid, updated);
  return updated;
}

export async function getRecommendationFeedbackHistory(customerId) {
  if (isPgConnected && pool) {
    const res = await pool.query('SELECT * FROM recommendation_feedback WHERE customer_id = $1 OR customer_id = \'guest\' ORDER BY timestamp DESC LIMIT 200', [customerId || 'guest']);
    return res.rows;
  }
  return memoryRecommendationFeedback;
}
