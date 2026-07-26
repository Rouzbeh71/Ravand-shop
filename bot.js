
const TelegramBot = require('node-telegram-bot-api');
const products = require('./products');

const token = '8959796183:AAGePA-11JEJLNAnmY_GVrPuOt4FEX-lqvc';

const bot = new TelegramBot(token, { polling: true });

// دکمه اصلی برای هر محصول
function productButton(product) {
  return [{
    text: `🛒 خرید ${product.name}`,
    callback_data: `buy_${product.id}`
  }];
}

// منوی اصلی
function mainMenu() {
  return products.map(p => [{
    text: `${p.name} - ${p.price.toLocaleString('fa-IR')} تومان`,
    callback_data: `view_${p.id}`
  }]);
}

// وقتی /start بزنن
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    'سلام! 👋\nبه فروشگاه Ravand خوش اومدی.\n\nیکی از محصولات زیر رو انتخاب کن:', 
    {
      reply_markup: {
        inline_keyboard: mainMenu()
      }
    }
  );
});

// وقتی روی محصول کلیک کنن
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('view_')) {
    const productId = parseInt(data.split('_')[1]);
    const product = products.find(p => p.id === productId);

    if (product) {
      const caption = `📦 ${product.name}\n\n💰 قیمت: ${product.price.toLocaleString('fa-IR')} تومان\n\n📝 ${product.description}`;
      
      // ارسال عکس محصول
      bot.sendPhoto(chatId, product.image, {
        caption: caption,
        reply_markup: {
          inline_keyboard: productButton(product)
        }
      });
    }
  }

  if (data.startsWith('buy_')) {
    const productId = parseInt(data.split('_')[1]);
    const product = products.find(p => p.id === productId);

    if (product) {
      bot.sendMessage(chatId, 
        `✅ سفارش شما ثبت شد!\n\n` +
        `📦 ${product.name}\n` +
        `💰 ${product.price.toLocaleString('fa-IR')} تومان\n\n` +
        `برای تکمیل خرید، لطفاً به ادمین پیام بدید:\n` +
        `@Ravandtools\n\n` +
        `یا منتظر بمونید تا درگاه پرداخت فعال بشه.`
      );
    }
  }

  bot.answerCallbackQuery(query.id);
});

console.log('🤖 ربات Ravand فعال شد!');
