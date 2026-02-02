// src/utils/store.js
// ─────────────────────────────────────────────────────────────
// Simple in-memory store for verified wallets.
// Maps Discord User ID → { address, network, verifiedAt }
//
// 💡 FOR PRODUCTION: Replace this with a persistent database.
//    Options: SQLite (better-sqlite3), MongoDB, or PostgreSQL.
// ─────────────────────────────────────────────────────────────

const wallets = new Map();

function saveWallet(userId, data) {
  wallets.set(userId, {
    address: data.address,
    network: data.network || 'mainnet',
    verifiedAt: Date.now(),
  });
}

function getWallet(userId) {
  return wallets.get(userId) || null;
}

function removeWallet(userId) {
  return wallets.delete(userId);
}

function getAllWallets() {
  return Object.fromEntries(wallets);
}

module.exports = { saveWallet, getWallet, removeWallet, getAllWallets };
