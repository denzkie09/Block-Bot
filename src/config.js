// src/config.js
require('dotenv').config();

const NETWORKS = {
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpc: process.env.ETH_MAINNET_RPC,
    explorer: 'https://etherscan.io',
    isTestnet: false,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: process.env.ETH_SEPOLIA_RPC,
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
    faucet: process.env.SEPOLIA_FAUCET_URL,
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpc: process.env.ETH_GOERLI_RPC,
    explorer: 'https://goerli.etherscan.io',
    isTestnet: true,
    faucet: 'https://faucet.quicknode.com/ethereum/goerli',
  },
  polygonAmoy: {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    rpc: process.env.POLYGON_AMOY_RPC,
    explorer: 'https://amoy.polygonscan.com',
    isTestnet: true,
    faucet: process.env.POLYGON_AMOY_FAUCET_URL,
  },
  baseSepolia: {
    name: 'Base Sepolia Testnet',
    chainId: 84532,
    rpc: process.env.BASE_SEPOLIA_RPC,
    explorer: 'https://sepolia.basescan.org',
    isTestnet: true,
    faucet: process.env.BASE_SEPOLIA_FAUCET_URL,
  },
};

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  NETWORKS,
  ROLES: {
    VERIFIED: process.env.VERIFIED_ROLE_ID,
    DEV_MODE: process.env.DEV_MODE_ROLE_ID,
  },
};
