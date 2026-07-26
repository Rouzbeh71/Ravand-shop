const TelegramBot = require('node-telegram-bot-api');

const token = '8959796183:AAGePA-11JEJLNAnmY_GVrPuOt4FEX-lqvc';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'سلام روزبه! 👋\nبه فروشگاه Ravand خوش اومدی.\nربات با موفقیت ساخته شد! 🎉');
});

bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '✅ ربات کار می‌کنه!');
});

bot.on('message', (msg) => {
  if (msg.text === 'سلام') {
    bot.sendMessage(msg.chat.id, 'علیک سلام! 😊 چطور میتونم کمکت کنم؟');
  }
});

console.log('🤖 ربات Ravand فعال شد!');
