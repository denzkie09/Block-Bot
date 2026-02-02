// src/commands/router.js
// ─────────────────────────────────────────────────────────────
// Central command router.
// Maps [commandName][subcommandName] → handler module.
// The main bot file calls router.route(interaction) and this
// figures out which handler to run.
// ─────────────────────────────────────────────────────────────

const walletVerify   = require('./wallet/verify');
const walletBalance  = require('./wallet/balance');
const walletNetwork  = require('./wallet/network');
const tokenInfo      = require('./token/info');
const contractVerify = require('./token/contractVerify');
const testnetFaucet  = require('./testnet/faucet');
const testnetStatus  = require('./testnet/status');
const rpcStatus      = require('./testnet/rpcStatus');
const gasPrice       = require('./testnet/gasPrice');

const ROUTES = {
  wallet: {
    verify:  walletVerify,
    balance: walletBalance,
    network: walletNetwork,
  },
  token: {
    info: tokenInfo,
  },
  contract: {
    verify: contractVerify,
  },
  testnet: {
    faucet: testnetFaucet,
    status: testnetStatus,
  },
  rpc: {
    status: rpcStatus,
  },
  gas: {
    price: gasPrice,
  },
};

async function route(interaction) {
  const commandName = interaction.commandName;
  const subcommand  = interaction.options.getSubcommand?.();

  const commandGroup = ROUTES[commandName];
  if (!commandGroup) {
    return interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
  }

  const handler = commandGroup[subcommand];
  if (!handler) {
    return interaction.reply({ content: '❌ Unknown subcommand.', ephemeral: true });
  }

  try {
    await handler.execute(interaction);
  } catch (error) {
    console.error(`[ERROR] /${commandName} ${subcommand}:`, error);

    // If interaction hasn't been replied to yet, send a safe error
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '🔴 Something went wrong. Check the console for details.', ephemeral: true });
    } else if (interaction.deferred) {
      await interaction.editReply({ content: '🔴 Something went wrong. Check the console for details.' });
    }
  }
}

module.exports = { route };
