// src/commands/wallet/verify.js
const { EmbedBuilder } = require('discord.js');
const { isValidAddress, getProvider, diagnoseError } = require('../../utils/chainUtils');
const { saveWallet } = require('../../utils/store');
const { ROLES } = require('../../config');

// ─── /wallet verify ─────────────────────────────────────────
// In a full production bot you would generate a unique nonce,
// ask the user to sign it off-chain (e.g. via a small web page
// using ethers.js or wagmi), then verify the signature here.
//
// This MVP version does a simplified flow:
//  1. Validates the address format.
//  2. Checks the address exists on-chain (has balance or nonce > 0).
//  3. Stores the mapping and assigns the Verified role.
//
// 💡 To add real signature verification later, see the comment
//    block at the bottom of this file.
// ─────────────────────────────────────────────────────────────

async function execute(interaction) {
  const address = interaction.options.getString('address');
  const networkKey = interaction.options.getString('network') || 'mainnet';

  // Validate address format
  if (!isValidAddress(address)) {
    return interaction.reply({
      content: '❌ That\'s not a valid Ethereum address. Make sure it starts with `0x` and is 42 characters long.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const provider = getProvider(networkKey);
    const nonce = await provider.getTransactionCount(address);
    const balance = await provider.getBalance(address);

    // Check that the address is "active" (has nonce or balance)
    if (nonce === 0 && balance === 0n) {
      return interaction.editReply(
        '⚠️ That address has no activity on this network. ' +
        'It might be a fresh wallet — you can still verify it, but note it shows zero history.'
      );
    }

    // Save to store
    saveWallet(interaction.user.id, { address, network: networkKey });

    // Assign Verified role
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (member && ROLES.VERIFIED) {
      await member.roles.add(ROLES.VERIFIED).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Wallet Verified')
      .setColor(0x00c853)
      .addFields(
        { name: 'Discord User', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Wallet Address', value: `\`${address}\``, inline: false },
        { name: 'Network', value: networkKey, inline: true },
        { name: 'On-Chain Nonce', value: `${nonce}`, inline: true }
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const diagnoses = diagnoseError(error, { networkKey });
    const diagText = diagnoses
      .map((d) => `${d.issue}\n> ${d.detail}\n> 🔧 ${d.fix}`)
      .join('\n\n');

    return interaction.editReply({
      content: `❌ **Verification failed.**\n\n${diagText}`,
    });
  }
}

module.exports = { execute };

// ─── UPGRADING TO FULL SIGNATURE VERIFICATION ───────────────
// To implement real wallet ownership proof:
//
// 1. Generate a unique nonce per user and store it temporarily.
// 2. Send the user a link to a small hosted page (or use a
//    Discord modal) that asks them to sign the message:
//      "Verify wallet for Discord user [userId] — nonce: [nonce]"
//    using their wallet (MetaMask, WalletConnect, etc.).
// 3. The user pastes the signed signature back into Discord.
// 4. Here, use ethers.js verifyMessage() to recover the signer:
//      const recovered = ethers.verifyMessage(message, signature);
// 5. If recovered === address, verification is proven.
//
// Libraries that make step 2 easy:
//   - wagmi + viem (React)
//   - web3modal
//   - ethers.js BrowserProvider (vanilla JS)
