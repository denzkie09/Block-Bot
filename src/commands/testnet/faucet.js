// src/commands/testnet/faucet.js
const { EmbedBuilder } = require('discord.js');
const { NETWORKS } = require('../../config');

// ─── /testnet faucet ────────────────────────────────────────

async function execute(interaction) {
  const networkKey = interaction.options.getString('network');
  const network = NETWORKS[networkKey];

  if (!network || !network.isTestnet) {
    return interaction.reply({
      content: '❌ That\'s not a valid testnet. Pick one from the list.',
      ephemeral: true,
    });
  }

  if (!network.faucet) {
    return interaction.reply({
      content: `⚠️ No faucet URL configured for **${network.name}**. Ask a server admin to add one.`,
      ephemeral: true,
    });
  }

  const nativeTicker = networkKey.toLowerCase().includes('polygon') ? 'MATIC' : 'ETH';

  const embed = new EmbedBuilder()
    .setTitle(`🚰 Faucet — ${network.name}`)
    .setColor(0xff9800)
    .setDescription(`Click the link below to request free **${nativeTicker}** on ${network.name}.`)
    .addFields(
      { name: 'Faucet Link', value: network.faucet, inline: false },
      { name: 'Chain ID', value: `\`${network.chainId}\``, inline: true },
      { name: 'Explorer', value: network.explorer || 'N/A', inline: true }
    )
    .setFooter({ text: 'Faucets may have rate limits or require account verification.' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { execute };
