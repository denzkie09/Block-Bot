// src/index.js
// ─────────────────────────────────────────────────────────────
// BLOCKCHAIN UTILITY DISCORD BOT — Main Entry Point
//
// 1. npm install
// 2. cp .env.example .env   →  fill in your values
// 3. node src/deploy.js     →  register slash commands (once)
// 4. node src/index.js      →  start the bot
// ─────────────────────────────────────────────────────────────

const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN } = require('./config');
const { route } = require('./commands/router');

// ─── Client Setup ───────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,        // needed for slash commands
    GatewayIntentBits.GuildMembers,  // needed for role management
  ],
});

// ─── Ready ──────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`\n🟢 ${client.user.tag} is online and ready!`);
  console.log(`   Serving ${client.guilds.cache.size} guild(s)\n`);
});

// ─── Slash Command Handler ──────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`[CMD] /${interaction.commandName} ${interaction.options.getSubcommand?.() || ''} — by ${interaction.user.tag}`);
  await route(interaction);
});

// ─── Error Handling ─────────────────────────────────────────
client.on('error', (error) => {
  console.error('[CLIENT ERROR]', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[UNHANDLED REJECTION]', error);
});

// ─── Login ──────────────────────────────────────────────────
client.login(DISCORD_TOKEN);
