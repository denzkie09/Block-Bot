// src/commands/token/info.js
const { EmbedBuilder } = require('discord.js');
const { ethers } = require('ethers');
const { isValidAddress, getProvider, diagnoseError } = require('../../utils/chainUtils');
const { NETWORKS } = require('../../config');

// ─── ERC-20 ABI (minimal — only what we need) ──────────────
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

// ─── /token info ────────────────────────────────────────────

async function execute(interaction) {
  const address = interaction.options.getString('address');
  const networkKey = interaction.options.getString('network') || 'mainnet';

  if (!isValidAddress(address)) {
    return interaction.reply({
      content: '❌ Invalid contract address. It should start with `0x` and be 42 characters.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    // Fetch all token data in parallel for speed
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    const formattedSupply = ethers.formatUnits(totalSupply, decimals);
    const network = NETWORKS[networkKey];

    const embed = new EmbedBuilder()
      .setTitle(`🪙 Token Info — ${symbol}`)
      .setColor(0x7c4dff)
      .addFields(
        { name: 'Name', value: name, inline: true },
        { name: 'Symbol', value: symbol, inline: true },
        { name: 'Decimals', value: `${decimals}`, inline: true },
        { name: 'Total Supply', value: `${Number(formattedSupply).toLocaleString()} ${symbol}`, inline: false },
        { name: 'Contract Address', value: `\`${address}\``, inline: false },
        { name: 'Network', value: network?.name || networkKey, inline: true }
      )
      .setTimestamp();

    if (network?.explorer) {
      embed.setURL(`${network.explorer}/token/${address}`);
      embed.setFooter({ text: 'Click title to view on explorer' });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({
      content: `❌ **Failed to fetch token info.**\nThis might not be an ERC-20 contract, or it may not be deployed on this network.\n\n${diagText}`,
    });
  }
}

module.exports = { execute };
