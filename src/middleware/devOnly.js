// src/middleware/devOnly.js
// ─────────────────────────────────────────────────────────────
// Middleware guard — wraps a command handler and only lets it
// run if the invoking user has the Dev Mode role.
// Usage:  execute: devOnly(async (interaction) => { ... })
// ─────────────────────────────────────────────────────────────
const { ROLES } = require('../config');

function devOnly(handler) {
  return async function (interaction) {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const hasDevRole = member?.roles.cache.has(ROLES.DEV_MODE);

    if (!hasDevRole) {
      return interaction.reply({
        content: '🔒 **Dev Mode only.** You need the Dev Mode role to use this command.\nAsk a server admin to assign it to you.',
        ephemeral: true,
      });
    }

    return handler(interaction);
  };
}

module.exports = { devOnly };
