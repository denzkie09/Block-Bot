// src/commands/definitions.js
// ─────────────────────────────────────────────────────────────
// All slash command structures defined here in one place.
// These get registered with Discord via the deploy script.
// ─────────────────────────────────────────────────────────────
const { SlashCommandBuilder } = require('discord.js');
const { getNetworkKeys, getTestnetKeys } = require('../utils/chainUtils');

const networkChoices = getNetworkKeys().map((k) => ({
  name: k.charAt(0).toUpperCase() + k.slice(1),
  value: k,
}));

const testnetChoices = getTestnetKeys().map((k) => ({
  name: k.charAt(0).toUpperCase() + k.slice(1),
  value: k,
}));

const commands = [
  // ─── /wallet ──────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('Wallet utility commands')
    .addSubcommand((sub) =>
      sub
        .setName('verify')
        .setDescription('Link & verify your wallet address')
        .addStringOption((opt) =>
          opt.setName('address').setDescription('Your wallet address').setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which network?')
            .setRequired(false)
            .addChoices(...networkChoices)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('balance').setDescription('Show your verified wallet balance')
    )
    .addSubcommand((sub) =>
      sub.setName('network').setDescription('Show your connected chain & RPC info')
    ),

  // ─── /token ───────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('token')
    .setDescription('Token & contract tools')
    .addSubcommand((sub) =>
      sub
        .setName('info')
        .setDescription('Get token info from a contract address')
        .addStringOption((opt) =>
          opt.setName('address').setDescription('Token contract address').setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which network?')
            .setRequired(false)
            .addChoices(...networkChoices)
        )
    ),

  // ─── /contract ────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('contract')
    .setDescription('Contract verification tools')
    .addSubcommand((sub) =>
      sub
        .setName('verify')
        .setDescription('Check if a contract is deployed & get details')
        .addStringOption((opt) =>
          opt.setName('address').setDescription('Contract address').setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which network?')
            .setRequired(false)
            .addChoices(...networkChoices)
        )
    ),

  // ─── /testnet ─────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('testnet')
    .setDescription('Testnet helper commands')
    .addSubcommand((sub) =>
      sub
        .setName('faucet')
        .setDescription('Get faucet links for a testnet')
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which testnet?')
            .setRequired(true)
            .addChoices(...testnetChoices)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('status')
        .setDescription('Check if a testnet RPC is alive')
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which testnet?')
            .setRequired(true)
            .addChoices(...testnetChoices)
        )
    ),

  // ─── /rpc ─────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('rpc')
    .setDescription('RPC health check (Dev Mode)')
    .addSubcommand((sub) =>
      sub
        .setName('status')
        .setDescription('Check latency & block number of an RPC')
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which network?')
            .setRequired(true)
            .addChoices(...networkChoices)
        )
    ),

  // ─── /gas ─────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('gas')
    .setDescription('Gas price tools')
    .addSubcommand((sub) =>
      sub
        .setName('price')
        .setDescription('Get current gas price on a network')
        .addStringOption((opt) =>
          opt
            .setName('network')
            .setDescription('Which network?')
            .setRequired(true)
            .addChoices(...networkChoices)
        )
    ),
];

module.exports = { commands };
