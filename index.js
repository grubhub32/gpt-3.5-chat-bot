const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

// Replace these with your actual values
const API_KEY = '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';
const CHANNEL_ID = '1379589929474195569';
const TOKEN = 'MTM3OTU5NjYxODQyODMxNzcyNg.GflTLB.S9C4no6Z-Fk3mbAiEl6gq-qwynRF5mVaxAOymI';

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.content.startsWith('!')) return;
  
  let conversationLog = [
    { role: 'system', content: 'You are a friendly chatbot.' },
  ];
  
  try {
    await message.channel.sendTyping();
    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      if (msg.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id == client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
      if (msg.author.id == message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
    });
    
    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });
      
    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(TOKEN);
