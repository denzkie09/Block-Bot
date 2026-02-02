// src/deploy.js
// ─────────────────────────────────────────────────────────────
// Run this ONCE to register slash commands with Discord.
// Re-run whenever you add or change commands.
//
//   node src/deploy.js
// ─────────────────────────────────────────────────────────────
const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = require('./config');
const { commands } = require('./commands/definitions');

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`📤 Deploying ${commands.length} slash command(s)...`);

    const data = await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ Successfully registered ${data.length} command(s):`);
    data.forEach((cmd) => console.log(`   • /${cmd.name}`));
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  }
})();
