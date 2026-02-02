// src/commands/testnet/status.js
const { EmbedBuilder } = require('discord.js');
const { getProvider, diagnoseError } = require('../../utils/chainUtils');
const { NETWORKS } = require('../../config');

// ─── /testnet status ────────────────────────────────────────

async function execute(interaction) {
  const networkKey = interaction.options.getString('network');
  const network = NETWORKS[networkKey];

  if (!network || !network.isTestnet) {
    return interaction.reply({
      content: '❌ Not a valid testnet key.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);
    const start = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const latency = Date.now() - start;

    const isHealthy = latency < 3000; // under 3s = healthy

    const embed = new EmbedBuilder()
      .setTitle(`${isHealthy ? '🟢' : '🟡'} ${network.name} — Status`)
      .setColor(isHealthy ? 0x00c853 : 0xff9800)
      .addFields(
        { name: 'Status', value: isHealthy ? 'Healthy ✅' : 'Slow / Degraded ⚠️', inline: true },
        { name: 'Latency', value: `${latency} ms`, inline: true },
        { name: 'Latest Block', value: `#${blockNumber.toLocaleString()}`, inline: true },
        { name: 'Chain ID', value: `\`${network.chainId}\``, inline: true },
        { name: 'Explorer', value: network.explorer || 'N/A', inline: true }
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({
      content: `🔴 **${network.name} is unreachable.**\n\n${diagText}`,
    });
  }
}

module.exports = { execute };
