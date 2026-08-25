require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

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
    // 1. Iwas infinite loop: Huwag pansinin kapag bot ang nag-send
    if (message.author.bot) return;

    try {
        console.log(`📩 Message received from ${message.author.username}: "${message.content}"`);

        // 2. I-forward ang data papunta sa n8n Webhook
        await axios.post(process.env.N8N_WEBHOOK_URL, {
            content: message.content,
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