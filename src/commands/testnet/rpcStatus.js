// src/commands/testnet/rpcStatus.js
const { EmbedBuilder } = require('discord.js');
const { getProvider, diagnoseError } = require('../../utils/chainUtils');
const { NETWORKS } = require('../../config');
const { devOnly } = require('../../middleware/devOnly');

// ─── /rpc status (Dev Mode only) ────────────────────────────

async function execute(interaction) {
  const networkKey = interaction.options.getString('network');
  const network = NETWORKS[networkKey];

  if (!network) {
    return interaction.reply({ content: '❌ Unknown network.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);

    const start = Date.now();
    const [blockNumber, networkInfo] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
    ]);
    const latency = Date.now() - start;

    const embed = new EmbedBuilder()
      .setTitle(`🛠️ RPC Health — ${network.name}`)
      .setColor(0x7c4dff)
      .addFields(
        { name: 'Status', value: '🟢 Reachable', inline: true },
        { name: 'Latency', value: `${latency} ms`, inline: true },
        { name: 'Latest Block', value: `#${blockNumber.toLocaleString()}`, inline: true },
        { name: 'Chain ID (reported)', value: `\`${networkInfo.chainId}\``, inline: true },
        { name: 'Chain ID (expected)', value: `\`${network.chainId}\``, inline: true },
        {
          name: 'Chain ID Match',
          value: Number(networkInfo.chainId) === network.chainId ? '✅ Yes' : '❌ Mismatch!',
          inline: true,
        },
        { name: 'RPC URL', value: `\`${network.rpc}\``, inline: false }
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({
      content: `🔴 **RPC Unreachable — ${network.name}**\n\n${diagText}`,
    });
  }
}

// Wrap with Dev Mode guard
module.exports = { execute: devOnly(execute) };
