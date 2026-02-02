// src/utils/chainUtils.js
const { ethers } = require('ethers');
const { NETWORKS } = require('../config');

// ─── Provider Factory ───────────────────────────────────────
// Returns a cached ethers JsonRpcProvider for a given network key.
const providerCache = {};

function getProvider(networkKey) {
  if (providerCache[networkKey]) return providerCache[networkKey];

  const network = NETWORKS[networkKey];
  if (!network || !network.rpc) {
    throw new Error(`Unknown or unconfigured network: ${networkKey}`);
  }

  providerCache[networkKey] = new ethers.JsonRpcProvider(network.rpc);
  return providerCache[networkKey];
}

// ─── Address Validation ─────────────────────────────────────
function isValidAddress(address) {
  return ethers.isAddress(address);
}

// ─── Format Ether ───────────────────────────────────────────
function formatBalance(balanceBigInt, decimals = 18) {
  return ethers.formatUnits(balanceBigInt, decimals);
}

// ─── Network Lookup Helpers ─────────────────────────────────
function getNetworkByKey(key) {
  return NETWORKS[key.toLowerCase()] || null;
}

function getNetworkKeys() {
  return Object.keys(NETWORKS);
}

function getTestnetKeys() {
  return Object.keys(NETWORKS).filter((k) => NETWORKS[k].isTestnet);
}

// ─── Smart Error Diagnosis ──────────────────────────────────
// Takes a raw error and returns a human-readable diagnosis object.
function diagnoseError(error, context = {}) {
  const msg = (error.message || '').toLowerCase();
  const diagnoses = [];

  // Wrong network / chain ID mismatch
  if (msg.includes('chain') || msg.includes('network') || msg.includes('chainid')) {
    diagnoses.push({
      issue: '🔗 Wrong Network',
      detail: 'The transaction was sent to the wrong chain. Double-check your MetaMask network or RPC endpoint.',
      fix: context.expectedNetwork
        ? `Expected network: ${context.expectedNetwork}`
        : 'Verify your wallet is connected to the correct chain.',
    });
  }

  // Insufficient gas / funds
  if (msg.includes('insufficient') || msg.includes('underpriced') || msg.includes('balance')) {
    diagnoses.push({
      issue: '⛽ Insufficient Funds / Gas',
      detail: 'Your wallet does not have enough funds to cover gas fees.',
      fix: context.networkKey && NETWORKS[context.networkKey]?.faucet
        ? `Get testnet tokens here: ${NETWORKS[context.networkKey].faucet}`
        : 'Fund your wallet or request tokens from a faucet.',
    });
  }

  // Contract not deployed
  if (msg.includes('not deployed') || msg.includes('no code') || msg.includes('execution reverted')) {
    diagnoses.push({
      issue: '📦 Contract Not Deployed',
      detail: 'The contract address has no deployed code on this network.',
      fix: 'Ensure the contract is deployed to the correct chain and the address is accurate.',
    });
  }

  // Missing approval
  if (msg.includes('allowance') || msg.includes('approval') || msg.includes('not approved')) {
    diagnoses.push({
      issue: '✅ Missing Approval',
      detail: 'The contract is not approved to spend your tokens.',
      fix: 'Call the token\'s approve() function before interacting with the contract.',
    });
  }

  // RPC / connection issues
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('connect') || msg.includes('request failed')) {
    diagnoses.push({
      issue: '📡 RPC Connection Failed',
      detail: 'Could not reach the RPC endpoint.',
      fix: 'The RPC may be down or rate-limited. Try a different endpoint or provider.',
    });
  }

  // Nonce issues
  if (msg.includes('nonce') || msg.includes('replacement')) {
    diagnoses.push({
      issue: '🔢 Nonce Mismatch',
      detail: 'A pending transaction is blocking this one.',
      fix: 'Wait for pending transactions to confirm, or cancel them in your wallet.',
    });
  }

  // Fallback
  if (diagnoses.length === 0) {
    diagnoses.push({
      issue: '❓ Unknown Error',
      detail: error.message || 'An unrecognized error occurred.',
      fix: 'Check the console for full error details or report it.',
    });
  }

  return diagnoses;
}

module.exports = {
  getProvider,
  isValidAddress,
  formatBalance,
  getNetworkByKey,
  getNetworkKeys,
  getTestnetKeys,
  diagnoseError,
};
