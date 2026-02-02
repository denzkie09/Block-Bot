// src/commands/wallet/balance.js
const { EmbedBuilder } = require('discord.js');
const { getProvider, formatBalance, diagnoseError } = require('../../utils/chainUtils');
const { getWallet } = require('../../utils/store');
const { NETWORKS } = require('../../config');

// ─── /wallet balance ────────────────────────────────────────

async function execute(interaction) {
  const wallet = getWallet(interaction.user.id);

  if (!wallet) {
    return interaction.reply({
      content: '❌ No wallet linked. Use `/wallet verify` first to connect your wallet.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(wallet.network);
    const balance = await provider.getBalance(wallet.address);
    const formatted = formatBalance(balance, 18);

    const network = NETWORKS[wallet.network];
    const nativeTicker = wallet.network.toLowerCase().includes('polygon') ? 'MATIC' : 'ETH';

    const embed = new EmbedBuilder()
      .setTitle('💰 Wallet Balance')
      .setColor(0x1e88e5)
      .addFields(
        { name: 'Address', value: `\`${wallet.address}\``, inline: false },
        { name: 'Network', value: network?.name || wallet.network, inline: true },
        { name: 'Balance', value: `**${parseFloat(formatted).toFixed(6)} ${nativeTicker}**`, inline: true }
      )
      .setTimestamp();

    // Add explorer link if available
    if (network?.explorer) {
      embed.setURL(`${network.explorer}/address/${wallet.address}`);
      embed.setFooter({ text: 'Click title to view on explorer' });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey: wallet.network });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({ content: `❌ **Failed to fetch balance.**\n\n${diagText}` });
  }
}

module.exports = { execute };
