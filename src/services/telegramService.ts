/// <reference types="vite/client" />

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

const DEFAULT_CONFIG: TelegramConfig = {
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8698956553:AAFlptYgft-7uwrjX3OG9t-Bta_eAwXFh_4',
  chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '5738602587'
};

export async function sendTelegramNotification(message: string) {
  try {
    const url = `https://api.telegram.org/bot${DEFAULT_CONFIG.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: DEFAULT_CONFIG.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export function formatBookingMessage(booking: any, type: 'new' | 'update') {
  const statusEmoji = {
    pending: '⏳',
    confirmed: '✅',
    paid: '💎',
    cancelled: '❌'
  };

  const title = type === 'new' ? '🆕 <b>NEW BOOKING!</b>' : '🔄 <b>BOOKING UPDATED!</b>';
  
  return `${title}
--------------------------
👤 <b>Player:</b> ${booking.userName}
📞 <b>Phone:</b> ${booking.userPhone}
📅 <b>Date:</b> ${booking.date}
⏰ <b>Time:</b> ${booking.startTime} - ${booking.endTime}
💰 <b>Price:</b> ৳${booking.price}
💳 <b>Advance:</b> ৳${booking.advanceAmount || 0}
🏷️ <b>Status:</b> ${booking.status.toUpperCase()} ${statusEmoji[booking.status as keyof typeof statusEmoji] || ''}
--------------------------
📍 <i>Futsal Hive Arena</i>`;
}
