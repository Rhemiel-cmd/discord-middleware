require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// --- EXPRESS SETUP ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('clientReady', () => {
    console.log(`✅ Middleware bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const TARGET_CHANNEL_ID = '1234567890123456789'; // <- Palitan ng Channel ID mo
  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  if (!message.mentions.has(client.user.id)) return;

  try {
    await message.channel.sendTyping();

    // 🧹 LINISIN ANG MENTION TAG MULA SA MESSAGE CONTENT
    // Inaalis nito ang "<@1234567890>" para malinis na text lang ang mapunta kay Gemini
    let cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();

    // Kung nag-mention lang ang user at walang nilagay na tanong/text, bigyan ng default prompt
    if (!cleanContent) {
      cleanContent = 'Hello!';
    }

    console.log(`📩 Valid mention received from ${message.author.username}: "${cleanContent}"`);

    await axios.post(process.env.N8N_WEBHOOK_URL, {
      content: cleanContent, // <- Gagamitin na ang malinis na content
      author: {
        id: message.author.id,
        username: message.author.username,
        bot: message.author.bot
      },
      channelId: message.channel.id,
      guildId: message.guildId
    });

    console.log('🚀 Successfully forwarded to n8n!');
  } catch (error) {
    console.error('❌ Error sending data to n8n Webhook:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);

// --- HEALTH CHECK ROUTE FOR CRON-JOB / RENDER ---
app.get('/', (req, res) => {
  res.status(200).send('Middleware Bot is Active and Running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Web server listening on port ${PORT}`);
});