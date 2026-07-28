const TelegramBot = require('node-telegram-bot-api');
const products = require('../products');

const token = '8959796183:AAGePA-11JEJLNAnmY_GVrPuOt4FEX-lqvc';

const bot = new TelegramBot(token);

let userStates = {};
const orders = {};

function productButton(product) {
  return [{
    text: `🛒 خرید ${product.name}`,
    callback_data: `buy_${product.id}`
  }];
}

function mainMenu() {
  return products.map(p => [{
    text: `${p.name} - ${p.price.toLocaleString('fa-IR')} تومان`,
    callback_data: `view_${p.id}`
  }]);
}

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

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('view_')) {
    const productId = parseInt(data.split('_')[1]);
    const product = products.find(p => p.id === productId);

    if (product) {
      const caption = `📦 ${product.name}\n\n💰 قیمت: ${product.price.toLocaleString('fa-IR')} تومان\n\n📝 ${product.description}`;
      
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
      userStates[chatId] = { step: 'waiting_name', product: product };
      bot.sendMessage(chatId, 
        `✅ عالی! ${product.name} رو انتخاب کردی.\n\n` +
        `💰 مبلغ: ${product.price.toLocaleString('fa-IR')} تومان\n\n` +
        `لطفاً نام و نام خانوادگیت رو بفرست:`
      );
    }
  }

  bot.answerCallbackQuery(query.id);
});

bot.on('message', (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const state = userStates[chatId];

  if (state && state.step === 'waiting_name') {
    userStates[chatId].name = msg.text;
    userStates[chatId].step = 'waiting_phone';
    bot.sendMessage(chatId, '📱 شماره تماست رو بفرست:');
  }
  else if (state && state.step === 'waiting_phone') {
    userStates[chatId].phone = msg.text;
    userStates[chatId].step = 'waiting_address';
    bot.sendMessage(chatId, '📍 آدرست رو بفرست (شهر + آدرس کامل):');
  }
  else if (state && state.step === 'waiting_address') {
    const order = userStates[chatId];
    order.address = msg.text;
    
    const orderId = Date.now().toString();
    orders[orderId] = { ...order, status: 'pending' };
    
    bot.sendMessage(chatId, 
      `🎉 سفارشت ثبت شد!\n\n` +
      `📦 ${order.product.name}\n` +
      `👤 ${order.name}\n` +
      `📱 ${order.phone}\n` +
      `📍 ${order.address}\n` +
      `💰 ${order.product.price.toLocaleString('fa-IR')} تومان\n\n` +
      `⏳ منتظر تأیید ادمین باش...`
    );
    
    // ارسال به ادمین
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ADMIN_ID) {
      bot.sendMessage(ADMIN_ID, 
        `🔔 سفارش جدید!\n\n` +
        `📦 ${order.product.name}\n` +
        `👤 ${order.name}\n` +
        `📱 ${order.phone}\n` +
        `📍 ${order.address}\n` +
        `💰 ${order.product.price.toLocaleString('fa-IR')} تومان`
      );
    }
    
    delete userStates[chatId];
  }
});

module.exports = async (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(200).send('OK');
  }
};
