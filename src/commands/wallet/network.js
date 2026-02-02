// src/commands/wallet/network.js
const { EmbedBuilder } = require('discord.js');
const { getWallet } = require('../../utils/store');
const { NETWORKS } = require('../../config');

// ─── /wallet network ────────────────────────────────────────

async function execute(interaction) {
  const wallet = getWallet(interaction.user.id);

  if (!wallet) {
    return interaction.reply({
      content: '❌ No wallet linked. Use `/wallet verify` first.',
      ephemeral: true,
    });
  }

  const network = NETWORKS[wallet.network];

  if (!network) {
    return interaction.reply({
      content: '⚠️ Your wallet is linked to an unknown network. Re-verify with `/wallet verify`.',
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🔗 Connected Network')
    .setColor(network.isTestnet ? 0xff9800 : 0x4caf50)
    .addFields(
      { name: 'Network Name', value: network.name, inline: true },
      { name: 'Chain ID', value: `\`${network.chainId}\``, inline: true },
      { name: 'Type', value: network.isTestnet ? '🧪 Testnet' : '✅ Mainnet', inline: true },
      { name: 'RPC Endpoint', value: `\`${network.rpc || 'Not configured'}\``, inline: false },
      { name: 'Explorer', value: network.explorer || 'N/A', inline: true }
    )
    .setTimestamp();

  if (network.isTestnet && network.faucet) {
    embed.addFields({ name: '🚰 Faucet', value: network.faucet, inline: true });
  }

  return interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { execute };
