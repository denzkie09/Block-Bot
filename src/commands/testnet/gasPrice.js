// src/commands/testnet/gasPrice.js
const { EmbedBuilder } = require('discord.js');
const { ethers } = require('ethers');
const { getProvider, diagnoseError } = require('../../utils/chainUtils');
const { NETWORKS } = require('../../config');

// ─── /gas price ─────────────────────────────────────────────

async function execute(interaction) {
  const networkKey = interaction.options.getString('network');
  const network = NETWORKS[networkKey];

  if (!network) {
    return interaction.reply({ content: '❌ Unknown network.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);
    const feeData = await provider.getFeeData();

    const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
    const maxFeeGwei = feeData.maxFeePerGas
      ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei')
      : null;
    const maxPriorityGwei = feeData.maxPriorityFeePerGas
      ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
      : null;

    // Estimate cost of a simple transfer (21000 gas)
    const transferCostWei = feeData.gasPrice * 21000n;
    const transferCostEth = ethers.formatUnits(transferCostWei, 18);

    // Color based on gas price: green < 20, yellow < 50, red >= 50 Gwei
    const gwei = parseFloat(gasPriceGwei);
    const color = gwei < 20 ? 0x00c853 : gwei < 50 ? 0xff9800 : 0xf44336;

    const embed = new EmbedBuilder()
      .setTitle(`⛽ Gas Price — ${network.name}`)
      .setColor(color)
      .addFields(
        { name: 'Gas Price', value: `**${parseFloat(gasPriceGwei).toFixed(2)} Gwei**`, inline: true },
        { name: 'Est. Transfer Cost', value: `${parseFloat(transferCostEth).toFixed(8)} ETH`, inline: true },
        { name: 'Network', value: network.name, inline: true }
      )
      .setTimestamp();

    // Add EIP-1559 fields if available
    if (maxFeeGwei && maxPriorityGwei) {
      embed.addFields(
        { name: 'Max Fee (EIP-1559)', value: `${parseFloat(maxFeeGwei).toFixed(2)} Gwei`, inline: true },
        { name: 'Max Priority Fee', value: `${parseFloat(maxPriorityGwei).toFixed(2)} Gwei`, inline: true }
      );
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({ content: `❌ **Failed to fetch gas price.**\n\n${diagText}` });
  }
}

module.exports = { execute };
