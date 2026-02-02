// src/commands/token/contractVerify.js
const { EmbedBuilder } = require('discord.js');
const { isValidAddress, getProvider, diagnoseError } = require('../../utils/chainUtils');
const { NETWORKS } = require('../../config');

// ─── /contract verify ───────────────────────────────────────

async function execute(interaction) {
  const address = interaction.options.getString('address');
  const networkKey = interaction.options.getString('network') || 'mainnet';

  if (!isValidAddress(address)) {
    return interaction.reply({
      content: '❌ Invalid address format. Needs to start with `0x` and be 42 characters.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);
    const code = await provider.getCode(address);
    const network = NETWORKS[networkKey];

    // "0x" means no contract deployed (EOA or empty)
    const isDeployed = code && code !== '0x';
    // Bytecode size: each 2 hex chars = 1 byte, minus the "0x" prefix
    const bytecodeSize = isDeployed ? (code.length - 2) / 2 : 0;

    const embed = new EmbedBuilder()
      .setTitle(isDeployed ? '📦 Contract Deployed ✅' : '❌ No Contract Found')
      .setColor(isDeployed ? 0x00c853 : 0xf44336)
      .addFields(
        { name: 'Address', value: `\`${address}\``, inline: false },
        { name: 'Network', value: network?.name || networkKey, inline: true },
        { name: 'Deployed', value: isDeployed ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

      if (isDeployed) {
        embed.addFields(
          { name: 'Bytecode Size', value: `${bytecodeSize.toLocaleString()} bytes`, inline: true },
          {
            name: 'ABI Availability',
            value: 'Check the block explorer link to see if ABI is verified & available.',
            inline: false,
          }
        );
      } else {
        embed.addFields({
          name: '💡 What this means',
          value:
            'This address is either an EOA (regular wallet), has not been deployed yet, or the contract was self-destructed.',
          inline: false,
        });
      }

    if (network?.explorer) {
      embed.setURL(`${network.explorer}/address/${address}`);
      embed.setFooter({ text: 'Click title to view on explorer' });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({ content: `❌ **Verification failed.**\n\n${diagText}` });
  }
}

module.exports = { execute };
