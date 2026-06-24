import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import { db } from './src/lib/firebase-server.js';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

export function initBot() {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN topilmadi, bot ishga tushmaydi.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log("Telegram bot ishga tushdi: @quizgen_pay_bot");

  // Xotirada foydalanuvchilarning holatini saqlash (rasm kutyaptimi yoki yo'q)
  const userStates = new Map<number, string>();

  bot.onText(/\/start(?:\s+(.+))?/i, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match ? match[1] : null;

    if (!userId) {
      bot.sendMessage(chatId, "Bot orqali to'lov qilish uchun avval saytimizga kirib, o'z hisobingizga kiring va u yerdagi havolani bosing.\n*(Shunda sizning hisobingiz aniqlanadi)*", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Saytga o'tish", url: "https://quizgen-3kjw.onrender.com" }]
          ]
        }
      });
      return;
    }

    userStates.set(chatId, userId);
    bot.sendMessage(chatId, "Assalomu alaykum!\n\nTarifni xarid qilish uchun quyidagi karta raqamiga to'lovni amalga oshiring:\n💳 Karta raqami: `9860 0121 1064 3454`\n\nTo'lovni amalga oshirgach, to'lov skrinshotini (cheyni) aynan shu yerga (botga) yuboring.", { parse_mode: "Markdown" });
  });

  // Admin ID ni osongina bilib olish uchun /id komandasi
  bot.onText(/\/id/i, (msg) => {
    bot.sendMessage(msg.chat.id, `Sizning Telegram ID raqamingiz: ${msg.chat.id}`);
  });

  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const pendingUserId = userStates.get(chatId);

    if (!pendingUserId) {
      bot.sendMessage(chatId, "Iltimos, avval saytdan kerakli tarifni tanlab, tugmani bosing.");
      return;
    }

    const photo = msg.photo ? msg.photo[msg.photo.length - 1] : null;
    if (!photo) return;

    try {
      const fileId = photo.file_id;
      const fileLink = await bot.getFileLink(fileId);
      
      // Firestore 'payments' kolleksiyasiga yozish
      const docRef = await addDoc(collection(db, 'payments'), {
        userId: pendingUserId,
        chatId: chatId,
        fileUrl: fileLink,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      if (adminChatId) {
        bot.sendPhoto(adminChatId, fileId, {
          caption: `Yangi to'lov tekshiruv uchun!\nFoydalanuvchi ID: ${pendingUserId}\nTo'lov ID: ${docRef.id}`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Tasdiqlash", callback_data: `approve_${pendingUserId}_${chatId}_${docRef.id}` },
                { text: "❌ Bekor qilish", callback_data: `reject_${pendingUserId}_${chatId}_${docRef.id}` }
              ]
            ]
          }
        });
        
        bot.sendMessage(chatId, "Rasm qabul qilindi. Adminga jo'natildi, tez orada javob yozamiz.");
      } else {
         bot.sendMessage(chatId, "Admin chat ID sozlanmagan.");
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.");
    }
  });

  bot.on('callback_query', async (query) => {
    if (!query.data || !query.message) return;
    const adminChatIdStr = query.message.chat.id;
    
    // Foydalanuvchiga xabar qaytarish va bazani yangilash uchun
    const [, userId, userChatIdStr, paymentId] = query.data.split('_');
    const userChatId = parseInt(userChatIdStr);

    try {
      if (query.data.startsWith('approve_')) {
        // Firebase da isPremium=true qilish va payments da status=approved qilish
        await updateDoc(doc(db, 'users', userId), {
          isPremium: true
        });
        await updateDoc(doc(db, 'payments', paymentId), {
          status: 'approved'
        });
        
        bot.sendMessage(userChatId, "🎉 Tabriklaymiz! To'lovingiz tasdiqlandi. Endi saytdan bemalol foydalanishingiz mumkin. Iltimos saytni yangilang.");
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: adminChatIdStr, message_id: query.message.message_id });
        bot.sendMessage(adminChatIdStr, "✅ Tasdiqlandi va Firebase bazaga yozildi.");
      } else if (query.data.startsWith('reject_')) {
        await updateDoc(doc(db, 'payments', paymentId), {
          status: 'rejected'
        });

        bot.sendMessage(userChatId, "❌ Kechirasiz, to'lovingiz tasdiqlanmadi. Qayta urinib ko'ring yoki adminga murojaat qiling.");
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: adminChatIdStr, message_id: query.message.message_id });
        bot.sendMessage(adminChatIdStr, "❌ To'lov bekor qilindi.");
      }
    } catch (error) {
      console.error("Tasdiqlashda xatolik:", error);
      bot.sendMessage(adminChatIdStr, "Bazaga yozishda xatolik yuz berdi.");
    }
  });
}
